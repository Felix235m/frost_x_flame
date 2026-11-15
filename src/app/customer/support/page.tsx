import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomerLayout } from "@/components/customer/layout";

export default function SupportPage() {
  return (
    <CustomerLayout>
      <div className="flex flex-col h-full">
        <section className="w-full max-w-md mx-auto">
          <div className="bg-obsidian-elevated rounded-xl p-space-md shadow-md space-y-4">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Support & Help</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Need help with your booking? Reach us on WhatsApp or visit the cafe.
            </p>
            <div className="space-y-3">
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full py-3 rounded-lg bg-surface-container border border-outline-variant/20 hover:border-frost-cyan/50 transition-colors"
              >
                <span className="material-symbols-outlined text-frost-cyan text-[24px]">chat</span>
                <span className="font-body-md text-body-sm text-on-surface">WhatsApp Concierge</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">+91 98765 43210</span>
              </a>
              <div className="flex items-center gap-3 py-3 rounded-lg bg-surface-container border border-outline-variant/20">
                <span className="material-symbols-outlined text-flame-neon text-[24px]">location_on</span>
                <div className="flex flex-col">
                  <span className="font-body-md text-body-sm text-on-surface font-semibold">Frost x Flame Gaming Cafe</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Near Navelim Church Junction, Salcete, Goa</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 rounded-lg bg-surface-container border border-outline-variant/20">
                <span className="material-symbols-outlined text-frost-sky text-[24px]">schedule</span>
                <div className="flex flex-col">
                  <span className="font-body-md text-body-sm text-on-surface font-semibold">Opening Hours</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">12:00 PM – 1:00 AM (Daily)</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant/20 bg-obsidian-root/50 rounded-lg p-3">
              <p className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Common Questions</p>
              <ul className="mt-2 space-y-2 text-sm text-on-surface-variant font-body-sm">
                <li className="flex justify-between">
                  <span>Can I cancel my booking?</span>
                  <span className="text-frost-cyan font-semibold">Yes, 2+ hrs before start</span>
                </li>
                <li className="flex justify-between">
                  <span>Do I need an account?</span>
                  <span className="text-frost-cyan font-semibold">No account required</span>
                </li>
                <li className="flex justify-between">
                  <span>What payment methods?</span>
                  <span className="text-frost-cyan font-semibold">UPI (GPay, PhonePe, Paytm)</span>
                </li>
              </ul>
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
