import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquareText, CheckCircle2, XCircle, Clock, Lightbulb, Check } from "lucide-react";
import { recordApi, reviewApi } from "@/api/client";
import type { PracticeRecord, Review as ReviewType } from "@/types";
import { SectionTitle, StatusSeal, ScoreBar, formatDate } from "@/components/ui";
import PatternArt from "@/components/PatternArt";
import Modal from "@/components/Modal";
import { cn } from "@/lib/utils";

type TabKey = "pending" | "reviewed";

const failureReasons = ["沫饽粗散", "咬盏时长不足", "纹样断裂", "汤花未起", "水量过多"];

export default function Review() {
  const [tab, setTab] = useState<TabKey>("pending");
  const [pendingRecords, setPendingRecords] = useState<PracticeRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PracticeRecord | null>(null);

  const [form, setForm] = useState({
    teacher_name: "",
    foam_delicacy_score: "75",
    cup_biting_duration_sec: "30",
    pattern_completeness_score: "70",
    correction_suggestion: "",
    is_successful: true,
    failure_reason: "",
    archive_as_experience: true,
    experience_key_points: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [allRecords, allReviews] = await Promise.all([
        recordApi.list(),
        reviewApi.list(),
      ]);
      setRecords(allRecords);
      setReviews(allReviews);

      const reviewedIds = new Set(allReviews.map((r) => r.practice_record_id));
      setPendingRecords(allRecords.filter((r) => !reviewedIds.has(r.id)));
    } finally {
      setLoading(false);
    }
  }

  function openReviewModal(record: PracticeRecord) {
    setSelectedRecord(record);
    setForm({
      teacher_name: "",
      foam_delicacy_score: "75",
      cup_biting_duration_sec: "30",
      pattern_completeness_score: "70",
      correction_suggestion: "",
      is_successful: true,
      failure_reason: "",
      archive_as_experience: true,
      experience_key_points: "",
    });
    setModalOpen(true);
  }

  async function handleSubmitReview() {
    if (!selectedRecord) return;
    setSaving(true);
    try {
      await reviewApi.create({
        practice_record_id: selectedRecord.id,
        teacher_name: form.teacher_name,
        foam_delicacy_score: Number(form.foam_delicacy_score),
        cup_biting_duration_sec: Number(form.cup_biting_duration_sec),
        pattern_completeness_score: Number(form.pattern_completeness_score),
        correction_suggestion: form.correction_suggestion || undefined,
        is_successful: form.is_successful,
        failure_reason: form.is_successful ? undefined : form.failure_reason || undefined,
        archive_as_experience: form.archive_as_experience,
        experience_key_points: form.archive_as_experience && form.experience_key_points ? form.experience_key_points : undefined,
      });
      await loadData();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  const reviewedRecords = records.filter((r) => r.review);

  const currentList = tab === "pending" ? pendingRecords : reviewedRecords;

  return (
    <div className="space-y-6">
      <SectionTitle subtitle={'按\u201C汤花细腻度\u201D\u201C咬盏时长\u201D\u201C纹样完整度\u201D三维度评分，给出纠偏建议'}>
        点评反馈
      </SectionTitle>

      <div className="border-b border-ink-200/50">
        <div className="flex gap-1">
          <button
            onClick={() => setTab("pending")}
            className={cn("tab-item flex items-center gap-2", tab === "pending" ? "tab-active" : "tab-inactive")}
          >
            <Clock size={16} />
            待点评
            <span className="text-xs text-ink-300">({pendingRecords.length})</span>
          </button>
          <button
            onClick={() => setTab("reviewed")}
            className={cn("tab-item flex items-center gap-2", tab === "reviewed" ? "tab-active" : "tab-inactive")}
          >
            <CheckCircle2 size={16} />
            已点评
            <span className="text-xs text-ink-300">({reviews.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card-paper p-12 text-center text-ink-400">加载中…</div>
      ) : currentList.length === 0 ? (
        <div className="card-paper p-12 text-center text-ink-400">
          <MessageSquareText size={32} className="mx-auto mb-3 opacity-40" />
          {tab === "pending" ? "暂无待点评的练习记录" : "暂无已点评记录"}
        </div>
      ) : tab === "pending" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingRecords.map((r) => (
            <div
              key={r.id}
              className="card-paper p-5 hover:shadow-ink-lg transition-all duration-200 cursor-pointer group"
              onClick={() => openReviewModal(r)}
            >
              <div className="flex items-start gap-4">
                <PatternArt
                  seed={r.pattern_seed}
                  foamState={r.foam_state}
                  size={64}
                  className="rounded-full shrink-0 shadow-ink"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-serif font-semibold text-ink-800 truncate">{r.practitioner_name}</span>
                    <span className="seal-outline text-[10px]">待点评</span>
                  </div>
                  <div className="text-xs text-ink-500 space-y-0.5">
                    <div>茶样 · {r.tea_sample?.name ?? "—"}</div>
                    <div>手法 · {r.technique?.name ?? "—"}</div>
                    <div>沫饽 · {r.foam_state}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-ink-200/40">
                <div className="text-center">
                  <div className="text-sm font-serif font-semibold text-ink-800">{r.tea_powder_grams}g</div>
                  <div className="text-[10px] text-ink-400">茶粉</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-serif font-semibold text-ink-800">{r.water_pour_rounds}</div>
                  <div className="text-[10px] text-ink-400">注水</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-serif font-semibold text-ink-800">{r.whisking_duration_sec}s</div>
                  <div className="text-[10px] text-ink-400">击拂</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-ink-400">{formatDate(r.created_at)}</span>
                <span className="text-xs text-gold group-hover:underline">点评 →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {reviewedRecords.map((r) => {
            const review = r.review;
            if (!review) return null;
            return (
              <div key={r.id} className="card-paper p-6 hover:shadow-ink-lg transition-all duration-200">
                <div className="flex items-start gap-6">
                  <Link to={`/records/${r.id}`}>
                    <PatternArt
                      seed={r.pattern_seed}
                      foamState={r.foam_state}
                      size={80}
                      className="rounded-full shrink-0 shadow-ink"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-semibold text-ink-800">{r.practitioner_name}</span>
                        <StatusSeal review={review} />
                        {review.archive_as_experience === 1 && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-tea/10 text-tea-dark border border-tea/20">
                            <Lightbulb size={10} /> 已沉淀
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-ink-400">
                        <span className="font-serif">{review.teacher_name}</span>
                        <span className="text-ink-300">·</span>
                        <span className="text-xs">{formatDate(review.created_at)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 rounded-lg bg-paper">
                        <div className="text-lg font-serif font-semibold text-tea">{review.foam_delicacy_score}</div>
                        <div className="text-[10px] text-ink-400 mt-0.5">汤花细腻度</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-paper">
                        <div className="text-lg font-serif font-semibold text-gold">{review.cup_biting_duration_sec}s</div>
                        <div className="text-[10px] text-ink-400 mt-0.5">咬盏时长</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-paper">
                        <div className="text-lg font-serif font-semibold text-tea-dark">{review.pattern_completeness_score}</div>
                        <div className="text-[10px] text-ink-400 mt-0.5">纹样完整度</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <ScoreBar label="汤花细腻度" value={review.foam_delicacy_score} color="#7C8C5E" />
                      <ScoreBar label="咬盏时长" value={review.cup_biting_duration_sec} max={120} color="#B8924A" />
                      <ScoreBar label="纹样完整度" value={review.pattern_completeness_score} color="#566340" />
                    </div>

                    {review.correction_suggestion && (
                      <div className="mt-4 bg-paper border-l-2 border-gold rounded-r-md px-4 py-3">
                        <div className="text-xs text-ink-400 mb-1">纠偏建议</div>
                        <p className="text-sm text-ink-700 leading-relaxed">{review.correction_suggestion}</p>
                      </div>
                    )}

                    {review.is_successful === 0 && review.failure_reason && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-cinnabar">
                        <XCircle size={14} />
                        <span>失败原因：{review.failure_reason}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-200/40">
                      <div className="text-xs text-ink-400">
                        {r.tea_sample?.name ?? "—"} · {r.technique?.name ?? "—"} · {r.tea_powder_grams}g · {r.water_pour_rounds}轮 · {r.whisking_duration_sec}s
                      </div>
                      <Link to={`/records/${r.id}`} className="text-xs text-gold hover:underline">
                        查看复盘 →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        title="提交点评"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-outline">取消</button>
            <button onClick={handleSubmitReview} disabled={saving || !form.teacher_name} className="btn-ink">
              {saving ? "提交中…" : "提交点评"}
            </button>
          </>
        }
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-paper border border-ink-200/40">
              <div className="flex items-center gap-3">
                <PatternArt
                  seed={selectedRecord.pattern_seed}
                  foamState={selectedRecord.foam_state}
                  size={48}
                  className="rounded-full shadow-ink"
                />
                <div>
                  <div className="font-serif font-semibold text-ink-800">{selectedRecord.practitioner_name}</div>
                  <div className="text-xs text-ink-400">
                    {selectedRecord.tea_sample?.name} · {selectedRecord.technique?.name} · {selectedRecord.foam_state}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="label-ink">老师姓名</label>
              <input
                value={form.teacher_name}
                onChange={(e) => setForm({ ...form, teacher_name: e.target.value })}
                placeholder="点评老师姓名"
                className="input-ink"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label-ink">汤花细腻度</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.foam_delicacy_score}
                  onChange={(e) => setForm({ ...form, foam_delicacy_score: e.target.value })}
                  className="input-ink"
                />
              </div>
              <div>
                <label className="label-ink">咬盏时长(秒)</label>
                <input
                  type="number"
                  min={0}
                  value={form.cup_biting_duration_sec}
                  onChange={(e) => setForm({ ...form, cup_biting_duration_sec: e.target.value })}
                  className="input-ink"
                />
              </div>
              <div>
                <label className="label-ink">纹样完整度</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.pattern_completeness_score}
                  onChange={(e) => setForm({ ...form, pattern_completeness_score: e.target.value })}
                  className="input-ink"
                />
              </div>
            </div>

            <div>
              <label className="label-ink">是否成功</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setForm({ ...form, is_successful: true })}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium border transition-all",
                    form.is_successful
                      ? "bg-tea text-paper-light border-tea"
                      : "border-ink-200 text-ink-600 hover:border-ink-300"
                  )}
                >
                  成功
                </button>
                <button
                  onClick={() => setForm({ ...form, is_successful: false })}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium border transition-all",
                    !form.is_successful
                      ? "bg-cinnabar text-paper-light border-cinnabar"
                      : "border-ink-200 text-ink-600 hover:border-ink-300"
                  )}
                >
                  待改进
                </button>
              </div>
            </div>

            {!form.is_successful && (
              <div>
                <label className="label-ink">失败原因</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {failureReasons.map((r) => (
                    <button
                      key={r}
                      onClick={() => setForm({ ...form, failure_reason: r })}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs border transition-all",
                        form.failure_reason === r
                          ? "bg-cinnabar text-paper-light border-cinnabar"
                          : "border-ink-200 text-ink-600 hover:border-ink-300"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <input
                  value={form.failure_reason}
                  onChange={(e) => setForm({ ...form, failure_reason: e.target.value })}
                  placeholder="或自定义失败原因"
                  className="input-ink"
                />
              </div>
            )}

            <div>
              <label className="label-ink">纠偏建议</label>
              <textarea
                value={form.correction_suggestion}
                onChange={(e) => setForm({ ...form, correction_suggestion: e.target.value })}
                placeholder="给出具体的改进建议"
                rows={3}
                className="input-ink resize-none"
              />
            </div>

            <div className="p-4 rounded-lg bg-tea/5 border border-tea/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb size={16} className="text-tea-dark" />
                  <span className="text-sm font-medium text-ink-700">经验沉淀</span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, archive_as_experience: !form.archive_as_experience })}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    form.archive_as_experience ? "bg-tea" : "bg-ink-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow",
                      form.archive_as_experience ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
              <p className="text-xs text-ink-500">
                {form.archive_as_experience
                  ? "勾选后将自动更新茶样+手法组合的成功统计，形成可复用的经验记录"
                  : "仅保存点评结果，不影响经验统计数据"}
              </p>
              {form.archive_as_experience && (
                <div>
                  <label className="label-ink">
                    <Check size={12} className="inline mr-1" /> 关键要点
                  </label>
                  <textarea
                    value={form.experience_key_points}
                    onChange={(e) => setForm({ ...form, experience_key_points: e.target.value })}
                    placeholder="记录可复用的关键操作要点，如茶粉用量、水温、击拂节奏等（可选，留空将自动填充）"
                    rows={2}
                    className="input-ink resize-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
