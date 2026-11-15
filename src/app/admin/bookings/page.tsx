"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Calendar, Plus } from "lucide-react";

const STATUS_CONFIG: Record<string, string> = {
  held: "status-held",
  confirmed: "status-available",
  checked_in: "status-available",
  completed: "tertiary",
  cancelled: "status-booked",
  no_show: "status-booked",
  expired: "status-booked",
};

const bookings = [
  { id: "1", code: "#FNF-8924", customer: "Rahul Sharma", mobile: "+91 98765 43210", device: "Station 2", time: "Today 6:00–8:00 PM", status: "confirmed", source: "online", amount: "₹500" },
  { id: "2", code: "#FNF-8925", customer: "Anita Desai", mobile: "+91 98765 12345", device: "Station 3", time: "Today 7:00–9:00 PM", status: "confirmed", source: "walk-in", amount: "₹500" },
  { id: "3", code: "#FNF-8926", customer: "Vikram Patel", mobile: "+91 98765 67890", device: "VR 1", time: "Tomorrow 4:00–6:00 PM", status: "held", source: "online", amount: "₹600" },
  { id: "4", code: "#FNF-8927", customer: "Sneha Rao", mobile: "+91 98765 24680", device: "Racing Sim", time: "Tomorrow 6:00–8:00 PM", status: "checked_in", source: "phone", amount: "₹700" },
  { id: "5", code: "#FNF-8928", customer: "Karan Joshi", mobile: "+91 98765 13579", device: "Station 1", time: "Today 8:00–10:00 PM", status: "cancelled", source: "online", amount: "₹500" },
];

export default function AdminBookingsPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = bookings.filter((b) => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchSearch =
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.mobile.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-bold">Bookings</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Manage all bookings across sources</p>
        </div>
        <Button variant="flame">
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-space-sm mb-space-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]" />
          <input
            className="w-full h-11 pl-10 pr-4 bg-obsidian-root text-on-surface rounded-lg placeholder:text-outline-variant outline-none focus:bg-surface-container-lowest shadow-inner"
            placeholder="Search booking ID, customer, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]" />
          <select
            className="w-48 h-11 pl-10 pr-4 bg-obsidian-root text-on-surface rounded-lg outline-none focus:bg-surface-container-lowest shadow-inner appearance-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="held">Held</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Calendar View
        </Button>
      </div>

      <div className="rounded-xl bg-obsidian-card border border-outline-variant/20 shadow-inner overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low/50 border-b border-outline-variant/20">
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Booking ID</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Device</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Source</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider text-right">Amount</th>
              <th className="px-4 py-3 font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-surface-container-low/30 transition-colors group">
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface font-semibold">{b.code}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface">{b.customer}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">{b.device}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">{b.time}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_CONFIG[b.status] === "status-available" ? "available" : STATUS_CONFIG[b.status] === "status-held" ? "held" : "booked" as any}>
                    {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant">{b.source}</td>
                <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface text-right">{b.amount}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="h-9 px-2">
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
