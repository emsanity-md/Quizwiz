"use client";

import * as React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_AGE, ageFromDateOfBirth } from "@/lib/quiz/age";

type Props = {
  /** Whether this browser has already passed the gate. */
  verified: boolean;
  /** Called once the check has passed. */
  onVerified: () => void;
  /** What to show once the gate is behind you. */
  children: React.ReactNode;
};

/** Local calendar date, so the input never drifts a day across time zones. */
function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * The age gate.
 *
 * It asks once a year and then leaves the browser alone. The date of birth
 * is checked here for a quick answer and again on the server, which is the
 * one that counts: the form is a convenience, the route is the boundary.
 *
 * The gate sits around the page rather than in place of it, so the header
 * and everything in it stay reachable while the question is being answered.
 */
export function AgeGate({ verified, onVerified, children }: Props) {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState(false);

  const today = React.useMemo(() => new Date(), []);
  const max = React.useMemo(() => isoDate(today), [today]);
  const min = React.useMemo(() => {
    const oldest = new Date(today);
    oldest.setFullYear(oldest.getFullYear() - MAX_AGE);
    return isoDate(oldest);
  }, [today]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checking) return;

    // The same arithmetic the server runs, so an under-18 date never leaves
    // the browser. The server still checks it.
    const local = ageFromDateOfBirth(value);
    if (!local.ok) {
      setError(local.error ?? "That date of birth could not be checked.");
      return;
    }

    setChecking(true);
    setError(null);

    try {
      const response = await fetch("/api/age/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dateOfBirth: value }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error || "That date of birth could not be checked.");
        return;
      }

      onVerified();
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setChecking(false);
    }
  }

  if (verified) return <>{children}</>;

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        One quick check
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        Quizwiz is for adults.
      </h1>
      <p className="mt-3 text-muted-foreground">
        Enter your date of birth to carry on. It is checked once, used to
        confirm you are old enough, and then thrown away. There is no account
        and nothing is stored against you.
      </p>

      <form className="mt-8" onSubmit={submit}>
        <Label htmlFor="quiz-dob" className="text-sm">
          Date of birth
        </Label>
        <div className="mt-2 flex gap-2">
          <Input
            id="quiz-dob"
            type="date"
            value={value}
            min={min}
            max={max}
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
            }}
            className="h-11"
            required
            autoFocus
          />
          <Button
            type="submit"
            size="lg"
            className="h-11 px-5"
            disabled={checking || value.length === 0}
          >
            {checking ? "Checking" : "Continue"}
          </Button>
        </div>

        {error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </form>
    </div>
  );
}
