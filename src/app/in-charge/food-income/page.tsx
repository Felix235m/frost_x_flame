"use client";

import { useState, useEffect } from "react";
import { enterFoodIncome, getSession } from "@/lib/actions/in-charge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const KOLKATA_OFFSET = 5 * 60 + 30;

function localNowISO() {
  const now = new Date();
  const local = new Date(now.getTime() + KOLKATA_OFFSET * 60 * 1000);
  return local.toISOString();
}

export default function FoodIncomePage() {
  const [session, setSession] = useState<{ name: string; role: string } | null>(null);
  const [date, setDate] = useState(localNowISO().slice(0, 10));
  const [amount, setAmount] = useState<number | null>(null);
  const [source, setSource] = useState("food_court");
  const [paymentMode, setPaymentMode] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<{ income_date: string; amount: number; source: string; created_at: string }[]>([]);
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!amount || amount < 0) {
      setMessage({ text: "Enter a valid amount.", kind: "error" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await enterFoodIncome(
        { income_date: date, amount, source, payment_mode: paymentMode, notes: notes || null },
        "staff",
      );
      if (result.ok) {
        setMessage({ text: "Food income recorded.", kind: "ok" });
        setAmount(null);
        setPaymentMode(null);
        setNotes("");
      } else {
        setMessage({ text: result.error ?? "Failed to record income.", kind: "error" });
      }
    } catch {
      setMessage({ text: "Failed to record income.", kind: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-space-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">Enter Food Income</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Record daily food court income • {session?.name ?? "Staff"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <form onSubmit={handleSubmit} className="rounded-xl border border-outline-variant/20 bg-obsidian-card p-space-sm shadow-inner space-y-4">
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
            <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Amount (₹)</label>
            <input
              className="rounded-lg border border-border-subtle bg-obsidian-root px-3 py-2 text-on-surface focus:border-frost-cyan/60 outline-hidden"
              type="number"
              min="0"
              value={amount ?? ""}
              onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Source</label>
            <select
              className="rounded-lg border border-border-subtle bg-obsidian-root px-3 py-2 text-on-surface focus:border-frost-cyan/60 outline-hidden"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="food_court">Food Court</option>
              <option value="snack_bar">Snack Bar</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-label-badge uppercase tracking-wider text-on-surface-variant">Payment Mode</label>
            <select
              className="rounded-lg border border-border-subtle bg-obsidian-root px-3 py-2 text-on-surface focus:border-frost-cyan/60 outline-hidden"
              value={paymentMode ?? ""}
              onChange={(e) => setPaymentMode(e.target.value || null)}
            >
              <option value="">Select mode</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="gpay">GPay</option>
              <option value="phonepe">PhonePe</option>
            </select>
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
            {loading ? "Recording…" : "Enter Income"}
          </Button>
        </form>

        <section className="rounded-xl border border-outline-variant/20 bg-obsidian-card p-space-sm shadow-inner">
          <h3 className="font-heading text-headline-sm font-bold text-on-surface mb-3">Today's Entries</h3>
          <div className="space-y-2">
            {entries.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-4">No entries yet.</p>
            ) : (
              entries.map((e, i) => (
                <div key={i} className="rounded-lg border border-border-subtle bg-surface-container p-2 flex items-center justify-between">
                  <div>
                    <p className="font-body-sm text-body-sm text-on-surface">{e.source}</p>
                    <p className="text-[10px] text-on-surface-variant">{e.income_date}</p>
                  </div>
                  <p className="font-heading text-headline-sm font-bold text-frost-cyan">₹{e.amount}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
