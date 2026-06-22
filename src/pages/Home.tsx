import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  PenLine,
  Image,
  MessageSquareText,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from "lucide-react";
import { statsApi } from "@/api/client";
import { useArchiveStore } from "@/store/useArchiveStore";
import type { Overview } from "@/types";
import { StatCard, formatDate } from "@/components/ui";
import PatternArt from "@/components/PatternArt";

const cycleSteps = [
  { icon: Archive, label: "器具建档", desc: "茶样·茶盏·茶筅·注汤手法", to: "/archive", color: "#B8924A" },
  { icon: PenLine, label: "点茶记录", desc: "茶粉·注水·击拂·沫饽", to: "/records", color: "#7C8C5E" },
  { icon: Image, label: "纹样复盘", desc: "纹样占位·参数回看", to: "/pattern-review", color: "#566340" },
  { icon: MessageSquareText, label: "点评沉淀", desc: "三维度评分·纠偏·经验", to: "/review", color: "#B23A2E" },
];

export default function Home() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const { fetchAll, teaSamples } = useArchiveStore();

  useEffect(() => {
    statsApi.overview().then(setOverview).catch(() => {});
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="space-y-10">
      <section className="animate-fade-up">
        <div className="relative card-paper overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "radial-gradient(circle at 70% 30%, #B8924A 0%, transparent 40%)"
          }} />
          <div className="relative p-8 md:p-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="seal-outline text-[10px]">非遗传承</span>
              <span className="text-xs text-ink-400 tracking-wider">SONG DYNASTY TEA WHISKING</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink-800 leading-tight mb-3">
              击拂之间，汤花如雪
            </h1>
            <p className="text-ink-500 max-w-2xl leading-relaxed">
              以"器具建档 → 点茶记录 → 纹样复盘 → 点评沉淀"为训练闭环，沉淀不同茶样在不同手法下的成功经验，
              让茶百戏纹样复现从偶得走向可复现、可教学、可积累。
            </p>
            <div className="flex gap-3 mt-6">
              <Link to="/records" className="btn-ink">
                <PenLine size={16} /> 开始点茶记录
              </Link>
              <Link to="/archive" className="btn-outline">
                <Archive size={16} /> 器具建档
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-fade-up-delay-1">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="练习记录"
            value={overview?.total_records ?? "—"}
            icon={<PenLine size={18} />}
            accent="tea"
          />
          <StatCard
            label="成功率"
            value={overview?.success_rate ?? "—"}
            suffix="%"
            icon={<TrendingUp size={18} />}
            accent="gold"
          />
          <StatCard
            label="待点评"
            value={overview?.pending_reviews ?? "—"}
            icon={<Clock size={18} />}
            accent="cinnabar"
          />
          <StatCard
            label="成功经验"
            value={overview?.total_experiences ?? "—"}
            icon={<Lightbulb size={18} />}
            accent="ink"
          />
        </div>
      </section>

      <section className="animate-fade-up-delay-2">
        <div className="mb-4 flex items-baseline gap-3">
          <div className="w-1 h-7 bg-gold rounded-full" />
          <h2 className="text-2xl font-serif font-semibold text-ink-800">训练闭环</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {cycleSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Link
                key={i}
                to={step.to}
                className="card-paper p-5 group hover:shadow-ink-lg transition-all duration-200 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 group-hover:opacity-10 transition-opacity"
                  style={{ backgroundColor: step.color, filter: "blur(20px)" }}
                />
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${step.color}15` }}
                  >
                    <Icon size={20} style={{ color: step.color }} />
                  </div>
                  <span className="text-3xl font-serif font-bold text-ink-100">{i + 1}</span>
                </div>
                <h3 className="font-serif font-semibold text-ink-800 mb-1">{step.label}</h3>
                <p className="text-xs text-ink-400 leading-relaxed">{step.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="animate-fade-up-delay-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-paper p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-baseline gap-3">
              <div className="w-1 h-6 bg-gold rounded-full" />
              <h3 className="text-xl font-serif font-semibold text-ink-800">器具概览</h3>
            </div>
            <Link to="/archive" className="text-sm text-gold hover:underline">查看全部 →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-4 rounded-lg bg-paper">
              <div className="text-2xl font-serif font-semibold text-tea">{overview?.total_teas ?? 0}</div>
              <div className="text-xs text-ink-400 mt-1">茶样</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-paper">
              <div className="text-2xl font-serif font-semibold text-gold">{overview?.total_bowls ?? 0}</div>
              <div className="text-xs text-ink-400 mt-1">茶盏</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-paper">
              <div className="text-2xl font-serif font-semibold text-tea-dark">{overview?.total_whisks ?? 0}</div>
              <div className="text-xs text-ink-400 mt-1">茶筅</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-paper">
              <div className="text-2xl font-serif font-semibold text-cinnabar">{overview?.total_techniques ?? 0}</div>
              <div className="text-xs text-ink-400 mt-1">注汤手法</div>
            </div>
          </div>
          {teaSamples.length > 0 && (
            <div className="mt-5 pt-5 border-t border-ink-200/40">
              <p className="text-xs text-ink-400 mb-2">在册茶样</p>
              <div className="flex flex-wrap gap-2">
                {teaSamples.map((t) => (
                  <span key={t.id} className="px-2.5 py-1 text-xs rounded border border-ink-200 text-ink-600 bg-paper-light">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card-paper p-6 flex flex-col items-center justify-center">
          <div className="mb-4 flex items-baseline gap-2 self-start">
            <div className="w-1 h-6 bg-gold rounded-full" />
            <h3 className="text-xl font-serif font-semibold text-ink-800">汤花示意</h3>
          </div>
          <PatternArt seed={8888} foamState="凝乳咬盏" size={200} className="rounded-full shadow-ink" />
          <p className="text-xs text-ink-400 mt-4 text-center leading-relaxed">
            茶百戏纹样以沫饽为纸、茶膏为墨<br />系统记录每次复现，沉淀稳定技法
          </p>
        </div>
      </section>

      <section className="card-paper p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-baseline gap-3">
            <div className="w-1 h-6 bg-gold rounded-full" />
            <h3 className="text-xl font-serif font-semibold text-ink-800">成败概览</h3>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-tea" />
            <span className="font-serif text-lg font-semibold text-ink-800">{overview?.success_count ?? 0}</span>
            <span className="text-sm text-ink-400">成功</span>
          </div>
          <div className="w-px h-8 bg-ink-200" />
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-cinnabar" />
            <span className="font-serif text-lg font-semibold text-ink-800">{overview?.fail_count ?? 0}</span>
            <span className="text-sm text-ink-400">待改进</span>
          </div>
          <div className="flex-1 h-3 rounded-full bg-ink-100 overflow-hidden flex">
            <div
              className="bg-tea h-full"
              style={{ width: `${overview ? (overview.success_count / Math.max(overview.total_reviews, 1)) * 100 : 0}%` }}
            />
            <div
              className="bg-cinnabar h-full"
              style={{ width: `${overview ? (overview.fail_count / Math.max(overview.total_reviews, 1)) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm text-ink-400">{formatDate(new Date().toISOString())}</span>
        </div>
      </section>
    </div>
  );
}
