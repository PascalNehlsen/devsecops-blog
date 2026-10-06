---
title: "My server pays for a voice AI call it never hears"
slug: guard-the-call-you-never-hear
date: "2026-10-06"
authors: [pascal]
description: "In my language-learning app the phone talks to OpenAI's Realtime API directly, so the audio never touches my backend, but the bill does. A modified app could rewrite the tutor into a free general-purpose assistant on my key. How a server-side guard on the sideband connection, a server-owned clock and a fail-closed sweep keep that bounded, and the one thing the guard cannot see."
keywords: [realtime api, voice agents, ai platform engineering, llm security, cost control, webrtc, sideband, threat modeling, devsecops]
tags: [agents, devsecops, cost]
image: /img/og/guard-the-call-you-never-hear.png
---

# My server pays for a voice AI call it never hears

Falar is a speaking tutor for European Portuguese. You talk to Ana, a teacher from Lisbon, and she answers out loud, corrects you, and remembers which mistakes you keep making. It has been in internal testing on Google Play since 1 October.

The architecture decision that shapes everything else: the phone talks to OpenAI's Realtime API **directly**, over WebRTC. My backend creates the call and holds the API key, but the audio never passes through it. That keeps the round trip near one second, and it is the only way I found that lets the model actually *hear* how a learner pronounces a word rather than read a transcript of it.

It also means the most expensive thing in the system runs on a device I do not control, on a connection I cannot see, billed to my account.

<!-- truncate -->

![The Falar map: a daily goal of 10 minutes, the A0 Lisbon unit with its stops, and the next lesson "Olá! Begrüßen und verabschieden" ready to start.](/img/blog/falar/map.png)

## What a modified app could do

The data channel of a Realtime call is not read-only. The client can send events on it, and the API cannot be told to refuse them. A patched APK (and an APK is easy to patch) could:

| Goal | How | Without a guard |
|---|---|---|
| Turn Ana into a general assistant | `session.update` with new instructions | my key, anyone's prompt |
| Remove the answer limit or add tools | `session.update` | unbounded answers, new capabilities |
| Inject its own prompt mid-call | `conversation.item.create` as `system` or typed `user` | same, one message at a time |
| Ask for answers with its own settings | `response.create` with other limits, or outside the conversation | the session's limits do not apply |
| Pay less | report a shorter call to my backend | the budget believes the app |

None of this needs the API key. The app only ever holds a token for my backend. The danger is that the call it is connected to is already paid for.

## The shape of the defence

![A diagram of four parts. The phone and OpenAI Realtime exchange audio and data-channel events directly; the backend never sees this. The phone sends its SDP offer and app token to the Django backend, which creates the call at OpenAI with its own instructions and limits and returns only the SDP answer. A guard thread in the backend holds a sideband WebSocket to the same call, sees the call's events and hangs up on rule breaks. The budget is measured by the server's clock.](/img/blog/falar/sideband-guard.svg)

Three rules, in order of how much I trust them.

**The server owns the configuration.** The app sends exactly one thing: its WebRTC SDP offer. The backend builds the session itself (instructions from the lesson plan, voice, answer limit, turn detection) and creates the call at OpenAI with its own key. The app gets back the SDP answer and nothing else. Even Ana's greeting is sent from the server, so that the app never writes to the prompt, not even legitimately. That turns out to matter for the next rule.

**The server watches the call from the side.** OpenAI lets the backend open a second connection, a WebSocket to the same call by its ID. It does not see the client's raw messages, but it sees every server event of the call, including the ones the client's actions cause: a changed session, a new item in the conversation, an answer being started. Each call gets a guard thread on that connection, and the guard hangs up on anything my app never does.

**The server keeps the clock.** Minutes are billed by when the call started and when the guard or the hang-up recorded its end. What the app reports is never used.

## What the guard checks

