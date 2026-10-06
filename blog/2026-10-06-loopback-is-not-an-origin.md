---
title: "Bound to 127.0.0.1 and still reachable from every browser tab"
slug: loopback-is-not-an-origin
date: "2026-10-06"
authors: [pascal]
description: "Before making my Electron screen recorder public I hardened it: permissions by origin, no file: links to xdg-open, the local server bound to loopback. The next day the server still answered any web page in the browser. How DNS rebinding gets past 127.0.0.1, why an Origin check alone does not stop it, and the seven lines that do."
keywords: [electron security, dns rebinding, localhost, host header, origin header, mcp, threat modeling, devsecops, supply chain]
tags: [devsecops, agents]
image: /img/og/loopback-is-not-an-origin.png
---

# Bound to 127.0.0.1 and still reachable from every browser tab

On 5 October I made [CaptureDesk](https://github.com/PascalNehlsen/CaptureDesk) public. It is a small Electron app: Loom has no desktop client for Linux, and recording in the browser gives you no camera bubble that floats over other windows, no drawing on screen and no global shortcuts. CaptureDesk wraps Loom's Record SDK and adds them.

Before flipping the repository to public, I did a hardening pass and found three real problems. One of the fixes was binding the app's local server to `127.0.0.1` instead of every interface.

The next day I read it again and found that the server still answered any web page open in the user's browser. Binding to loopback had not closed that door. It had only made it narrower.

<!-- truncate -->

## What a recorder actually trusts

![CaptureDesk's main window: monitor, capture quality, camera size, background blur, desktop audio and the Loom app ID as settings, a large record button and a "Ready to record" status.](/img/blog/capturedesk/main-window.png)

A screen recorder is about the worst place to be casual about trust. It can see your screen, your camera and your microphone by design. And this one does not just run my code. It runs:

| Code | Where it comes from | What it can reach |
|---|---|---|
| My pages (main window, camera bubble) | a local Express server on `localhost` | the preload bridge, camera, microphone, screen |
| The Loom Record SDK | npm, proprietary, bundled into my page | everything my page can reach |
| Loom's own frames | `loom.com`, loaded into my page | camera, microphone, screen, cookies of the Loom session |
| Popups (Loom sign-in, OAuth pages) | whatever `window.open` asks for | the Loom session's cookies |
| The local server | `127.0.0.1:8080` | the app ID, the pages |
| The operating system | `shell.openExternal`, i.e. `xdg-open` | any registered URL handler |

The local server exists for a boring reason. Background blur runs MediaPipe's WebAssembly runtime, and fetching `.wasm` from a `file://` origin is blocked. `localhost` over HTTP counts as a secure context, so `getUserMedia` keeps working. It serves the pages and one endpoint, `/api/loom-token`, which hands the renderer the Loom app ID.

## The pass before going public

Three findings, each one a few lines of code, each one something a reviewer would have found in minutes.

**The screen went to any popup, without a prompt.** The permission handler granted camera, microphone and screen capture to every request in the Loom session. Sign-in pages and anything else opened through `window.open` live in that session. Screen capture does not show a picker here (the app picks the monitor itself), so a popup asking for the screen simply got it. Now the decision depends on who is asking:

```js
// Our own pages (served from the local server) and Loom.
function isTrustedMediaOrigin(rawUrl) {
  if (!rawUrl) return false;
  try {
    const { protocol, hostname, port } = new URL(rawUrl);
    if (protocol === "http:" && (hostname === "localhost" || hostname === "127.0.0.1")) {
      return Number(port) === PORT;
    }
    return protocol === "https:" && isLoomUrl(rawUrl);
  } catch {
    return false;
  }
}
```

It guards the permission request handler, the permission check handler and the display media handler. Three entry points, one rule, so they cannot drift apart.

**`window.open` handed any scheme to the desktop.** Non-web URLs went straight to `shell.openExternal`, which on Linux means `xdg-open`. A page in the Loom session could ask for `file:`, `smb:` or any custom scheme a local application has registered. Now only `mailto:` leaves the app; everything else is logged and denied.

**The server listened on every interface.** `app.listen(PORT)` without a host binds to all of them, so anyone on the same café Wi-Fi could fetch the pages and the app ID. The fix was one argument: `"127.0.0.1"`.

I committed those with the message "harden the app and the pipeline before going public", and that is where my confidence came from. It was the third fix that turned out to be incomplete.

## What was already right, and checked rather than assumed

Every window runs with `contextIsolation: true`, `nodeIntegration: false` and `sandbox: true`. The preload script exposes a narrow `electronAPI` to my own pages: window controls, recording lifecycle, drawing tools, a handful of settings. No file system, no shell, no arbitrary IPC channel. The setup window is a local file with `default-src 'none'`.

One question a reviewer would ask: popups are created with my base preferences and no preload script, but do they inherit the main window's preload anyway? If they did, any page that Loom opens would get `window.electronAPI`. I did not want to answer that from documentation, so I reproduced the exact pattern in a minimal Electron 44 app: main window with the preload, `setWindowOpenHandler` returning `overrideBrowserWindowOptions` with the base preferences only, then `window.open` from the page.

```
main window:  typeof window.electronAPI === "object"
popup:        typeof window.electronAPI === "undefined"
```

Popups do not inherit it. That claim is now a test result, not a belief.

## The one rule I weaken on purpose

The Loom SDK renders its UI by framing `loom.com` into my page. Loom's responses carry `X-Frame-Options` and a `frame-ancestors` directive that, sensibly, do not include `http://localhost:8080`. So the app rewrites those headers:

```js
// Only relax embed headers for Loom-owned pages that the SDK needs to load.
browserSession.webRequest.onHeadersReceived((details, callback) => {
  if (!isLoomUrl(details.url)) {
    callback({ responseHeaders: details.responseHeaders });
    return;
  }
  const headers = { ...details.responseHeaders };
  delete headers["x-frame-options"];
  delete headers["X-Frame-Options"];
  // ...and frame-ancestors becomes "*" in any Content-Security-Policy
  callback({ responseHeaders: headers });
});
```

This is the part of the codebase I would expect to be asked about, so here is the reasoning. Clickjacking protection exists to stop a hostile page from framing Loom inside a browser the user trusts. Inside this app, the only page that frames anything is mine, and the rewrite happens in one Electron session that no ordinary browser shares. It is scoped by hostname to Loom, it does not touch any other response, and it does not loosen anything else in the CSP. The cost is real but bounded: if a hostile page ever got into that session's top level, Loom would frame inside it. That is the same session where the permission check now refuses anything that is not my page or Loom.

Weakening a control is sometimes the job. Doing it silently, globally, or without saying what it costs is not.

## The one I missed

Binding to `127.0.0.1` decides which machine can connect. It says nothing about which web page made the request. Every page in the user's browser runs on the user's machine.

The browser's same-origin policy normally saves you: a page on `attacker.example` may send requests to `http://127.0.0.1:8080`, but it cannot read the answer. DNS rebinding removes that protection by making the attacker's own hostname point at your loopback address:

![A sequence across four parties. The browser resolves rebind.attacker.example to the attacker's server and loads a page with a script. The DNS answer has a one-second TTL; on the next lookup it resolves to 127.0.0.1. The script's fetch to /api/loom-token is now same-origin with the page and reaches the CaptureDesk server, carrying Host: rebind.attacker.example:8080. Before the fix the server answers 200 with the app ID; after it, 421.](/img/blog/capturedesk/dns-rebinding.svg)

After the switch, the page and the server share an origin as far as the browser is concerned: same scheme, same hostname, same port. The script reads the response like any other.

I did not want to describe this from memory either. Chromium can be told to resolve a name to an address with `--host-resolver-rules`, which gives exactly the state after the rebind without running a malicious DNS server. In Electron 44, a page served as `rebind.test:18081` by "the attacker", then `fetch("/api/loom-token")` going over the network to the real CaptureDesk server on `127.0.0.1:18081`:

```
before the fix   200 {"appId":"00000000-0000-0000-0000-000000000000","environment":"production"}
after the fix    421
```

The app ID in that test is a dummy. In real use it is the ID of the user's Loom developer app.

### How bad was it

Not very, in this instance, and that is worth saying plainly instead of dressing it up. The endpoint returns a Loom app ID, and an app ID is public: the setup screen tells users to copy the public ID and explicitly not the private key, which CaptureDesk never asks for.

![The CaptureDesk setup window: three steps to create a Loom developer app, copy its public app ID (not the private key) and paste it, an empty input field and the path of the config file it will be saved to.](/img/blog/capturedesk/setup-window.png)

The reason it still mattered: the server is the one component that any web page can reach, and the next endpoint someone adds will not be harmless. "This happens to be public" is a property of today's payload, not of the server.

### The fix

The request still carries the attacker's hostname in `Host`. That is the one header a rebinding page cannot change: browsers set it from the URL, and scripts are not allowed to.

```js
// Binding to 127.0.0.1 keeps the LAN out, but not a web page in the user's
// browser: DNS rebinding points an attacker's hostname at 127.0.0.1, and the
// browser then treats this server as same-origin with that page. The request
// still carries the attacker's hostname in Host, so only our own names pass.
const ALLOWED_HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`]);
app.use((req, res, next) => {
  if (!ALLOWED_HOSTS.has(req.headers.host)) {
    return res.status(421).end();
  }
  return next();
});
```

It runs before every route, static files included. `421 Misdirected Request` is the status for "this server is not the one that name refers to", which is precisely the situation. Every window in the app loads `http://localhost:${PORT}`, so nothing legitimate is affected:

