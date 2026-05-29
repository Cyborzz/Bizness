import { TrendingUp } from "lucide-react";

type Point = { label: string; value: number };

export function StatsChart({
  title,
  points,
  accent = "#2454ff",
}: {
  title: string;
  points: Point[];
  accent?: string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const width = 600;
  const height = 160;
  const padding = 16;
  const step = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

  const pathPoints = points.map((p, index) => {
    const x = padding + index * step;
    const y = height - padding - ((height - padding * 2) * p.value) / max;
    return { x, y, value: p.value, label: p.label };
  });

  const linePath = pathPoints
    .map((p, index) => `${index === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  const areaPath =
    pathPoints.length > 0
      ? `${linePath} L${pathPoints[pathPoints.length - 1].x},${height - padding} L${pathPoints[0].x},${height - padding} Z`
      : "";

  const total = points.reduce((sum, p) => sum + p.value, 0);
  const last = points[points.length - 1]?.value ?? 0;
  const previous = points[points.length - 2]?.value ?? 0;
  const trend = previous === 0 ? null : Math.round(((last - previous) / previous) * 100);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-normal text-muted-2">{title}</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-ink">{total}</p>
        </div>
        {trend !== null ? (
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${
              trend >= 0 ? "bg-mint-soft text-mint" : "bg-red-100 text-red-700"
            }`}
          >
            <TrendingUp aria-hidden className="h-3 w-3" />
            {trend > 0 ? "+" : ""}
            {trend}%
          </div>
        ) : null}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Graphique ${title}`}
      >
        <defs>
          <linearGradient id={`fl-grad-${accent.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.25" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {areaPath ? (
          <path d={areaPath} fill={`url(#fl-grad-${accent.replace("#", "")})`} />
        ) : null}
        {linePath ? (
          <path
            d={linePath}
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}
        {pathPoints.map((p) => (
          <circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r="3" fill={accent} />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] font-bold uppercase text-muted-2">
        {points.length > 0 ? (
          <>
            <span>{points[0].label}</span>
            <span>{points[Math.floor(points.length / 2)]?.label}</span>
            <span>{points[points.length - 1].label}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