![A lesson starting: Ana greets the learner by name on a terrace in Lisbon, the lesson's target phrases are listed as chips, and the microphone button says it is the learner's turn. The greeting came from the server's guard, not from the app.](/img/blog/falar/lesson.png)

Because the app is designed to only ever *speak*, anything it *writes* is foreign by definition. That makes the rules short:

```python
if kind == "session.updated":
    # Only follows a session.update, and neither we nor our app send one.
    break  # hang up

if kind in ("conversation.item.added", "conversation.item.created") and foreign_item(item, ...):
    # system/developer messages other than our greeting, any typed user text,
    # assistant text we did not write ourselves
    break

if kind == "response.created" and foreign_response(response, answer_limit):
    break
```

The third check took a live test to get right. I needed to know what an answer *ordered by the client* looks like from the sideband, compared with an answer the server's turn detection started. On 2 October I sent both and compared the `response.created` events. Three fields give it away:

```python
def foreign_response(response: dict, answer_limit: int) -> bool:
    """Our answers always use the session's limit and audio, in the conversation."""
    return (
        response.get("conversation_id") is None          # out-of-band answer
        or response.get("max_output_tokens") != answer_limit
        or response.get("output_modalities") != ["audio"]
    )
```

And one rule about the guard itself: **an unguarded call is not allowed to run.** If the sideband cannot connect, or breaks off for any reason other than the call ending, the guard hangs up:

```python
except ConnectionClosed:
    return  # the app hung up: nothing left to guard
except Exception:
    logger.exception("Realtime guard failed, hanging up: call=%s", call_id)
hang_up(call_id)
```

The guard also enforces the time limit (30 minutes per call, plus a minute of grace) and records when the call ended, which is the number the budget uses.

## What the guard cannot see

There is a narrow class of client request that produces exactly the events a legitimate turn produces. Nothing the sideband sees differs, so no rule on the sideband can catch it.

I am not going to describe it more precisely while the app is in testing and paying for every minute. What matters for the design is what still holds when the guard is blind:

- **The call ends at its time limit.** The guard hangs up after 30 minutes regardless of what happened in them.
- **The budget is server-side.** Every minute counts against the user's daily and monthly allowance by the server's clock.
- **One call per user.** Starting a new call locks the user row and hangs up any open one first, so parallel calls cannot each spend the whole remaining budget.
- **Trials share one daily pool.** Anyone can create an account without signing in, so per-account limits would be meaningless. All trial accounts draw from a single daily pool of minutes; that pool is the upper bound for what trials cost per day, however many accounts someone scripts. Account creation is also throttled per IP (3 per hour, 10 per day), and behind nginx the throttle trusts only the last proxy hop in `X-Forwarded-For`.
- **The OpenAI project has a spend limit.** The last net, and the one I hope never to touch.

![The profile screen of a fresh trial account after one short test call: "Noch 9 von 10 Probeminuten", nine of ten trial minutes left, counted by the server's clock.](/img/blog/falar/profile.png)

The guard stops the cheap abuse at once. The budget stops the expensive abuse eventually. Neither alone would be enough.


## When the guard dies

The guard is a thread inside the web process. A deploy restarts that process, and every guard dies with it while its call may still be running.

So the container's entrypoint does this before it serves a single request:

```sh
python manage.py migrate --noinput
python manage.py createcachetable
python manage.py sweep_calls --startup   # hang up every call whose guard ended with the old process
exec gunicorn falar.wsgi ...
```

And a separate sweeper container runs the same command in a loop, every minute, for calls past the point where their guard would have hung up: the case where a worker dies without a deploy. An orphaned call is billed until the time the guard *would* have ended it, never longer, because the budget code caps an open session at the maximum call length plus grace.

## The model is an untrusted input too

After each exchange the app sends the text of what was said to the backend, and a small text model looks for mistakes and new vocabulary. That model's output goes into the database, so it gets the same treatment as user input:

- a strict JSON schema on the response, so the shape is enforced by the API rather than by hoping
- review item IDs the model returns are checked against the ones it was given; IDs it makes up are ignored
- `store=False` on the request, and a `safety_identifier` that is an HMAC of the user ID, so OpenAI can spot abuse per user without learning who the user is
- the exchange itself is not stored, only the extracted mistakes (the wrong form, the correct one, an explanation) and new words


## Sign-in, and the SHA-1 that was right but wrong

Accounts start anonymous: a device account with ten trial minutes, its token in the phone's encrypted store. To keep progress across devices you sign in with Google, through a Google Cloud project with two OAuth clients: a web client whose ID the backend checks tokens against, and an Android client that Google uses to recognise the app.

![The onboarding: Ana introduces herself, asks for a first name and the learner's level. At this point the app already runs on an anonymous device account with ten trial minutes.](/img/blog/falar/intro.png)

The backend check is the standard one, and the standard mistake is to skip a part of it. `verify_oauth2_token` checks signature, expiry and that the audience is my web client ID; the issuer is checked explicitly; an email is only taken over if Google marks it verified. Tokens for my backend are stored hashed and expire after 180 days without use.

The part that went wrong was not code. Sign-in worked in the development build and failed silently in the first build from the store. The Android OAuth client carried the SHA-1 of my **upload** key. Google Play re-signs every app with its own **app signing** key, and that is the certificate the device presents. The fix was one fingerprint in the Cloud console. The lesson was that the app showed nothing at all when Google refused, which looked exactly like the user cancelling; the next update makes that failure visible.

## Delivery

The backend runs in Docker Compose on a small Hetzner server behind nginx (HSTS, no version banner, the admin behind a second password and its own rate limit). The image is multi-stage, runs as a numeric non-root user and was rebuilt after Trivy findings. Deploys happen after green CI on the main branch, and the SSH key the pipeline uses can run exactly one script on the server (a forced command with `restrict`); the server pulls the commit with a read-only deploy key. The app ships over-the-air updates after merge and store releases by tag.

Among the 122 backend tests are the budget, the call broker and the guard, the guard against a fake sideband: instruction change, any session change, messages written by the app, answers ordered by the app, and a sideband that fails.

## Known gaps

- **The blind spot above.** Bounded by time, budget and spend limit, not closed.
- **Guards live in web workers.** The sweep covers their death, but a dedicated process per call would be cleaner, and I would want it before a large number of concurrent calls.
- **A week of numbers.** Everything here comes from development, internal testing and one live test of the detection fields. The closed test with outside testers has not started yet.
- **The cost picture is its own post.** A minute with Ana currently costs about 9.5 cents, measured, after cutting it from about 14. How (and why a cheaper pipeline of speech recognition, text model and speech synthesis was rejected even at a tenth of the price) is the next write-up.

## Scope

Falar is my own product, in internal testing on Google Play with two testers so far. No paying customer uses it yet; billing is the next phase. The repository is private. The design is described here because the problem is not specific to language learning: any app that hands a client a live connection to a paid model, voice or otherwise, owns the question of what that client is allowed to say on it.
