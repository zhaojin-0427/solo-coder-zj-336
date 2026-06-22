import type { Review } from "@/types";
import { cn } from "@/lib/utils";

export function StatusSeal({ review }: { review?: Review }) {
  if (!review) {
    return <span className="seal-outline">待点评</span>;
  }
  if (review.is_successful === 1) {
    return <span className="seal" style={{ backgroundColor: "#566340" }}>成功</span>;
  }
  return <span className="seal">待改进</span>;
}

export function ScoreBar({
  label,
  value,
  max = 100,
  color = "#7C8C5E",
}: {
  label: string;
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-ink-600">{label}</span>
        <span className="text-sm font-serif font-medium text-ink-800">{value}{max === 100 ? "" : ""}</span>
      </div>
      <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function SectionTitle({
  children,
  subtitle,
  className,
}: {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-baseline gap-3">
        <div className="w-1 h-7 bg-gold rounded-full" />
        <h2 className="text-2xl font-serif font-semibold text-ink-800">{children}</h2>
      </div>
      {subtitle && <p className="text-sm text-ink-400 mt-1.5 ml-4">{subtitle}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  suffix,
  icon,
  accent = "tea",
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon?: React.ReactNode;
  accent?: "tea" | "cinnabar" | "gold" | "ink";
}) {
  const colorMap = {
    tea: "#7C8C5E",
    cinnabar: "#B23A2E",
    gold: "#B8924A",
    ink: "#1C1A17",
  };
  return (
    <div className="card-paper p-5 transition-all duration-200 hover:shadow-ink-lg">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-ink-400 tracking-wider">{label}</span>
        {icon && (
          <span style={{ color: colorMap[accent] }} className="opacity-70">
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-serif font-semibold" style={{ color: colorMap[accent] }}>
          {value}
        </span>
        {suffix && <span className="text-sm text-ink-400">{suffix}</span>}
      </div>
    </div>
  );
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}.${month}.${day} ${hours}:${mins}`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}.${month}.${day}`;
}
