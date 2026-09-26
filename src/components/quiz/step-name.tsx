"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_NAME = 80;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
};

export function StepName({ value, onChange, onNext }: Props) {
  const trimmed = value.trim();
  const valid = trimmed.length > 0;

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && valid) onNext();
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Step 1
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        What should we call you?
      </h1>
      <p className="mt-3 text-muted-foreground">
        It goes on your result at the end. No account, so nothing else is stored
        and nothing is emailed.
      </p>

      <form
        className="mt-8 max-w-md"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid) onNext();
        }}
      >
        <Label htmlFor="quiz-name" className="text-sm">
          Your name
        </Label>
        <div className="mt-2 flex gap-2">
          <Input
            id="quiz-name"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            maxLength={MAX_NAME}
            autoComplete="name"
            autoFocus
            placeholder="e.g. Ada"
            className="h-11"
          />
          <Button type="submit" size="lg" className="h-11 px-5" disabled={!valid}>
            Continue
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Up to {MAX_NAME} characters.
        </p>
      </form>
    </div>
  );
}
