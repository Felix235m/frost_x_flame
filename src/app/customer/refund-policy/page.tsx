import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomerLayout } from "@/components/customer/layout";

export default function RefundPolicyPage() {
  return (
    <CustomerLayout>
      <div className="flex flex-col h-full">
        <section className="w-full max-w-md mx-auto">
          <div className="bg-obsidian-elevated rounded-xl p-space-md shadow-md space-y-4">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Refund & Cancellation Policy</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Frost x Flame Gaming Cafe offers fair and transparent refund terms for all bookings.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-status-available/20 text-status-available flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                </span>
                <div>
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold">Full Refund Eligible</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Cancellations made 2 or more hours before the session start time are eligible for a 100% refund.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-status-held/20 text-status-held flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                </span>
                <div>
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold">Late Cancellation</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Cancellations made less than 2 hours before the session start are not eligible for an automatic refund. Staff may override with a documented reason.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-frost-cyan/20 text-frost-cyan flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                </span>
                <div>
                  <span className="font-body-sm text-body-sm text-on-surface font-semibold">Refund Processing</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Approved refunds are returned to the original UPI account within 15 minutes.
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant/20">
              <p className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">
                Hold Policy
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Slots are held for 10 minutes after selection. Unpaid holds are automatically released so others can book.
              </p>
            </div>
          </div>
          <div className="mt-space-lg text-center">
            <Button variant="flame" asChild className="w-full">
              <Link href="/customer/booking">Book a Slot</Link>
            </Button>
          </div>
        </section>
      </div>
    </CustomerLayout>
  );
}
