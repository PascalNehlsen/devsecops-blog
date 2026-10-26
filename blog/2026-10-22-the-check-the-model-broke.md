---
title: "My server checks every citation. The model broke the check three times."
slug: the-check-the-model-broke
date: "2026-10-22"
authors: [pascal]
description: "I built a NotebookLM clone where no answer reaches the user unless the server has found its quote in a passage retrieved for that question. The rule held. What broke was everything around it: a check so strict it threw away correct answers, a check that passed while the model leaked its own prompt delimiters, and an answer that vanished without a reason. Each one was found by the real model, none by the unit tests."
keywords: [rag, retrieval augmented generation, citations, grounding, llm security, prompt injection, llm evaluation, aws bedrock, ai platform engineering]
tags: [agents, devsecops]
image: /img/og/the-check-the-model-broke.png
---

# My server checks every citation. The model broke the check three times.

[nblm-clone](https://github.com/PascalNehlsen/nblm-clone) is a NotebookLM clone: upload sources, ask questions, get answers that cite the exact passage. It is [live](https://app.sec-nblm.dev), with a demo account that needs no sign-up. The app is the demo; the point is the platform around it, which the [project page](/docs/projects/nblm-clone) covers.

One rule matters more than any other in it. An answer may only show a claim if the server has found the claim's quote, character for character, in a passage that was retrieved for this question. The model proposes citations. The server decides.

That rule held. What broke, three times in the first two days after the first release, was everything around it.

<!-- truncate -->

![The login page of the app: "Frag deine Quellen. Jede Antwort zeigt, wo es steht." Below it an example question about Hansel and Gretel, the answer "Mit einem Häuschen aus Brot" with citation 1, and the source passage in old German spelling with the quoted words highlighted.](/img/blog/nblm/login.png)

## The check

Every turn, the server builds the prompt itself. Each retrieved passage sits in a block whose tag carries a random nonce, fresh per request:

```text
<quelle-9f3c1a0b7e24d615 nr="1">
... passage text ...
</quelle-9f3c1a0b7e24d615>
<frage-9f3c1a0b7e24d615>
Womit lockte die Hexe Hänsel und Gretel an?
</frage-9f3c1a0b7e24d615>
```

A source that contains `</quelle-1>` cannot close its own block, because it cannot know the nonce. The model sees block numbers, never database ids, and gets no tools. It is told to back every claim with a marker `[n: "exact quote"]`.

Then the server checks each marker. `n` must name a block retrieved for this turn. The quote must be a substring of that block. At most 20 markers, at most 2,000 characters each. Valid markers become `[1]`, `[2]` and a clickable passage; everything else is removed. An answer with no valid citation left is replaced by a fixed sentence: "Dazu finde ich in den Quellen keine Antwort." The model's own text is never stored in that case.

Nine prompt-injection cases replay hostile model output against this in the unit tests: forged quotes, a block number out of range, a quote from the wrong chunk, markers split across stream chunks, a Markdown image, a `javascript:` link. All of them pass. None of them is what went wrong.

## Break 1: the check threw away correct answers

At the first release, the demo notebook held a Grimm fairy tale in its original spelling: `daß`, `»...«`, `’`. On production, the evening of the first release, I asked the same question twice, with the same retrieval both times. The first answer was 62 tokens long, every citation was dropped, and the user saw the abstention. The second was 98 tokens with valid citations.

The model had quoted the passage and silently modernized it on the way: `dass` for `daß`, straight quotes for `»«`. To an exact substring check that is a fabricated quote. The check was right by its own definition and wrong for the user: a correct, sourced answer turned into "I can't find that in your sources".

I could not even see what the model had written. The app deliberately logs no prompt, source or answer text, so the log said only that citations were dropped, not why.

The fix compares both sides after one linear folding pass: whitespace runs become one space, every kind of quotation mark becomes `'`, dashes become `-`, `ß` becomes `ss`, soft hyphens and zero-width characters go. Case and diacritics stay strict. The exact check still runs first; the folded one only when it fails, and a folded match must start and end on character boundaries of the source.

The part that keeps the rule intact: **what gets stored and shown is the verbatim span from the source, never the model's text.** Every stored citation is still an exact substring of a retrieved passage. What changed is that the model's version no longer has to be one.

I rejected edit-distance matching. It would have fixed the Grimm case and accepted quotes the source never contained, which is the one thing the check exists to stop. And the log now counts drops per reason (`unknown_chunk`, `not_in_chunk`, `malformed`, `over_limit`) and folded matches, as numbers, so the next case can be diagnosed without logging what users read.

## Break 2: the check passed and the model leaked its delimiters

On develop, the model answered a question by first copying three source blocks verbatim, nonce and tags included, and then giving a correct answer with valid citations.

Every part of the citation check passed. The citations were real. And the user watched `<quelle-9f3c...>` scroll past in the stream, and the stored answer contained the nonce: the one value whose secrecy makes the block boundaries unforgeable.

The fix strips echoed blocks before the citation check runs, so a marker inside an echoed block is source text and never counts as a claim. The same rules run on the live stream, which is the harder half. The stream arrives in deltas, and a tag or a nonce can be split across two of them. So the filter holds back a `<` as long as it could still become a tag (at most 96 characters), and a trailing run of hex characters as long as it could still be the nonce. A number like `2024` at the end of a delta waits for the next character. That is a small, deliberate delay.

Both reviewers failed the first version of this fix, and both found the first problem independently. Lowercasing for the tag match used Unicode rules, and `"İ".toLowerCase()` is two characters long, so every index after a Turkish capital I pointed at the wrong place. Removing the nonce in a single pass let `<quel` + nonce + `le-1>` rebuild a tag. And the stream held 96 characters while the server accepted tags of about 270. The version that shipped lowercases ASCII only, removes nested nonces until the text is stable (at most eight passes), and bounds tags on both sides to the same length.

Then the eval went red, for the wrong reason. The live eval had been scoring the raw model text, because when I wrote it the raw text was exactly what the user saw. Now the filters removed the echo before anyone saw it, and the eval failed `cites-injection-text` with `raw:forbidden:<quelle-` for an output no user would ever see. The eval now scores three things: the stored answer, everything the stream actually emitted to the user, and every citation quote. An injection the model obeys still fails, because payloads, remote URLs, `javascript:`, the system prompt and the nonce are not removed by the filters. And the eval now tests the filters too: a regression that lets a block through fails the case.

## Break 3: an answer that vanished without a reason

On production, a URL source, the question "Was macht die Developer Akademie": the model streamed a plain, plausible answer with no citation marker at all. The log entry for that turn: 8 chunks retrieved, 0 citations, 0 dropped, abstained.

The server did what the rule says and replaced the answer with "Dazu finde ich in den Quellen keine Antwort." That was safe and it was false. The sources had been searched, the model had answered, it just had not backed the answer with a single quote. And the user had watched text appear and then turn into a sentence claiming there was nothing to find.

Now there are two fixed sentences. The abstention stays for "nothing retrieved" and "the model said so". An answer with no marker, or with every marker dropped, becomes "Ich konnte keine Antwort mit wörtlichen Zitaten aus den Quellen belegen.", with a notice under it that the text shown first was discarded because nothing in it was checked. The log and the eval report `ungrounded:no-marker` and `ungrounded:dropped` separately, so I can see how often the model skips citing instead of guessing.

The prompt also changed: the citation rule now comes before the abstention rule, it says that an answer without any marker is discarded, and it gives one fictional example of a correct marker. That costs about 60 input tokens per turn. If the develop eval keeps failing fact cases on `ungrounded:no-marker`, the next step is a different model or a constrained output format, not a weaker check.

## What the user sees before the check

The third break points at the design decision I kept, and it deserves to be said plainly: **the check runs after the stream.** For a moment, the user sees whatever the model writes, before the server has looked at a single marker.

That includes an answer that follows an instruction planted in a source and does not cite anything. The server will replace it when the turn ends, and it is never stored. But it was on the screen.

What limits it: the answer renders as plain React text, no HTML, no Markdown, so a planted link or image is inert characters. The Content-Security-Policy allows images only from the app's own origin. Echoed blocks and the nonce never reach the stream. And the replacement is not silent any more.

The alternative is to hold the stream until the first valid marker arrives. Then the user sees nothing they should not, and the answer appears only at the very end, which throws away the main reason to stream. I chose latency, and wrote the trade-off into the decision record, so it stays a decision and does not become an accident nobody remembers making.

## How it is held now

| Gate | What it checks | Where it runs |
|---|---|---|
| Security replay | 9 injection cases against canned hostile output | every PR, part of `pnpm test` |
| Live eval | 15 cases against the real model: 4 facts, 2 abstentions, 9 injections | after every deploy to develop |
| Release | a successful develop run for the tagged commit | before production |
| Canary | one real question against the staged production build | before promote |

The live eval is a hard gate: any security failure, or fewer than 5 of the 6 quality cases, turns the develop run red, and a commit without a green develop run cannot be released. Each run costs about 3 cents. The latest one on develop: security 9 of 9, quality 6 of 6.

None of the three breaks would have been caught by any of these at the time. The first came from me using the production demo, the second from reading a develop answer, the third from a production log line. What the gates do now is keep each one from coming back.

## Known gaps

- **One sample per case.** The eval runs each case once at temperature 0.2. A case that passes once can fail on the next run; a flaky quality case is rerun, a failed security case is read first.
- **Paraphrased echoes are not stripped.** `<Quelle 1>` or `[Quelle 1]` would show as text. Only the exact tag form is filtered.
- **Retrieval is not evaluated.** The eval gives each case all of its fixture chunks; whether vector search finds the right passage in a real notebook is not measured yet.
- **No conversation history.** Every question is answered alone, so a follow-up question has no context. It keeps forged history rows away from the model, and it is a real limitation.
- **One model.** Amazon Nova 2 Lite through Bedrock's EU inference profile. Everything here is tuned against its habits; another model would need the eval run again, not trusted.

## Scope

The repository is [public](https://github.com/PascalNehlsen/nblm-clone), and so are the decision records behind each fix: [0011](https://github.com/PascalNehlsen/nblm-clone/blob/main/docs/adr/0011-chat-with-checked-citations.md) (the check), [0016](https://github.com/PascalNehlsen/nblm-clone/blob/main/docs/adr/0016-normalized-citation-matching.md) (folding), [0018](https://github.com/PascalNehlsen/nblm-clone/blob/main/docs/adr/0018-echoed-source-blocks.md) (echoes), [0019](https://github.com/PascalNehlsen/nblm-clone/blob/main/docs/adr/0019-eval-scores-visible-text.md) (what the eval scores) and [0026](https://github.com/PascalNehlsen/nblm-clone/blob/main/docs/adr/0026-ungrounded-answer-notice.md) (the second sentence). The [live demo](https://app.sec-nblm.dev) creates an anonymous account with a copy of a demo notebook and deletes it after 24 hours.
