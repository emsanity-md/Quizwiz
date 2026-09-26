/**
 * Copy for the two resources pages: the template gallery and the long-form
 * question bank guide. Content lives here so the page components are layout
 * only, and so the CSV column reference has one place to be kept true.
 */

export type QuizTemplate = {
  /** Stable id: the templates page anchors each card by it. */
  id: string;
  title: string;
  /** Who it is for, shown as a badge. */
  audience: string;
  /** Matches a label in CATEGORIES, so the picker can start on the right one. */
  category: string;
  questions: number;
  minutes: number;
  timed: boolean;
  summary: string;
  includes: string[];
};

export const QUIZ_TEMPLATES: QuizTemplate[] = [
  {
    id: "warm-up-five",
    title: "Warm-up five",
    audience: "Any session",
    category: "General Knowledge",
    questions: 5,
    minutes: 3,
    timed: false,
    summary:
      "Five short questions to settle a room before the real thing starts. Untimed, so nobody is still reading when the lesson begins.",
    includes: [
      "One question per topic, no repeats",
      "A short explanation on every answer",
      "A results summary you can read out",
    ],
  },
  {
    id: "exit-ticket",
    title: "Exit ticket",
    audience: "Classroom",
    category: "General Knowledge",
    questions: 3,
    minutes: 2,
    timed: true,
    summary:
      "Three questions, two minutes, one clear signal about whether the last hour landed. Built to be taken on a phone on the way out.",
    includes: [
      "Three minutes on the clock",
      "Questions pitched at recall, not recall-plus-reasoning",
      "Per-question results you can sort by who missed what",
    ],
  },
  {
    id: "end-of-unit-check",
    title: "End of unit check",
    audience: "Teaching",
    category: "Education (Math, English, and related courses)",
    questions: 20,
    minutes: 15,
    timed: true,
    summary:
      "A mixed set across the topics you have covered, ordered from sure to arguable so the last questions are the ones worth discussing.",
    includes: [
      "Twenty questions with a fifteen minute limit",
      "An explanation for every answer, right or wrong",
      "A breakdown that shows which topic fell over",
    ],
  },
  {
    id: "pre-exam-practice",
    title: "Pre-exam practice",
    audience: "Students",
    category: "General Knowledge",
    questions: 40,
    minutes: 30,
    timed: true,
    summary:
      "A full-length run at exam pace. Long enough to expose the questions you were hoping to skip.",
    includes: [
      "Forty questions at thirty minutes",
      "Exam weighting across the paper",
      "Explanations written for review, not for marking",
    ],
  },
  {
    id: "reading-comprehension",
    title: "Reading comprehension set",
    audience: "Teaching",
    category: "Education (Math, English, and related courses)",
    questions: 10,
    minutes: 12,
    timed: false,
    summary:
      "Ten questions built from a passage you supply. Useful for the texts that a generic model would happily invent its own version of.",
    includes: [
      "Questions grounded in your own text",
      "Distractors taken from the wrong parts of the passage",
      "Untimed, so rereading is allowed",
    ],
  },
  {
    id: "lab-safety-refresher",
    title: "Lab safety refresher",
    audience: "Workplace",
    category: "Engineering",
    questions: 12,
    minutes: 10,
    timed: true,
    summary:
      "The rules people nod along to and then forget. Mix recall with the judgement calls that actually cause incidents.",
    includes: [
      "Twelve questions on procedures and judgement",
      "A short per-question explanation for the record",
      "A pass mark you can set per attempt",
    ],
  },
  {
    id: "new-hire-baseline",
    title: "New-hire baseline",
    audience: "Onboarding",
    category: "Business and Management",
    questions: 15,
    minutes: 12,
    timed: false,
    summary:
      "Where a new starter sits on day one, in fifteen questions. Re-run it at ninety days and you have a comparison instead of a hunch.",
    includes: [
      "Fifteen questions across product and process",
      "The same set re-runnable later for comparison",
      "Per-question results, grouped by person",
    ],
  },
  {
    id: "product-certification",
    title: "Product certification",
    audience: "Customer success",
    category: "Computer Studies (IT/CS)",
    questions: 20,
    minutes: 15,
    timed: true,
    summary:
      "A scored pass for anyone who will be answering customer questions about the product. Results are per person and per question.",
    includes: [
      "Twenty questions with explanations attached",
      "Per-person scores for the record",
      "Question-level detail for anything under the pass mark",
    ],
  },
];

/* ------------------------------------------------------------------ guide -- */

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "code"; caption: string; code: string };

