"use client";

import { useState, useEffect } from "react";
import { markAttendance, getSession } from "@/lib/actions/in-charge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUSES: { value: "present" | "absent" | "leave" | "lop" | "half_day"; label: string; color: string }[] = [
  { value: "present", label: "Present", color: "text-status-available" },
  { value: "absent", label: "Absent", color: "text-status-booked" },
  { value: "leave", label: "Leave", color: "text-status-held" },
  { value: "lop", label: "LOP", color: "text-status-booked" },
  { value: "half_day", label: "Half Day", color: "text-frost-cyan" },
];

const KOLKATA_OFFSET = 5 * 60 + 30;

function localNowISO() {
  const now = new Date();
  const local = new Date(now.getTime() + KOLKATA_OFFSET * 60 * 1000);
  return local.toISOString();
}

export default function AttendancePage() {
  const [session, setSession] = useState<{ name: string; role: string } | null>(null);
  const [date, setDate] = useState(localNowISO().slice(0, 10));
  const [status, setStatus] = useState<"present" | "absent" | "leave" | "lop" | "half_day">("present");
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [hours, setHours] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind: "ok" | "error" } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getSession();
        if (mounted && s) setSession({ name: s.name, role: s.role });
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const now = localNowISO().slice(11, 16);
    if (!checkIn && status === "present") setCheckIn(now);
  }, [status, checkIn]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const result = await markAttendance(
        {
          attendance_date: date,
          status,
          check_in: checkIn ?? null,
          check_out: checkOut ?? null,
          hours_worked: hours ?? null,
          notes: notes || null,
        },
        "staff",
      );
      if (result.ok) {
        setMessage({ text: "Attendance marked successfully.", kind: "ok" });
      } else {
        setMessage({ text: result.error ?? "Failed to mark attendance.", kind: "error" });
      }
    } catch {
      setMessage({ text: "Failed to mark attendance.", kind: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-space-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">Staff Attendance</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Mark your daily attendance • {session?.name ?? "Staff"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant/20 bg-obsidian-card p-space-sm shadow-inner">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Date</label>
            <input
              className="rounded-lg border border-border-subtle bg-obsidian-root px-3 py-2 text-on-surface focus:border-frost-cyan/60 outline-hidden"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Status</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STATUSES.map((s) => {
                const active = status === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => setStatus(s.value)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-colors",
                      active
                        ? "border-frost-cyan bg-frost-cyan/10 text-frost-cyan"
                        : "border-border-subtle bg-surface-container-low text-on-surface-variant hover:border-frost-cyan/60"
                    )}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {s.value === "present" ? "check_circle" : s.value === "absent" ? "remove_circle" : s.value === "leave" ? "plane" : s.value === "lop" ? "error" : "highlight"}
                    </span>
                    <span className="font-body-sm text-body-sm font-semibold">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Check-in</label>
              <input
                className="rounded-lg border border-border-subtle bg-obsidian-root px-3 py-2 text-on-surface focus:border-frost-cyan/60 outline-hidden"
                type="time"
                value={checkIn ?? ""}
                onChange={(e) => setCheckIn(e.target.value || null)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Check-out</label>
              <input
                className="rounded-lg border border-border-subtle bg-obsidian-root px-3 py-2 text-on-surface focus:border-frost-cyan/60 outline-hidden"
                type="time"
                value={checkOut ?? ""}
                onChange={(e) => setCheckOut(e.target.value || null)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Hours Worked</label>
            <input
              className="rounded-lg border border-border-subtle bg-obsidian-root px-3 py-2 text-on-surface focus:border-frost-cyan/60 outline-hidden"
              type="number"
              step="0.5"
              value={hours ?? ""}
              onChange={(e) => setHours(e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Notes</label>
            <textarea
              className="rounded-lg border border-border-subtle bg-obsidian-root px-3 py-2 text-on-surface focus:border-frost-cyan/60 outline-hidden"
              rows={3}
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {message && (
            <div className={cn("rounded-lg border px-3 py-2 text-body-sm", message.kind === "ok" ? "border-status-available/30 bg-status-available/10 text-status-available" : "border-status-booked/30 bg-status-booked/10 text-status-booked")}>
              {message.text}
            </div>
          )}

          <Button variant="flame" className="w-full" disabled={loading} type="submit">
            {loading ? "Marking…" : "Mark Attendance"}
          </Button>
        </form>
      </div>
    </div>
  );
}
