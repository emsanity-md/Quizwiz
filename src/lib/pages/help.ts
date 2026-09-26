/**
 * Copy for the help centre. Same reasoning as site.ts: the page component stays
 * presentational and the words can be rewritten without touching layout.
 *
 * The answers describe how the app behaves today. If a plan limit or a flow
 * changes, this is the file to change first.
 */

export type HelpArticle = {
  question: string;
  answer: string;
};

export type HelpGroup = {
  /** Anchors the group, so the page can link straight to a section. */
  id: string;
  title: string;
  blurb: string;
  articles: HelpArticle[];
};

export const HELP_GROUPS: HelpGroup[] = [
  {
    id: "getting-started",
    title: "Getting started",
    blurb: "From an empty page to a link you can send.",
    articles: [
      {
        question: "What do I need to make my first quiz?",
        answer:
          "A topic or a document. Type a subject and Quizwiz drafts the first set of questions; drop in a PDF and it reads that instead. Either way the wording is yours before anyone sees it.",
      },
      {
        question: "How long does a draft take?",
        answer:
          "Usually a few seconds once a topic is chosen. Longer documents take a little longer, and a progress bar keeps you informed rather than leaving you guessing.",
      },
      {
        question: "Can I use a document I already have?",
        answer:
          "Yes. Upload a PDF and the draft is built from what is in it. Split a very long document into sections first, otherwise one quiz has to carry the whole thing.",
      },
      {
        question: "Do the people taking my quiz need an account?",
        answer:
          "No. A quiz is a single link, so someone can start it from a phone in under a minute without signing up for anything or installing an app.",
      },
    ],
  },
  {
    id: "writing-questions",
    title: "Writing questions",
    blurb: "The wording does more work than the model does.",
    articles: [
      {
        question: "How many questions should a quiz have?",
        answer:
          "Ten to fifteen for anything you want a decision from. Longer sets suit practice and revision; shorter sets suit a warm-up or an exit ticket. See the question bank guide for the reasoning.",
      },
      {
        question: "Should every question be multiple choice?",
        answer:
          "Multiple choice is the default because it is the easiest to mark and the easiest to read on a small screen. True or false works well for recall, and short answers are worth it when the wording matters more than the marking.",
      },
      {
        question: "Do explanations matter?",
        answer:
          "They matter more than the questions do. An explanation is what turns a score into something a person can act on, and it is the part a generated draft most often needs from you.",
      },
      {
        question: "Can I import questions I have already written?",
        answer:
          "Yes. Upload a CSV or JSON bank and Quizwiz keeps the answers, ordering, and explanations you wrote. The expected column format is in the question bank guide.",
      },
    ],
  },
  {
    id: "sharing-and-results",
    title: "Sharing and results",
    blurb: "Getting it in front of people, and reading what comes back.",
    articles: [
      {
        question: "How do I share a quiz?",
        answer:
          "Copy the link and send it however you like: email, chat, a message, or printed on a handout. Every published quiz has its own address that works on any device.",
      },
      {
        question: "Can I close a quiz once it has run?",
        answer:
          "Yes. Closing a quiz stops new attempts at any time. The attempts already recorded stay available to you, so you can still look at the breakdown afterwards.",
      },
      {
        question: "What do the results tell me?",
        answer:
          "A score per attempt, and a per-question view of what everyone got right or wrong. That second one is the useful part: one question that half the group missed is usually a question worth rewriting.",
      },
      {
        question: "Do results update while people are taking it?",
        answer:
          "They do. Attempts stream in as they land rather than arriving in one batch at the end, so you can watch a live session without refreshing.",
      },
      {
        question: "Can I see who took it?",
        answer:
          "Attempts carry the name the participant typed, if they gave one. We do not ask for an email address, and we do not try to identify anyone who would rather stay anonymous.",
      },
    ],
  },
  {
    id: "plans-and-limits",
    title: "Plans and limits",
    blurb: "What is included, and where the edges are.",
    articles: [
      {
        question: "Is it free?",
        answer:
          "There is a free tier that covers small quizzes. Paid plans add larger question banks, custom branding, and the full results history.",
      },
      {
        question: "How large can a question bank get?",
        answer:
          "On the free tier a quiz is capped so it stays quick to take. Paid plans lift that cap and keep the whole history of results for every quiz you publish.",
      },
      {
        question: "Can I use my own branding?",
        answer:
          "Yes, on a paid plan. Swap the accent colour and the wordmark so the quiz reads as something you made rather than something you sent to someone.",
      },
      {
        question: "How do I change or cancel my plan?",
        answer:
          "From the billing page on your account, at any time. Downgrades take effect at the end of the current period, and nothing you have already published disappears.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    blurb: "The things that go wrong most often.",
    articles: [
      {
        question: "My PDF did not produce any questions",
        answer:
          "Scanned PDFs without a text layer cannot be read. Run it through OCR first, or type the topic instead. Password-protected files are rejected for the same reason.",
      },
      {
        question: "Generation stopped halfway",
        answer:
          "Very large documents can exhaust the per-quiz limit. Split the document, ask for fewer questions, or import a bank you have already split up yourself.",
      },
      {
        question: "A question is worded badly",
        answer:
          "Edit it. The draft is a starting point rather than a finished quiz, and editing the wording is the single most useful thing you can do before publishing.",
      },
      {
        question: "Someone cannot open my link",
        answer:
          "Check the quiz is still published, then ask them to open it in a private window. If it still fails, run the same questions again and watch which one comes back empty — that is usually the one that is actually broken.",
      },
    ],
  },
];
