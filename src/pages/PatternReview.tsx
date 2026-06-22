import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, Clock, CheckCircle2, XCircle, Camera, ChevronRight } from "lucide-react";
import { recordApi } from "@/api/client";
import type { PracticeRecord } from "@/types";
import { SectionTitle, StatusSeal, formatDate } from "@/components/ui";
import PatternArt from "@/components/PatternArt";
import { cn } from "@/lib/utils";

const photoLabelMap: Record<string, string> = {
  "bamboo_slope": "竹枝斜出",
  "plum_shadow": "梅枝疏影",
  "orchid_three": "兰叶三笔",
  "cloud_roll": "云纹舒卷",
  "pine_needle": "松针细描",
  "far_mountain": "远山如黛",
  "moon_circle": "月映汤面",
  "lotus_leaf": "荷露初凝",
  "empty_scatter": "散落点墨",
  "early_dissolve": "初现即散",
  "no_foam": "汤花未起",
};

export default function PatternReview() {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [foamFilter, setFoamFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await recordApi.list();
      setRecords(data);
    } finally {
      setLoading(false);
    }
  }

  const foamStates = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.foam_state));
    return Array.from(set);
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (foamFilter !== "all" && r.foam_state !== foamFilter) return false;
      if (searchKeyword) {
        const k = searchKeyword.toLowerCase();
        return (
          r.practitioner_name.toLowerCase().includes(k) ||
          (r.tea_sample?.name || "").toLowerCase().includes(k) ||
          (r.technique?.name || "").toLowerCase().includes(k) ||
          (r.pattern_description || "").toLowerCase().includes(k) ||
          (r.pattern_photo_url || "").toLowerCase().includes(k)
        );
      }
      return true;
    });
  }, [records, foamFilter, searchKeyword]);

  const stats = useMemo(() => {
    const total = records.length;
    const withPhoto = records.filter((r) => r.pattern_photo_url).length;
    const reviewed = records.filter((r) => r.review).length;
    const success = records.filter((r) => r.review && r.review.is_successful === 1).length;
    return { total, withPhoto, reviewed, success };
  }, [records]);

  return (
    <div className="space-y-6">
      <SectionTitle subtitle="查看所有练习的纹样示意、照片占位、参数细节，进行纹样复盘与对比">
        纹样复盘
      </SectionTitle>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-paper p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-ink-400">复盘总数</span>
            <Eye size={14} className="text-ink-400" />
          </div>
          <div className="text-2xl font-serif font-semibold text-ink-800">{stats.total}</div>
        </div>
        <div className="card-paper p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-ink-400">有照片占位</span>
            <Camera size={14} className="text-gold" />
          </div>
          <div className="text-2xl font-serif font-semibold text-gold">{stats.withPhoto}</div>
        </div>
        <div className="card-paper p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-ink-400">已点评</span>
            <CheckCircle2 size={14} className="text-tea" />
          </div>
          <div className="text-2xl font-serif font-semibold text-tea">{stats.reviewed}</div>
        </div>
        <div className="card-paper p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-ink-400">复现成功</span>
            <CheckCircle2 size={14} className="text-tea-dark" />
          </div>
          <div className="text-2xl font-serif font-semibold text-tea-dark">
            {stats.success}
            <span className="text-xs text-ink-300 font-sans font-normal ml-1">
              / {stats.reviewed > 0 ? Math.round((stats.success / stats.reviewed) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="card-paper p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={15} className="text-ink-400" />
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索练习者、茶样、手法、纹样描述…"
            className="flex-1 bg-transparent outline-none text-sm text-ink-700 placeholder:text-ink-300"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-ink-400" />
          <span className="text-xs text-ink-400">沫饽：</span>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setFoamFilter("all")}
              className={cn(
                "px-2.5 py-1 text-xs rounded border transition-all",
                foamFilter === "all"
                  ? "bg-ink-800 text-paper-light border-ink-800"
                  : "border-ink-200 text-ink-500 hover:border-ink-300"
              )}
            >
              全部
            </button>
            {foamStates.map((s) => (
              <button
                key={s}
                onClick={() => setFoamFilter(s)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded border transition-all",
                  foamFilter === s
                    ? "bg-gold text-paper-light border-gold"
                    : "border-ink-200 text-ink-500 hover:border-ink-300"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-ink-300 ml-auto">显示 {filteredRecords.length} / {records.length}</div>
      </div>

      {loading ? (
        <div className="card-paper p-12 text-center text-ink-400">加载中…</div>
      ) : filteredRecords.length === 0 ? (
        <div className="card-paper p-12 text-center text-ink-400">
          <Eye size={32} className="mx-auto mb-3 opacity-40" />
          暂无符合条件的纹样复盘记录
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRecords.map((r) => {
            const photoLabel = r.pattern_photo_url ? (photoLabelMap[r.pattern_photo_url] || r.pattern_photo_url) : null;
            const review = r.review;
            return (
              <div key={r.id} className="card-paper overflow-hidden hover:shadow-ink-lg transition-all duration-200">
                <div className="bg-paper p-5 flex items-start gap-4 border-b border-ink-100">
                  <Link to={`/records/${r.id}`} className="relative shrink-0">
                    <PatternArt
                      seed={r.pattern_seed}
                      foamState={r.foam_state}
                      size={88}
                      className="rounded-full shadow-ink"
                    />
                    {r.pattern_photo_url && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gold border-2 border-paper-light flex items-center justify-center shadow-ink">
                        <Camera size={11} className="text-paper-light" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="font-serif font-semibold text-ink-800">{r.practitioner_name}</div>
                        <div className="text-[11px] text-ink-400">{formatDate(r.created_at)}</div>
                      </div>
                      <StatusSeal review={review} />
                    </div>
                    <div className="text-xs text-ink-500 space-y-0.5">
                      <div>茶样 · {r.tea_sample?.name ?? "—"} ｜ 手法 · {r.technique?.name ?? "—"}</div>
                      <div>茶粉 {r.tea_powder_grams}g · 注水 {r.water_pour_rounds}轮 · 击拂 {r.whisking_duration_sec}s</div>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <div className="text-[11px] text-ink-400 mb-1.5 flex items-center gap-1">
                      <Eye size={11} /> 纹样描述
                    </div>
                    <p className="text-sm text-ink-600 leading-relaxed line-clamp-2">
                      {r.pattern_description || "—"}
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    {photoLabel && (
                      <div className="flex-1 p-3 rounded-lg bg-gold/5 border border-gold/20">
                        <div className="flex items-center gap-1 text-[11px] text-gold-dark mb-1">
                          <Camera size={11} /> 照片占位
                        </div>
                        <div className="text-sm font-serif font-medium text-ink-800">{photoLabel}</div>
                      </div>
                    )}
                    <div className={cn(
                      "flex-1 p-3 rounded-lg border",
                      r.foam_state === "凝乳咬盏" || r.foam_state === "细密如雪"
                        ? "bg-tea/5 border-tea/20"
                        : r.foam_state === "粗散易消" || r.foam_state === "薄而不匀"
                        ? "bg-cinnabar/5 border-cinnabar/20"
                        : "bg-gold/5 border-gold/20"
                    )}>
                      <div className={cn(
                        "text-[11px] mb-1",
                        r.foam_state === "凝乳咬盏" || r.foam_state === "细密如雪"
                          ? "text-tea-dark"
                          : r.foam_state === "粗散易消" || r.foam_state === "薄而不匀"
                          ? "text-cinnabar"
                          : "text-gold-dark"
                      )}>沫饽状态</div>
                      <div className="text-sm font-serif font-medium text-ink-800">{r.foam_state}</div>
                    </div>
                  </div>

                  {review && (
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-ink-100">
                      <div className="text-center p-2 rounded bg-paper-light">
                        <div className="text-sm font-serif font-semibold text-tea">{review.foam_delicacy_score}</div>
                        <div className="text-[9px] text-ink-400 mt-0.5">细腻度</div>
                      </div>
                      <div className="text-center p-2 rounded bg-paper-light">
                        <div className="text-sm font-serif font-semibold text-gold">{review.cup_biting_duration_sec}s</div>
                        <div className="text-[9px] text-ink-400 mt-0.5">咬盏</div>
                      </div>
                      <div className="text-center p-2 rounded bg-paper-light">
                        <div className="text-sm font-serif font-semibold text-tea-dark">{review.pattern_completeness_score}</div>
                        <div className="text-[9px] text-ink-400 mt-0.5">完整度</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                      {review ? (
                        review.is_successful === 1 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-tea-dark">
                            <CheckCircle2 size={13} /> 纹样复现成功
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-cinnabar">
                            <XCircle size={13} /> {review.failure_reason || "待改进"}
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                          <Clock size={13} /> 等待点评
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/records/${r.id}`}
                      className="inline-flex items-center gap-1 text-xs text-gold hover:underline font-medium"
                    >
                      查看详情 <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
