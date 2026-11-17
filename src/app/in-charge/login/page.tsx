"use client";

import { useState } from "react";
import { loginInCharge } from "@/lib/actions/in-charge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/in-charge/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const press = (digit: string) => {
    setError("");
    setPin((current) => (current.length < 4 ? current + digit : current));
  };

  const backspace = () => {
    setError("");
    setPin((current) => current.slice(0, -1));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pin.length < 4) return;
    setIsLoading(true);
    try {
      const result = await loginInCharge(pin);
      if (result.ok) {
        router.replace("/in-charge/floor");
        router.refresh();
      } else {
        setError(result.error ?? "That PIN was not recognised. Try again.");
        setPin("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-obsidian-root px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <BrandLogo />
          <h1 className="font-heading text-headline-md font-bold text-on-surface">In-Charge Sign In</h1>
          <p className="text-body-sm text-on-surface-variant">
            Enter your 4-digit shift PIN to open the console.
          </p>
        </div>

        <form
          className="rounded-2xl border border-border-subtle bg-obsidian-elevated p-4 shadow-glow-frost"
          onSubmit={handleSubmit}
        >
          <label
            className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant"
            htmlFor="staff-pin"
          >
            Shift PIN
          </label>
          <input
            autoComplete="off"
            autoFocus
            className={cn(
              "h-14 w-full rounded-xl border bg-obsidian-root pl-[0.5em] text-center font-heading text-label-timer tracking-[0.5em] text-on-surface placeholder:tracking-normal placeholder:text-outline focus:outline-hidden",
              error
                ? "border-status-booked/60"
                : "border-border-subtle focus:border-frost-cyan/60"
            )}
            id="staff-pin"
            inputMode="numeric"
            maxLength={4}
            onChange={(event) => {
              setError("");
              setPin(event.target.value.replace(/\D/g, "").slice(0, 4));
            }}
            pattern="\d*"
            placeholder="••••"
            type="password"
            value={pin}
          />

          {error ? (
            <p
              className="mt-2 rounded-lg border border-status-booked/30 bg-status-booked/10 px-3 py-2 text-body-sm text-status-booked"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-3 grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
              <KeypadKey key={digit} onClick={() => press(digit)}>
                {digit}
              </KeypadKey>
            ))}
            <KeypadKey muted onClick={backspace}>
              <span className="material-symbols-outlined text-[20px]">backspace</span>
            </KeypadKey>
            <KeypadKey onClick={() => press("0")}>0</KeypadKey>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <Button
              variant="flame"
              className="w-full"
              disabled={pin.length < 4 || isLoading}
              type="submit"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">
                  progress_activity
                </span>
              ) : (
                "Enter"
              )}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-body-sm text-on-surface-variant">
          PINs are issued by the owner.
        </p>
      </div>
    </div>
  );
}

function KeypadKey({
  children,
  onClick,
  muted = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  muted?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex h-12 items-center justify-center rounded-lg bg-surface-container font-heading text-headline-sm text-on-surface transition-colors hover:bg-surface-container-high active:scale-95",
        muted && "text-on-surface-variant"
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
