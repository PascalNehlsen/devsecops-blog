---
id: falar
title: "Falar"
sidebar_label: "Falar"
sidebar_position: 1.6
description: "A speaking tutor for European Portuguese on OpenAI's Realtime API. The phone talks to the model directly; the backend owns the session, watches every call over a sideband connection, measures minutes by its own clock and fails closed when it cannot."
keywords: [voice ai, realtime api, ai platform engineering, llm security, cost control, react native, expo, django, gcp oauth]
---

# Falar

**A speaking tutor for European Portuguese.** You talk to Ana, a teacher from
Lisbon. She answers out loud, corrects you, and builds the next lesson around
the mistakes you keep making. A course from A0 to B2 as a journey through
Portugal, role plays from everyday life, and spaced review of your own errors.

:::info[Status · internal test on Google Play, private repository]
Released to internal testing on Google Play on 1 October 2026; two testers so
far, the closed test with outside testers is next, billing after that. The
repository is private. The article
[My server pays for a voice AI call it never hears](/blog/guard-the-call-you-never-hear)
walks through the security design.
:::

![Three screens of the app: the map of Lisbon with the next lesson, a lesson in progress with Ana and the target phrases, and the profile with the trial minutes left.](/img/blog/falar/screens.png)

## Architecture

```
Phone (Expo)  ──SDP offer──▶  Django backend  ──API key, session config──▶  OpenAI Realtime
     ▲                              │  ▲                                          │
     │                              │  └──────── sideband WebSocket (guard) ──────┤
     └───────────── audio + data channel, direct (WebRTC) ────────────────────────┘
Phone  ──exchange text──▶  backend  ──▶  text model (strict JSON)  ──▶  mistakes, vocabulary
```

Speech to speech, directly between phone and model: about one second per
turn, and the only setup in which the model hears the learner's
pronunciation instead of a transcript of it. The backend never sees the audio
and pays for all of it.

## Trust boundaries

| Component | Trusted with | Enforced by |
|---|---|---|
| App | an app token, its own microphone | nothing it sends is believed: config, duration and prompt all come from the server |
| Call broker | creating calls with the API key | budget check before every call; one call per user (row lock, the old call is hung up) |
| Guard | ending any call | sideband connection per call: hangs up on session changes, messages the app wrote, answers ordered with foreign settings, at the time limit, and when the sideband itself fails |
| Budget | what a call costs | the server's clock (`started_at`, `call_ended_at`); orphaned calls capped at the maximum length |
| Analysis model | proposing mistakes and words | strict JSON schema, unknown IDs ignored, `store=False`, HMAC `safety_identifier`; only extracted items are saved, never the exchange |
| Google sign-in (GCP) | linking an account | ID token verified for signature, expiry, audience (web client ID) and issuer; email only if verified |

## What is built

- **Course:** lessons per stop on a map (vocabulary, grammar, pronunciation,
  listening, discussion, checkpoints), role plays, a free conversation mode,
  four tutors with their own voice and character
- **Memory:** every correction becomes a review item; Ana weaves due items into
  later lessons, five correct uses in separate sessions count as learned
- **Accounts:** anonymous device account with trial minutes on first start,
  Google sign-in to keep progress, account deletion in the app
- **Limits:** per-call, daily and monthly minutes, a shared daily pool for all
  trial accounts, throttled account creation, an OpenAI project spend limit
- **Cost:** about 9.5 cents per conversation minute, measured, down from about
  14 (the tutor's past answers kept as text instead of audio, shorter turns, a
  per-answer token cap as an emergency brake)

![The four tutors to choose from: Ana, João, Dona Graça and Sr. Manuel, each with an age, a character and their own voice.](/img/blog/falar/tutors.png)

## Delivery

- Backend: Django, PostgreSQL, Docker Compose on a Hetzner server behind nginx
  with HSTS, the admin behind a second password and its own rate limit;
  multi-stage image with a numeric non-root user; daily database backup
- CI on every pull request; deploy after green CI on the main branch, with an
  SSH key limited to one script by a forced command and a read-only deploy key
  on the server
- App: Expo with EAS, over-the-air updates after merge, store releases by tag
- 122 backend tests, including the guard against a fake sideband
- Dependabot rules matched to Expo's SDK cycle

## Known gaps

- One narrow class of client request looks exactly like a legitimate turn
  from the sideband. Time limit, server-side budget and spend limit bound it;
  nothing closes it yet.
- Guards are threads in the web workers. A startup sweep and a sweeper
  container hang up calls whose guard died; a dedicated process would be
  cleaner before many concurrent calls.
- The numbers come from one week of development and internal testing.
- The app shows nothing when Google refuses a sign-in; fixed in the next
  update.
