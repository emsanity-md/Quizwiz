/**
 * Copy for the Terms & Conditions and the Privacy Policy.
 *
 * Same reasoning as the other page content: the page component stays
 * presentational and the words can be rewritten without touching layout.
 *
 * These describe how the app actually behaves today. If a promise made here
 * stops being true, this is the file to change first.
 */

import { formatDate } from "./format";

/**
 * The version of the terms.
 *
 * It goes into the gate proof, so when the words change the version changes
 * with them and every old proof stops verifying. Everyone is asked to accept
 * the new terms instead of carrying on with the old ones.
 */
export const TERMS_VERSION = "2026-10-20";

/** The date shown at the top of both documents. */
export const TERMS_EFFECTIVE = "2026-10-20";

/** Where questions about either document should actually go. */
export const CONTACT_EMAIL = "hello@quizwiz.com";

export type LegalSection = {
  /** Used for a deep link to the section. */
  id: string;
  title: string;
  /** The paragraphs. */
  body: string[];
  /** An optional list, after the paragraphs. */
  points?: string[];
};

export type LegalDocument = {
  eyebrow: string;
  title: string;
  lead: string;
  /** One muted line under the title: the date and the version. */
  note: string;
  sections: LegalSection[];
};

export const TERMS: LegalDocument = {
  eyebrow: "Legal",
  title: "Terms & Conditions",
  lead: "The agreement between you and Quizwiz, in plain words. The parts that matter are the ones written out rather than the ones left out.",
  note: `Effective ${formatDate(TERMS_EFFECTIVE)}. Version ${TERMS_VERSION}.`,
  sections: [
    {
      id: "what-it-is",
      title: "What Quizwiz is",
      body: [
        "Quizwiz writes questions for you. You give it a topic or a document, and it returns a set of multiple choice questions with answers and explanations. That is the whole product.",
        "There is no account, no dashboard, and no way for us to see what you made. Everything below is either a promise about how we handle what you give us, or a limit on what we can promise.",
      ],
    },
    {
      id: "who-may-use-it",
      title: "Who may use it",
      body: [
        "You must be at least 18 years old, and you must accept these terms and the privacy policy before you use the service. We ask for your date of birth once, check it, and throw it away: it is never stored and never attached to anything.",
        "If you are under 18, do not use Quizwiz.",
      ],
      points: [
        "You need to be 18 or older.",
        "You need to accept both this document and the Privacy Policy.",
        "The age check is self reported. We cannot verify it, and pretending to be older is not something we are able to catch.",
      ],
    },
    {
      id: "your-content",
      title: "Your content",
      body: [
        "What you upload stays yours. We read the text out of your document, send the part of it needed for each batch to the AI provider, and discard it once the questions are written.",
        "We do not claim ownership of your documents, we do not sell them, and we do not use them to train models. We keep no copy of what you uploaded.",
      ],
    },
    {
      id: "the-questions",
      title: "What the questions are",
      body: [
        "The questions are written by a machine. They will sometimes be wrong, sometimes clumsy, and occasionally confidently wrong. Read them before you use them.",
        "Quizwiz is a drafting tool, not an authority. If a question matters, check it. You are responsible for what you publish, and for the fact that whoever takes your quiz will treat it as correct.",
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      body: ["We would rather say this plainly than leave it to be inferred."],
      points: [
        "Do not use Quizwiz to produce unlawful content.",
        "Do not use it to impersonate someone else, or to misrepresent who wrote something.",
        "Do not upload material you do not have the right to upload.",
        "Do not use the service in a way that overwhelms it, or that gets around the limits we set on it.",
      ],
    },
    {
      id: "availability",
      title: "Availability and changes",
      body: [
        "We aim to keep Quizwiz running, but we do not promise it will be there tomorrow. We change the model, the limits and the features as we need to.",
        "When we make a change that matters to you, the version number at the top of this page changes with it, and you are asked to accept the new terms before you carry on.",
      ],
    },
    {
      id: "liability",
      title: "Liability",
      body: [
        "Quizwiz is provided as it is. To the fullest extent the law allows, we are not liable for anything that comes from relying on a generated question, from the service being unavailable, or from your use of it.",
        "Nothing here limits a liability that the law says cannot be limited.",
      ],
    },
    {
      id: "ending-it",
      title: "Ending it",
      body: [
        "You can stop using Quizwiz whenever you like. There is nothing to cancel and nothing to close.",
        "We can stop offering the service, and we can block use of it that is unlawful or that is harming the service for other people.",
      ],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      body: [
        "We may update these terms. When we do, the version and the date change here, and you are asked to accept the new terms the next time you use the service.",
        "Carrying on after that means you accept them.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      body: [
        `Questions about these terms can go to ${CONTACT_EMAIL}. If that address is wrong, it is wrong here and not somewhere else.`,
      ],
    },
  ],
};

export const PRIVACY: LegalDocument = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  lead: "What we collect, what we do with it, and what we deliberately do not collect. The short version is that we collect almost nothing.",
  note: `Effective ${formatDate(TERMS_EFFECTIVE)}.`,
  sections: [
    {
      id: "short-version",
      title: "The short version",
      body: [
        "Quizwiz has no accounts. We do not ask for your name, your email address, or a password.",
        "The only things we hold are a short signed note saying you are over 18 and have accepted these terms, and a note saying whether you picked the light or the dark theme. There is no database of users, because there are no users.",
      ],
    },
    {
      id: "what-we-collect",
      title: "What we collect",
      body: [],
      points: [
        "Your date of birth. You type it into the age check. We work out whether you are over 18 and then discard it. It is not stored, not logged, and not sent anywhere else.",
        "The gate note. A small signed cookie saying you are over 18 and have accepted these terms, with the version you accepted and the date. It expires after a year.",
        "Your theme. A cookie saying light or dark, so the site does not flash white at someone who prefers dark. It never leaves your browser.",
        "Your document. If you upload a PDF, its text is read so the questions can be written from it. The part sent for each batch goes to the AI provider and is not kept by us afterwards.",
      ],
    },
    {
      id: "what-we-do-not-collect",
      title: "What we do not collect",
      body: [],
      points: [
        "No name, no email address, no password, no account.",
        "No analytics, no advertising identifiers, no tracking pixels.",
        "No record of the quizzes you make or the answers you give.",
        "No copy of the documents you upload.",
      ],
    },
    {
      id: "the-ai-provider",
      title: "The AI provider",
      body: [
        "The questions are written by a model we do not own. To write them, we send the provider the topic you chose, or the text from your document, along with the instructions for the questions. That is the only purpose it is sent for.",
        "The provider's own handling of it is governed by their terms rather than ours. If you would rather your document did not leave our server, do not upload it.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies",
      body: [
        "Two cookies, both set by this site, both first party: the gate note and the theme note.",
        "There are no advertising cookies, no third party cookies, and no cross-site tracking. Clearing your browser data clears both, and you will be asked your date of birth and to accept these terms again.",
      ],
    },
    {
      id: "how-long",
      title: "How long we keep things",
      body: [
        "The gate note for a year, after which it is replaced with a fresh one when you next agree.",
        "The theme note until you clear it.",
        "Your date of birth for as long as it takes to check it, which is a single request.",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights",
      body: [
        "Depending on where you are, you have the right to see what we hold about you, to have it deleted or corrected, to object to how we use it, and to complain to your data protection regulator.",
        "Because we hold almost nothing and no account exists, most requests are answered by deleting a cookie. If you would like everything gone, clear your browser data for this site or write to us.",
      ],
    },
    {
      id: "children",
      title: "Children",
      body: [
        "Quizwiz is not for anyone under 18, and we do not knowingly collect anything from a child. The age check exists so that this is true rather than merely intended.",
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: [
        "If this policy changes, the date at the top changes with it and the new version goes into the gate note, so you are asked to accept it again before you carry on.",
      ],
    },
    {
      id: "contact",
      title: "Contact",
      body: [
        `Questions about this policy can go to ${CONTACT_EMAIL}. If that address is wrong, it is wrong here and not somewhere else.`,
      ],
    },
  ],
};
