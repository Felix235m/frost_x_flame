"use client";

import { useEffect, useRef, useState } from "react";

interface CountdownTimerProps {
  target: string | null;
  onComplete?: () => void;
}

export function CountdownTimer({ target, onComplete }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!target) {
      setRemaining(null);
      return;
    }
    const targetTime = new Date(target).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = targetTime - now;
      if (diff <= 0) {
        setRemaining(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
        onComplete?.();
        return;
      }
      setRemaining(diff);
    };

    tick();
    intervalRef.current = window.setInterval(tick, 1000) as unknown as number;
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [target, onComplete]);

  if (remaining == null) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <span className="font-mono text-label-timer text-frost-cyan font-bold tabular-nums">
      {h > 0 ? `${pad(h)}:` : ""}{pad(m)}:{pad(s)}
    </span>
  );
}