| `Host` | Result |
|---|---|
| `localhost:18080` | 200 |
| `127.0.0.1:18080` | 200 |
| `attacker.example:18080` | 421 |
| `localhost` (no port) | 421 |
| `localhost.attacker.example:18080` | 421 |

The last row is why it is an exact match against a set and not a `startsWith("localhost")`.

### Why not CORS, CSP or an Origin check

**CORS** does not apply. After the rebind the request is same-origin; there is no cross-origin read to deny.

**CSP** on my pages controls what my pages may load. It has no say over who calls my server.

**An Origin check** is what most guidance recommends, and it is the subtle one. In the same test harness the browser sent:

```
same-origin GET    Origin: (none)
same-origin POST   Origin: http://rebind.test:18090
```

Browsers omit `Origin` on same-origin `GET` requests. A server that rejects foreign origins but lets requests without an `Origin` through (because curl and CLI clients do not send one) lets a rebound `GET` straight through. Check `Origin` when it is present, by all means. Check `Host` always.

## The same hole, in every local AI tool

This is not an Electron curiosity. It is the default shape of a lot of local tooling: dev servers, debug endpoints, and increasingly MCP servers that a coding agent talks to over HTTP. The MCP specification's Streamable HTTP transport puts it first in its security warning:

> Servers **MUST** validate the `Origin` header on all incoming connections to prevent DNS rebinding attacks

