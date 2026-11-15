"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEVICES = [
  { id: "1", name: "Station 1", type: "PS5", rate: "₹250/h", status: "free", note: "Controller battery 85%" },
  { id: "2", name: "Station 2", type: "PS5", rate: "₹250/h", status: "running", note: "Lens cleaning due" },
  { id: "3", name: "Station 3", type: "PS5", rate: "₹250/h", status: "free", note: null },
  { id: "4", name: "VR 1", type: "VR", rate: "₹300/h", status: "free", note: "Controllers synced" },
  { id: "5", name: "VR 2", type: "VR", rate: "₹300/h", status: "blocked", note: "Headset repair" },
  { id: "6", name: "Racing Sim", type: "Sim", rate: "₹350/h", status: "free", note: "Calibration OK" },
];

export default function AdminDevicesPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-space-lg">
        <div>
          <h1 className="font-heading text-headline-lg text-on-surface font-bold">Devices</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Monitor station health and maintenance blocks</p>
        </div>
        <Button variant="flame">Add Maintenance Block</Button>
      </div>
      <div className="space-y-3">
        {DEVICES.map((d) => (
          <div key={d.id} className="rounded-xl bg-obsidian-card border border-outline-variant/20 shadow-inner p-space-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-frost-cyan/15 flex items-center justify-center text-frost-cyan shadow-md">
                <span className="material-symbols-outlined text-[24px]">
                  {d.type === "PS5" ? "videogame_asset" : d.type === "VR" ? "view_in_ar" : "sports_score"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{d.name}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">{d.type} • {d.rate}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={d.status === "free" ? "available" : d.status === "blocked" ? "booked" : "held"}>
                {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
              </Badge>
              {d.note && (
                <span className="font-body-sm text-body-sm text-on-surface-variant bg-obsidian-root/50 px-2 py-1 rounded-md">{d.note}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
