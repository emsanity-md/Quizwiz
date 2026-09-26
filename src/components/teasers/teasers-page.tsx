"use client";

import * as React from "react";

import { MemoryGame } from "@/components/memory/memory-game";
import { QuizHeader } from "@/components/quiz/quiz-header";
import { TeaserFlow } from "@/components/teasers/teaser-flow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * One page, two games. The teaser twister spends a key on generation, the
 * memory game costs nothing and never waits, so they sit side by side rather
 * than behind separate routes.
 */
export function TeasersPage() {
  const [tab, setTab] = React.useState("twister");

  return (
    <>
      <QuizHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12 sm:py-16">
        <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
          <TabsList className="h-10">
            <TabsTrigger value="twister" className="px-4">
              Twister
            </TabsTrigger>
            <TabsTrigger value="memory" className="px-4">
              Memory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="twister" className="mt-8">
            <div className="mx-auto max-w-3xl">
              <TeaserFlow />
            </div>
          </TabsContent>

          <TabsContent value="memory" className="mt-8">
            <div className="mx-auto max-w-3xl">
              <MemoryGame />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
