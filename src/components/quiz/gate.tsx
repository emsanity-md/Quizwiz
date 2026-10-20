"use client";

import Link from "next/link";
import * as React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
 * The gate.
 *
 * Three things before the service is used: that you are over 18, that you
 * accept the terms, and that you accept the policy. The date of birth is
 * checked here for a quick answer and again on the server, which is the one
 * that counts: the form is a convenience, the route is the boundary.
 *
 * The gate sits around the page rather than in place of it, so the header
 * and everything in it stay reachable while the questions are being answered.
 */
export function Gate({ verified, onVerified, children }: Props) {
  const [value, setValue] = React.useState("");
  const [terms, setTerms] = React.useState(false);
  const [privacy, setPrivacy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState(false);

  const today = React.useMemo(() => new Date(), []);
  const max = React.useMemo(() => isoDate(today), [today]);
  const min = React.useMemo(() => {
    const oldest = new Date(today);
    oldest.setFullYear(oldest.getFullYear() - MAX_AGE);
    return isoDate(oldest);
  }, [today]);

  const ready = value.length > 0 && terms && privacy;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checking || !ready) return;

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
      const response = await fetch("/api/gate/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dateOfBirth: value,
          terms,
          privacy,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error || "That could not be checked.");
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
            disabled={checking || !ready}
          >
            {checking ? "Checking" : "Continue"}
          </Button>
        </div>

        <fieldset className="mt-8">
          <legend className="text-sm font-semibold">Before you continue</legend>

          <div className="mt-4 flex flex-col gap-4">
            <Consent
              id="gate-terms"
              checked={terms}
              onChange={setTerms}
              before={
                <>
                  I accept the{" "}
                  <DocLink href="/terms">Terms &amp; Conditions</DocLink>.
                </>
              }
            />

            <Consent
              id="gate-privacy"
              checked={privacy}
              onChange={setPrivacy}
              before={
                <>
                  I accept the <DocLink href="/privacy">Privacy Policy</DocLink>.
                </>
              }
            />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            The documents open in a new tab, so this page keeps what you have
            already typed.
          </p>
        </fieldset>

        {error ? (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </form>
    </div>
  );
}

/** One tick box and the sentence that goes with it. */
function Consent({
  id,
  checked,
  onChange,
  before,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  before: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="mt-1"
      />
      <Label
        htmlFor={id}
        className="cursor-pointer text-sm leading-relaxed font-normal text-muted-foreground"
      >
        {/* One child, so the label's own gap does not put a space between the
            words and the full stop. */}
        <span>{before}</span>
      </Label>
    </div>
  );
}

/**
 * A link to one of the legal documents.
 *
 * It opens in a new tab so the form behind it keeps its date. It sits inside
 * a label, so the click is stopped from ticking the box as well.
 */
function DocLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => event.stopPropagation()}
      className="font-medium text-foreground underline underline-offset-4"
    >
      {children}
    </Link>
  );
}