export type GuideSection = {
  /** Anchor id. Also builds the "on this page" list. */
  id: string;
  heading: string;
  blocks: GuideBlock[];
};

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "how-many",
    heading: "How many questions a quiz should have",
    blocks: [
      {
        type: "p",
        text: "The honest answer is: as many as the decision you need to make. A quiz that ends a lesson, a quiz that gates certification, and a quiz that keeps a class interested are three different objects, and they want different lengths.",
      },
      {
        type: "ul",
        items: [
          "Three to five questions: a warm-up, or an exit ticket. Nobody finishes this tired of it.",
          "Ten to fifteen questions: the default. Long enough to mean something, short enough that people finish in one sitting.",
          "Twenty to forty questions: practice, revision, and anything with a pass mark. Expect a drop in completion past about twenty-five.",
        ],
      },
      {
        type: "p",
        text: "Completion rate falls off a cliff as sets get longer, and the questions people drop are not random: they are the ones in the middle of a long stretch of similar material. If you need forty questions, cut the repetition rather than the clock.",
      },
    ],
  },
  {
    id: "question-types",
    heading: "The four question types worth using",
    blocks: [
      {
        type: "p",
        text: "Most of the value in a question bank comes from four shapes. Everything else is a variation you can ignore until one of these stops working for you.",
      },
      {
        type: "ul",
        items: [
          "Recall: what is it, what does it do. Cheap to write, easy to mark, and the baseline you cannot skip.",
          "Application: given this situation, what would you do. The closest thing to real work you can get in a quiz.",
          "Interpretation: what does this result mean. Separates people who memorised from people who understood.",
          "Judgement: which of these two is the better trade-off. The one worth sitting on the floor of a staff room for.",
        ],
      },
      {
        type: "p",
        text: "A set with all four feels different from a set that is ninety percent recall. Mix them, and put the recall first: it builds the confidence that makes people attempt the harder questions.",
      },
    ],
  },
  {
    id: "distractors",
    heading: "Distractors that do the work",
    blocks: [
      {
        type: "p",
        text: "A wrong option is only useful if someone could plausibly choose it. Distractors that are obviously wrong cost you a question without telling you anything, which is the most expensive kind of wasted question.",
      },
      {
        type: "ul",
        items: [
          "Use the mistake rather than a nonsense option. Off-by-one, reversed order, and the plausible-sounding generalisation all get chosen by real people.",
          "Keep every option the same shape and roughly the same length. A much longer option gives the answer away.",
          "Vary which position the answer sits in. If the answer is always third, the position is the answer.",
          "Never use “all of the above”. It rewards reading speed over knowledge.",
        ],
      },
    ],
  },
  {
    id: "explanations",
    heading: "Write the explanation for the person who got it wrong",
    blocks: [
      {
        type: "p",
        text: "The explanation is the part people read, and it is the part a generated draft most often needs from you. Write it to the person who just answered wrongly, not to the person who already knew.",
      },
      {
        type: "p",
        text: "Two or three sentences: why the answer is right, and why the tempting wrong option is wrong. If the same question is missed by a third of a group, that explanation is the revision material, not the report.",
      },
    ],
  },
  {
    id: "ordering",
    heading: "Order questions from sure to arguable",
    blocks: [
      {
        type: "p",
        text: "Put the questions you are certain about at the top and the ones that could be argued at the bottom. Two things happen: early questions build momentum, and the interesting disagreements collect at the end where you can discuss them instead of racing past them.",
      },
      {
        type: "p",
        text: "If a question has been argued about, it is either badly worded or genuinely a matter of opinion. Fix the wording. If it is genuinely a matter of opinion, it is a discussion, not a question.",
      },
    ],
  },
  {
    id: "importing",
    heading: "Bring a bank you already have",
    blocks: [
      {
        type: "p",
        text: "Upload a CSV or a JSON file and Quizwiz keeps the answers, the ordering, and the explanations you wrote. The only thing it will not do is invent an answer for a row that is missing one.",
      },
      {
        type: "table",
        head: ["Column", "Required", "What it does"],
        rows: [
          ["question", "yes", "The question text. One row per question."],
          ["options", "yes", "The choices, separated by a pipe: First | Second | Third"],
          ["answer", "yes", "The correct option as written, or its 1-based position."],
          ["explanation", "no", "Shown after the attempt. Worth filling in."],
          ["category", "no", "Groups the question in the results view."],
          ["difficulty", "no", "One of easy, medium, hard. Used to order the set."],
        ],
      },
      {
        type: "code",
        caption: "The first four rows of a bank, as CSV",
        code: `question,options,answer,explanation,difficulty
Which data structure is last-in first-out?,Stack | Queue | Heap | Graph,Stack,A stack returns the most recent item first. A queue is first-in first-out.,easy
What does a 404 mean?,200 | 301 | 404 | 500,404,The resource was not found. 200 is success and 500 is a server error.,easy
Which planet has the most confirmed moons?,Jupiter | Saturn | Uranus | Neptune,Saturn,Saturn passed Jupiter after new confirmations in 2025.,medium`,
      },
      {
        type: "p",
        text: "UTF-8, one header row, comma separated, pipes inside the options column. If a row imports without its explanation, the header on that file is probably spelled differently from the table above.",
      },
    ],
  },
  {
    id: "review",
    heading: "The five-minute review before you publish",
    blocks: [
      {
        type: "p",
        text: "The draft is a starting point. Five minutes of reading turns it into something you can put your name on.",
      },
      {
        type: "ul",
        items: [
          "Read every question once, out loud. Anything you stumble over, someone else will too.",
          "Delete anything you would not argue about. A question you are unsure of is a bad question.",
          "Check each explanation says why the answer is right, not just what it is.",
          "Move the hardest questions to the end.",
          "Give the quiz a five minute run yourself on a phone. That is roughly what your participants will do.",
        ],
      },
    ],
  },
];

export const GUIDE_CHECKLIST = [
  "Every question is one idea, not two",
  "No answer sits in the same position twice in a row",
  "Every explanation says why, not what",
  "The hardest question is last",
  "You have taken it once on a phone",
] as const;
