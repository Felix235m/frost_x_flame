import { CustomerLayout } from "@/components/customer/layout";
import { cn } from "@/lib/utils";

export interface ScreenSkeletonProps {
  variant?: "shell" | "focused";
  /** Title bar width, tuned per screen so the swap does not jump. */
  titleWidth?: string;
}

/**
 * Prerendered stand-in for screens whose real content depends on the clock or
 * on search params. Those screens stream in behind a Suspense boundary, so the
 * shell paints instantly with this instead of an empty page.
 */
export function ScreenSkeleton({ variant = "shell", titleWidth = "w-40" }: ScreenSkeletonProps) {
  return (
    <CustomerLayout variant={variant}>
      <div
        aria-busy="true"
        className={cn(
          "mx-auto flex w-full max-w-app flex-col gap-4",
          variant === "focused" && "px-4 pt-16 pb-28 md:px-10"
        )}
      >
        <span className="sr-only">Loading</span>
        <div className={cn("h-7 animate-pulse rounded-full bg-obsidian-elevated", titleWidth)} />
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((key) => (
            <div
              key={key}
              className="h-[60px] w-[76px] shrink-0 animate-pulse rounded-xl bg-obsidian-elevated"
            />
          ))}
        </div>
        <div className="h-16 animate-pulse rounded-xl bg-obsidian-elevated" />
        <div className="h-64 animate-pulse rounded-2xl bg-obsidian-elevated" />
        <div className="h-20 animate-pulse rounded-xl bg-obsidian-elevated" />
      </div>
    </CustomerLayout>
  );
}
