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

**The landing page is done. The product is not built yet.**

Everything in `src/app` and `src/components/landing` is the marketing surface.
There is no auth, no quiz builder, no taking a quiz for real, no results storage,
and no persistence of any kind. The playable question in the demo section is
three hard-coded questions in `src/lib/site.ts` that reset when you click
"Next question" — it is there to show the shape of the product, not to be it.

Treat the demo quiz, the testimonials, and the footer links as placeholders to
replace rather than build on.

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

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run lint    # eslint
npm run build   # next build, also runs the typecheck
```

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
- **One rhythm.** Every band on the page uses `Section` (`py-20 sm:py-28`) and
  `Container` (`max-w-6xl px-6`) from `components/landing/container.tsx`. Never
  hand-roll padding or a gutter.
- **One reveal.** All scroll-in animation goes through `Reveal`. Stagger siblings
  with `delay`; do not introduce a second animation style.
- **Motion is optional.** Decoration is switched off under
  `prefers-reduced-motion` — in CSS for reveals, in a prop for counters. Do not
  add anything that can only be undone by JavaScript.
- **Links that look like buttons are anchors.** Use `buttonVariants()` from
  `@/components/ui/button` on a plain `<a>`. Do not pass `render={<a />} />` to
  `Button`: Base UI defaults `nativeButton` to true, and setting it to false to
  silence the warning makes Base UI stamp `role="button"` over the link
  semantics.

### Two deliberate exceptions

- **`--success` is a second hue.** It exists only for the correct-answer state
  in the demo quiz, where right and wrong cannot be told apart by shape alone.
  Everything else on the page is indigo and neutrals.
- **The `Start free` / `Start a quiz` buttons are `<button>`, not links.** There
  is no `/signup` route to point at yet, so they have nowhere to go. They become
  anchors the moment there is somewhere to send people.

## Structure

```
src/
  app/
    layout.tsx           font, metadata, ThemeProvider, no-script styles
    globals.css          the whole design system: tokens, weights, motion rules
    page.tsx             band order for the landing page
  components/
    landing/
      container.tsx      Section, Container, PROSE_WIDTH — the shared rhythm
      section-heading.tsx  the eyebrow/title/lead block every band opens with
      reveal.tsx         scroll-in animation, the only one on the page
      hero-text.tsx      BlurText, marked for reduced motion
      hero-texture.tsx   DotGrid, tinted per theme
      stat.tsx           CountUp
      *.tsx              one file per band
    theme-provider.tsx
    theme-toggle.tsx    icon swaps on the `dark` class, nothing to hydrate
    BlurText · CountUp · DotGrid · FadeContent · SpringCheck    React Bits
    ui/                  shadcn/ui
  lib/
    site.ts              all copy and page data
    utils.ts             cn()
```

## Content

All copy lives in `src/lib/site.ts` — nav, stats, steps, features, demo
questions, testimonials, FAQ, footer. Page components hold no strings, so
rewriting the landing page is a single-file job.

The testimonials are invented and the footer links are `#`. Both need replacing
before this goes anywhere near a real audience.