followed by binding to localhost and authenticating connections. All three are right. The harness above shows why the first one needs the qualifier: that transport also uses `GET` to open its server-to-client stream, and a same-origin `GET` arrives without any `Origin` to validate. A local MCP server that checks `Host` as well as `Origin` does not depend on which method the attacker picks.

If you run anything on `localhost` that your browser could reach, the question to ask is not "is it bound to loopback?" but "what does it do with a request whose `Host` it does not recognise?"

## The pipeline around it

The same review turned up four smaller things, all in CI rather than in the app:

- **Secret scanning ran with `--only-verified`.** That drops every finding TruffleHog cannot confirm live: a revoked key, a key for a service without a verifier, a check that ran while the provider was down. A revoked key in a public history still tells an attacker how keys get committed. It now reports all result types; a full-history scan with all of them finds nothing, so the stricter setting started green.
- **The dependency audit failed only on critical.** This site's own pipeline gates on high. CaptureDesk now does too, and a critical advisory for `proxy-addr` published the night before was in the lockfile already. Express pulled it in.
- **The weekly scan could never fail.** It ended in `npm audit || true`. An advisory published between two commits would have stayed green until the next push, which in a repository this quiet can be weeks. On the schedule it now gates on high and above. I had learned that exact lesson earlier the same morning on this site's own pipeline, where a Dependabot pull request merged on a check that was a day old ([the fix](https://github.com/PascalNehlsen/devsecops-blog/pull/66)).
- **Dependabot had failed every week since at least 23 September**, and nothing was looking. From 4.12 on, the Loom SDK asks for one version range of an Atlassian icon package as a peer, and for a second Atlassian package whose current releases need a newer range of the same icon package. npm cannot satisfy both. Minor and patch updates of the SDK are now excluded with that reason written next to the rule, and the alert for `uuid` 3.4.0 inside the SDK is closed as "vulnerable code not used": the only caller uses `v4()`, the advisory covers `v3`, `v5` and `v6` with a caller-supplied buffer, and no in-range fix exists.

## Known gaps

- **There is no automated test for the Host check.** I verified it by hand and in the browser harness; CI only syntax-checks. That is the next thing to change, because a security control without a test is a comment.
- **The IPC handlers do not check which frame sent a message.** Only my own windows have the preload, which the popup test confirms, so nothing else can call them today. A sender check would make that a rule instead of a consequence.
- **Popups share the Loom session**, including its cookies. That is needed for sign-in to work. They no longer get camera, microphone or screen.
- **Plain `http://` popups are allowed**, not only `https://`. They get nothing extra, but there is no reason to allow them.
- **The Loom SDK is proprietary code running in my renderer.** Everything above limits what it can reach. It does not make it my code.

## Scope

CaptureDesk is a personal tool, now public, used by me. It is not affiliated with Loom or Atlassian. It ships no prebuilt packages, because the SDK's beta agreement does not allow redistributing it; you build it yourself. The changes described here are in [pull request #19](https://github.com/PascalNehlsen/CaptureDesk/pull/19) (the pass before going public) and [pull request #20](https://github.com/PascalNehlsen/CaptureDesk/pull/20) (everything found the day after).
