---
id: capturedesk
title: "CaptureDesk"
sidebar_label: "CaptureDesk"
sidebar_position: 1.7
description: "An Electron recorder for Linux on the Loom Record SDK: camera bubble, drawing overlay, global shortcuts. Hardened around what it loads from elsewhere: permissions by origin, no non-web links to the desktop, a local server that rejects foreign Host headers."
keywords: [electron security, dns rebinding, localhost, screen recording, linux, loom sdk, threat modeling, devsecops]
---

# CaptureDesk

**A Loom recorder for Linux.** Loom has no desktop app for Linux, and recording
in the browser gives you no camera bubble over other windows, no drawing on
screen and no global shortcuts. CaptureDesk wraps the Loom Record SDK in an
Electron app that adds them. Videos upload to Loom as usual.

:::info[Status · public repository, personal use]
[github.com/PascalNehlsen/CaptureDesk](https://github.com/PascalNehlsen/CaptureDesk),
MIT for my code. Not affiliated with Loom or Atlassian. No prebuilt packages:
the SDK's beta agreement does not allow redistributing it, so it is built
from source. The article
[Bound to 127.0.0.1 and still reachable from every browser tab](/blog/loopback-is-not-an-origin)
covers the security review in detail.
:::

![CaptureDesk's main window: monitor, capture quality, camera size, background blur, desktop audio and the Loom app ID as settings, a large record button and a "Ready to record" status.](/img/blog/capturedesk/main-window.png)

## What it does

- Screen recording through the Loom SDK, uploaded to the user's Loom account
- A camera bubble above all windows: drag, scroll to resize, background blur
  computed locally with MediaPipe
- A drawing overlay (pen, highlighter, arrow, rectangle, eraser, undo)
- Floating controls with timer and pause, while the main window stays out of
  the video
- Global shortcuts for stop, pause and drawing; multi-monitor placement
- `.deb` and AppImage builds, X11 and Wayland (through XWayland, because
  native Wayland does not let an app position its own windows)

## What it trusts, and how far

A screen recorder sees the screen, the camera and the microphone by design,
and this one runs code it did not write. The last column is where each
boundary is enforced.

| Code | Origin | May reach | Enforced by |
|---|---|---|---|
| My pages | local server, `http://localhost:PORT` | a narrow preload bridge, camera, microphone, screen | `contextIsolation`, `sandbox`, no `nodeIntegration`; origin check on every media permission |
| Loom Record SDK | npm, proprietary, bundled into my page | what my page can reach | nothing beyond the page itself: this is the trust I extend to Loom |
| Loom frames | `https://*.loom.com` | camera, microphone, screen | origin check; framing headers relaxed for Loom hostnames only |
| Popups | anything `window.open` asks for | the Loom session's cookies | no preload (verified), no media permissions, non-web schemes denied except `mailto:` |
| Local server | `127.0.0.1:PORT` | pages and the public app ID | loopback bind and an exact `Host` allowlist (`421` otherwise) |

## Security review

Two passes, a day apart.

**Before going public** ([#19](https://github.com/PascalNehlsen/CaptureDesk/pull/19)):

- camera, microphone and screen capture went to any page in the Loom
  session, including popups, and screen capture had no prompt; now only to
  my pages and Loom, through one shared check
- `window.open` handed `file:`, `smb:` and custom schemes to `xdg-open`; now
  only `mailto:` leaves the app
- the local server listened on every interface; now on `127.0.0.1`
- actions pinned to commit SHAs, `permissions: contents: read`, `lodash`
  overridden past two high advisories, `nodemon` replaced by `node --watch`

**The day after** ([#20](https://github.com/PascalNehlsen/CaptureDesk/pull/20)):

- the loopback bind did not stop DNS rebinding: any page in the user's
  browser could read `/api/loom-token`. Reproduced in Chromium (Electron 44)
  before and after the fix: `200` with the app ID, then `421`
- dependency audit gates on high instead of critical, also on the weekly
  schedule, which previously ended in `|| true` and could never fail
- secret scanning reports unverified findings too
- Dependabot's npm runs had failed weekly on an unresolvable peer tree in the
  Loom SDK; that update is excluded with the reason written next to the rule

![The setup window: three steps to create a Loom developer app, copy its public app ID (not the private key) and paste it.](/img/blog/capturedesk/setup-window.png)

The app only ever asks for the **public** app ID of a Loom developer app,
never the private key. That is why the rebinding finding was low impact here,
and why it was still worth fixing: the server is the one component every
browser tab can reach.

## The deliberate trade-off

The SDK frames `loom.com` into a `localhost` page, which Loom's
`X-Frame-Options` and `frame-ancestors` forbid. CaptureDesk removes those
headers for Loom hostnames only, inside its own Electron session. Nothing
else in Loom's CSP is changed, and no ordinary browser shares that session.

## Pipeline

- CI: syntax checks for the JavaScript, shell and Python parts, `npm audit
  --audit-level=high`
- Security workflow on push, pull request and weekly: TruffleHog over the
  full history (all result types), blocking audit on the schedule, full
  advisory list as information
- Dependabot weekly for npm and GitHub Actions, actions pinned by SHA

## Known gaps

- No automated test for the `Host` check or the permission rules yet; CI
  only checks syntax.
- IPC handlers do not verify the sending frame. Only my own windows have the
  preload today, so this is a consequence, not a rule.
- Popups share the Loom session's cookies, which sign-in needs.
- Plain `http://` popups are still allowed.
- The Loom SDK is closed source running in my renderer. The controls above
  limit what it can reach; they do not make it auditable.
