import type { Metadata } from "next";

import { TeasersPage } from "@/components/teasers/teasers-page";
import { hasGateProof } from "@/lib/quiz/gate";

export const metadata: Metadata = {
  title: "Brain teasers and a memory game — Quizwiz",
  description:
    "Seven lateral-thinking puzzles and riddles, plus a twelve-card memory game. No setup, no sign-up: press play and find out how many you twisted.",
};

export default async function TeasersRoute() {
  // Read on the server so the gate does not flash before it settles.
  const verified = await hasGateProof();

  return <TeasersPage verified={verified} />;
}
