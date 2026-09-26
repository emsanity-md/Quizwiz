/**
 * Every string of landing page copy lives here so the page components stay
 * presentational. Swap the placeholder testimonials and `#` links for real
 * content as it exists.
 */

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Take a quiz", href: "/quiz" },
  { label: "Brain teasers", href: "/teasers" },
] as const;

export const STATS = [
  { value: 1200000, suffix: "+", label: "Questions answered" },
  { value: 48000, suffix: "", label: "Quizzes published" },
  { value: 94, suffix: "%", label: "Average completion rate" },
] as const;

export const STEPS = [
  {
    title: "Bring the topic",
    body: "Type a subject or drop in a PDF. Quizwiz drafts the first set of questions for you to edit, reorder, or throw away.",
  },
  {
    title: "Send one link",
    body: "Publish when it reads right. Anyone, on any device, can take the quiz without installing a thing.",
  },
  {
    title: "See what stuck",
    body: "Attempts stream in while people take it, with a per-question breakdown of what landed and what did not.",
  },
] as const;

export const FEATURES = [
  {
    icon: "sparkles",
    title: "A first draft in seconds",
    body: "Give it a topic or a document and get a balanced set of questions to shape, not a blank page.",
  },
  {
    icon: "link",
    title: "One link to share",
    body: "Every quiz lives at its own URL and works on any device. No installs, no accounts for the people taking it.",
  },
  {
    icon: "chart",
    title: "Results as they land",
    body: "Watch attempts arrive in real time and see which questions everyone got right, or everyone got wrong.",
  },
  {
    icon: "upload",
    title: "Bring your own questions",
    body: "Import an existing bank from CSV or JSON and keep the answers, ordering, and explanations you already wrote.",
  },
  {
    icon: "timer",
    title: "Timed or untimed",
    body: "Put a clock on each question for a classroom, or leave it off and let people think it through properly.",
  },
  {
    icon: "palette",
    title: "Make it look like yours",
    body: "Swap the accent and the wordmark so the quiz reads as something you made, not something you sent.",
  },
] as const;

export type SampleQuestion = {
  question: string;
  options: readonly string[];
  answer: number;
  explanation: string;
};

/** Drives the playable question in the demo section. */
export const SAMPLE_QUESTIONS: readonly SampleQuestion[] = [
  {
    question: "In HTTP, which status code means “Not Found”?",
    options: ["200", "301", "404", "500"],
    answer: 2,
    explanation:
      "404 is returned when the server cannot find the requested resource. 200 is a success, 301 is a redirect, and 500 is a server error.",
  },
  {
    question: "Which data structure hands back the most recent item first?",
    options: ["Queue", "Stack", "Heap", "Graph"],
    answer: 1,
    explanation:
      "A stack is last-in, first-out. A queue is the opposite: first-in, first-out, like a line at a counter.",
  },
  {
    question: "Which planet in our solar system has the most confirmed moons?",
    options: ["Jupiter", "Uranus", "Saturn", "Neptune"],
    answer: 2,
    explanation:
      "Saturn overtook Jupiter after a run of new confirmations in 2025 and now holds the record by a wide margin.",
  },
];

/** Placeholder quotes. Replace with real people before shipping. */
export const TESTIMONIALS = [
  {
    quote:
      "I stopped writing revision sheets by hand. The questions are close enough to mine that I only spend time on the ones that are off.",
    name: "Priya Raman",
    role: "Teaching assistant, biology",
  },
  {
    quote:
      "The per-question breakdown is the part I did not know I needed. One question was quietly confusing half the group and we fixed it in a day.",
    name: "Tomas Weber",
    role: "Head of onboarding, logistics",
  },
  {
    quote:
      "It takes about four minutes to put a quiz together now. That is short enough that I actually do it before every session.",
    name: "Maya Okafor",
    role: "Team lead, customer success",
  },
] as const;

export const FAQS = [
  {
    question: "Do I have to write every question myself?",
    answer:
      "No. You can start from a topic or a document and edit the draft, or import a bank you have already written. Either way the wording is yours before anyone sees it.",
  },
  {
    question: "What happens to a quiz after I publish it?",
    answer:
      "It stays live at the same link. You can close it to new attempts whenever you like, and the results stay available to you.",
  },
  {
    question: "Do the people taking my quiz need an account?",
    answer:
      "They do not. A quiz is a single link, so someone can take it from a phone in under a minute without signing up for anything.",
  },
  {
    question: "Is it free?",
    answer:
      "There is a free tier that covers small quizzes. Paid plans add larger question banks, custom branding, and the full results history.",
  },
] as const;

export const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Take a quiz", href: "/quiz" },
      { label: "Brain teasers", href: "/teasers" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Question bank guide", href: "#" },
      { label: "Quiz templates", href: "#" },
      { label: "Help centre", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
] as const;
