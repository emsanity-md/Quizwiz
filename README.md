# Quizwiz

Quizzes that tell you something worth knowing.

Quizwiz turns a topic, a document, or a bank of questions you already have into
a quiz you can send as a single link. Whoever it is sent to takes it in under a
minute without installing anything or making an account, and you get back a
per-question breakdown of what landed and what did not.

It is built for anyone who keeps needing to check understanding rather than
recall it: a teaching assistant building revision sets, an onboarding lead who
wants to find the question half the team got wrong, a team lead who would rather
ask four questions than hold another meeting.

## Status

The landing page, the quiz, and the brain teaser twister are all built. There
is no account system, no database, and nothing is stored between visits.

- `/` — the marketing page
- `/quiz` — name, pick a field or upload a PDF, choose a question count, answer,
  then get a full review with the reasoning behind every answer
- `/teasers` — two games behind one tab bar: **Twister**, seven lateral-thinking
  puzzles written fresh each round, and **Memory**, a sixteen-card matching game

Only the twister spends a key. The memory game is entirely client-side, costs
nothing, and never waits on a model.

Names and answers are used to render one result and then discarded. There is no
history, no leaderboard, and nothing to sign into.

## Stack

| Tool | Role |
| --- | --- |
| [Next.js 16](https://nextjs.org) | App Router, TypeScript, Turbopack, React 19.2 |
| [Tailwind CSS v4](https://tailwindcss.com) | CSS-first config, no `tailwind.config.js` |
| [shadcn/ui](https://ui.shadcn.com) | `base-nova` preset, on **Base UI** rather than Radix |
| [React Bits](https://reactbits.dev) | BlurText, CountUp, DotGrid, FadeContent, SpringCheck |
| [Motion](https://motion.dev) | animation runtime for the React Bits components |
| [GSAP](https://gsap.com) | ScrollTrigger and InertiaPlugin, pulled in by React Bits |
| [next-themes](https://github.com/pacocoursey/next-themes) | light and dark |
| [unpdf](https://github.com/Leslievin/unpdf) | text extraction from uploaded PDFs |

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run lint    # eslint
npm run build   # next build, also runs the typecheck
```

### Environment

`.env` is gitignored. Three variables:

| Variable | Purpose |
| --- | --- |
| `NVIDIA_API_KEY` | the NVIDIA NIM key. **Server only.** Never prefix it with `NEXT_PUBLIC_` |
| `QUIZ_TOKEN_SECRET` | 32+ random characters used to seal the answer key |
| `NVIDIA_MODEL` | optional, defaults to `nvidia/nemotron-3-super-120b-a12b` |

The key is only ever read inside `src/lib/quiz/nvidia.ts`, which is marked
`server-only` so importing it from a client component fails the build instead of
leaking it. The browser only ever talks to `/api/quiz/*`.

## How a quiz is generated

1. The browser posts the name, category, and count to `/api/quiz/generate`.
2. The server validates everything, caps the count at 100, and rate limits the
   caller by IP. None of the client's numbers are trusted.
3. Questions are written in batches, four batches in flight, each anchored to a
   different sub-topic so they do not repeat one another. The response is
   newline-delimited JSON, so progress streams to the page over a single request
   with nothing to poll and no job state to lose.
4. Every batch is parsed and checked field by field. A malformed batch is
   dropped and retried, never repaired — a half-valid question is worse than one
   fewer question.5. The answer key is encrypted with AES-GCM and returned as an opaque token. The
   questions sent to the browser have no `correctIndex` and no `explanation`.
6. On submit, the answers and the token go to `/api/quiz/review`. The server
   decrypts, grades arithmetically, and returns the full review. The question
   text in the review also comes from the token, so a tampered client cannot
   restyle a question to make a wrong answer look right.

### One pipeline, two flavours

`generate.ts` takes a `flavour`. `"exam"` and `"teaser"` share the batching,
parsing, validation, sealing and grading, and differ only in the prompt and the
batch size — exam questions run ten to a batch, riddles five, because riddles
are wordier and this one is meant to feel instant.

Brain teasers reveal the answer per question rather than at the end, so
`/api/teaser/reveal` opens the token and hands back **one** answer. The whole set
never lands on the page, and the player cannot read ahead.

### The memory game

Pure client side. No request, no key, no waiting. Its rules live in
`lib/memory/deck.ts` as plain functions with no React and no DOM, so the part
most likely to be subtly wrong — which card can be turned, what counts as a
pair, when the board is finished — is tested directly rather than clicked
through. Two invariants are enforced there rather than assumed by the component:

- `isPair` is false for the same index twice, so it cannot report a card as its
  own pair.
- `markMatched` also sets `revealed`, so a matched card is always face up no
  matter what order the caller turned and paired them in.

The shuffle takes an injectable `random`, which is what makes the deck
deterministic under test.

Every click goes through one pure function, `pickCard(cards, first, pending,
index)`, which returns the whole next state or `null` to be ignored. The case
that shapes the feel: **clicking a third card while a mismatch is still showing
commits that pair immediately** and takes the new card as the first of the next
attempt. An earlier version locked input during the mismatch window, which made
fast tapping feel like the game had frozen. Committing a stale pair does not
count as a move, so the score still only reflects genuine pair attempts.

### Model notes

Measured against the live endpoint, not assumed:

- `nvidia/nemotron-3-super-120b-a12b` is the default. The catalogue also lists
  `nvidia/nemotron-3.5-lightning-30b-a3b`, but it times out on a cold start, and
  most of the older Nemotron and Llama IDs now return 410 or 404.
- Four batches in flight gives 30 exam questions in about 20 seconds and 40 in
  about 80. Six in flight starts returning headers timeouts.
- The model occasionally opens with a preamble and burns the whole token budget
  before finishing a single question. Each batch therefore gets three attempts,
  and the retries ask for **half** as many questions, which is what actually
  fixes a truncated answer.
- One spare batch is always planned. Without it a seven question round is a
  single call, so one truncation loses the entire round.
- The model cannot be trusted with multi-clue deduction. Given two clues it
  writes a puzzle with no unique solution, and because the teaser rules forbid
  "cannot be determined" it then invents a confident wrong answer. That topic is
  left out of the teaser catalogue on purpose.

### Progress is real, not decorative

Batches are **streamed** and the tokens are counted as they arrive, so a batch
that is still being written counts towards the total. Before this, a ten question
quiz emitted exactly one progress event — at 100%, after half a minute of
nothing on screen. It now emits around 200, and the bar moves the whole time.

The reasoning tokens are counted even though they are not part of the answer,
because the model spends most of its time thinking before it writes a single
question; without them the bar would sit still for exactly that stretch.

Two honesty rules are enforced in the code:

- `BATCH_CEILING` stops a batch from appearing finished before it is, so the bar
  never claims progress that has not happened. It is capped at 0.94 and snaps
  home when the batch lands.
- Progress is reported at most every 120ms. Tokens arrive far faster than anyone
  can see a bar move, and every event re-renders the page.

A dead stream falls back to the whole-response call, which reports no progress
but still returns an answer, so a stream failure never costs the batch.

### Before deploying

- **Large quizzes need a long request timeout.** 100 questions takes roughly two
  to three minutes in one request. That exceeds the default on serverless
  Hobby. Either deploy somewhere with a longer ceiling or move generation to a
  background job with a queue.
- **Rate limiting is in-process.** It resets on restart and is per-instance, so
  on a serverless fleet it is a speed bump, not a wall. Swap
  `src/lib/quiz/rate-limit.ts` for Redis if the endpoint gets hammered. Note it
  runs *before* validation, so malformed requests cost quota too.
- **The PDF path reads the text layer only.** A scanned or image-only PDF has no
  text to extract, and the upload is refused with an explanation rather than
  quietly returning an empty quiz. Adding `nvidia/nemotron-parse-2.0` for OCR
  would cover that case.
- **No auth means an open meter.** Anyone who finds the endpoint can spend
  NVIDIA quota. The per-IP cap is the only thing in the way.


## Design

The brief was one typeface, two weights, one accent, no gradients, subtle
shadows, and whitespace doing the work. Most of that is enforced by the code
rather than left to taste, so it survives future changes.

### Rules

- **One typeface, two weights.** Geist Sans at 400 and 600.
  `--font-weight-medium` is remapped to 600 in `globals.css`, so a component
  default can never quietly introduce a third weight.
- **One accent.** Indigo, defined once as `--primary` and `--ring`. Neutrals are
  zinc. No gradients. The single soft fade on the page is a `mask-image` that
  dissolves the hero dot field, not a colour gradient.
- **One rhythm.** Every band on the page uses `Section` (`py-14 sm:py-20`) and
  `Container` (`max-w-5xl px-6`) from `components/landing/container.tsx`. Never
  hand-roll padding or a gutter. This was `py-20 sm:py-28` in a `max-w-6xl`
  container, which read as loose rather than airy once you scrolled past a
  screen. If it looks too airy again, change it in those two functions and
  nowhere else.
- **One reveal.** All scroll-in animation goes through `Reveal`. Stagger siblings
  with `delay`; do not introduce a second animation style.
- **Motion is optional.** Decoration is switched off under
  `prefers-reduced-motion` — in CSS for reveals, in a prop for counters. Do not
  add anything that can only be undone by JavaScript.
- **Links that look like buttons are anchors.** Use `buttonVariants()` from
  `@/components/ui/button` on a `next/link` `<Link>`. Do not pass
  `render={<a />}` to `Button`: Base UI defaults `nativeButton` to true, and
  setting it to false to silence the warning makes Base UI stamp
  `role="button"` over the link semantics.
- **The score is never called an IQ.** A score from a handful of generated
  questions is not a cognitive measurement, and a number labelled "IQ" gets read
  as one. The result is a score out of 100, a count of correct, incorrect and
  skipped, and a descriptive band (Advanced, Proficient, Developing,
  Foundational). The review says in as many words that it measures the attempt,
  not the person.

### One deliberate exception

- **`--success` is a second hue.** It exists for the correct-answer state, in the
  landing demo quiz and throughout the real quiz review, where right and wrong
  cannot be told apart by shape alone. Everything else is indigo and neutrals.

## Structure

```
src/
  app/
    layout.tsx           font, metadata, ThemeProvider, no-script styles
    globals.css          the whole design system: tokens, weights, motion rules
    page.tsx             band order for the landing page
    quiz/page.tsx        the quiz route
    teasers/page.tsx     the brain teaser twister
    api/quiz/
      generate/route.ts  validation, rate limit, streamed progress, sealed key
      review/route.ts    decrypt, grade, return the review
    api/teaser/
      reveal/route.ts    decrypt, hand back one answer
  components/
    landing/             one file per band of the landing page
      container.tsx      Section, Container, PROSE_WIDTH — the shared rhythm
      section-heading.tsx  the eyebrow/title/lead block every band opens with
      reveal.tsx         scroll-in animation, the only one on the page
    quiz/                one file per step of the quiz flow
      generating-progress.tsx  the shared wait screen, used by quiz and twister
      quiz-header.tsx    shared by both game pages: wordmark, theme, home
    teasers/             the tab bar, the twister flow, and its card and summary
    memory/              the matching game
    theme-provider.tsx
    theme-toggle.tsx    icon swaps on the `dark` class, nothing to hydrate
    BlurText · CountUp · DotGrid · FadeContent · SpringCheck    React Bits
    ui/                  shadcn/ui
  lib/
    site.ts              all landing page copy and data
    memory/deck.ts       the memory game's rules, pure and DOM-free
    quiz/
      categories.ts      the field catalogue and its sub-topics
      teasers.ts         the brain teaser catalogue
      nvidia.ts          the only reader of the API key, server-only
      generate.ts        batching, prompts, validation, dedupe, both flavours
      token.ts           AES-GCM sealing of the answer key
      score.ts           arithmetic grading and bands
      pdf.ts             PDF text extraction and limits
      rate-limit.ts      per-IP cap
      client.ts          browser side of the API, streams NDJSON
      types.ts           shared shapes and limits
    utils.ts             cn()
```

## Content

Landing page copy lives in `src/lib/site.ts`; the field catalogue and its
sub-topics live in `src/lib/quiz/categories.ts`. Page components hold no
strings, so rewriting either is a single-file job.

The landing page testimonials are invented and its footer links are `#`. Both
need replacing before this goes anywhere near a real audience.

