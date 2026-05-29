import { Gift } from "lucide-react";

export function RewardBadge({
  label,
  count,
  color = "#111827",
}: {
  label: string;
  count: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: color }}
      >
        <Gift aria-hidden className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-950">{label}</p>
        <p className="text-sm text-gray-500">
          {count > 0 ? `${count} récompense(s) disponible(s)` : "Aucune récompense disponible"}
        </p>
      </div>
    </div>
  );
}
