import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StampProgress({
  current,
  required,
  color = "#0a0f1f",
}: {
  current: number;
  required: number;
  color?: string;
}) {
  const total = Math.max(required, 1);

  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: total }).map((_, index) => {
        const filled = index < current;
        return (
          <div
            key={index}
            style={{
              ...(filled ? { backgroundColor: color, borderColor: color } : undefined),
              animationDelay: `${index * 50}ms`,
            }}
            className={cn(
              "flex aspect-square items-center justify-center rounded-full border text-xs font-bold transition-all",
              filled
                ? "animate-stamp-pop text-white shadow-md"
                : "border-border bg-white text-muted-2",
            )}
          >
            {filled ? <Check aria-hidden className="h-4 w-4" /> : index + 1}
          </div>
        );
      })}
    </div>
  );
}
