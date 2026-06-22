import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Droplets, Leaf, CupSoda, Sparkles, MessageSquareText, Camera, ImagePlus } from "lucide-react";
import { recordApi, reviewApi } from "@/api/client";
import type { PracticeRecord, Review as ReviewType } from "@/types";
import { SectionTitle, StatusSeal, ScoreBar, formatDate } from "@/components/ui";
import PatternArt from "@/components/PatternArt";
import Modal from "@/components/Modal";
import { cn } from "@/lib/utils";

const foamLabels: Record<string, string> = {
  "细密如雪": "沫饽细密，汤面如覆雪",
  "粗散易消": "沫饽粗散，消散较快",
  "乳白绵厚": "乳白绵厚，质地稠密",
  "薄而不匀": "沫饽薄且不均匀",
  "凝乳咬盏": "凝乳状咬盏，持久不散",
};

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

export default function RecordDetail() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    teacher_name: "",
    foam_delicacy_score: "75",
    cup_biting_duration_sec: "30",
    pattern_completeness_score: "70",
    correction_suggestion: "",
    is_successful: true,
    failure_reason: "",
  });

  useEffect(() => {
    if (id) {
      recordApi.get(Number(id)).then(setRecord).finally(() => setLoading(false));
    }
  }, [id]);

  async function handleSubmitReview() {
    if (!record) return;
    setSaving(true);
    try {
      await reviewApi.create({
        practice_record_id: record.id,
        teacher_name: reviewForm.teacher_name,
        foam_delicacy_score: Number(reviewForm.foam_delicacy_score),
        cup_biting_duration_sec: Number(reviewForm.cup_biting_duration_sec),
        pattern_completeness_score: Number(reviewForm.pattern_completeness_score),
        correction_suggestion: reviewForm.correction_suggestion || undefined,
        is_successful: reviewForm.is_successful,
        failure_reason: reviewForm.is_successful ? undefined : reviewForm.failure_reason || undefined,
      });
      const updated = await recordApi.get(record.id);
      setRecord(updated);
      setReviewModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="card-paper p-12 text-center text-ink-400">加载中…</div>;
  }

  if (!record) {
    return (
      <div className="card-paper p-12 text-center text-ink-400">
        <p>未找到此练习记录</p>
        <Link to="/records" className="text-gold hover:underline text-sm mt-2 inline-block">返回列表</Link>
      </div>
    );
  }

  const review = record.review;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/records" className="p-1.5 rounded-md hover:bg-ink-50 text-ink-400 hover:text-ink-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-semibold text-ink-800">{record.practitioner_name} 的点茶记录</h1>
            <StatusSeal review={review} />
          </div>
          <p className="text-sm text-ink-400 mt-0.5">{formatDate(record.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card-paper p-6 flex flex-col items-center">
            <PatternArt
              seed={record.pattern_seed}
              foamState={record.foam_state}
              size={220}
              className="rounded-full shadow-ink-lg mb-4"
            />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-lg font-serif font-semibold text-ink-800">纹样示意</span>
              </div>
              <p className="text-sm text-ink-500 leading-relaxed">
                {record.pattern_description || "未记录纹样描述"}
              </p>
            </div>
            <div className="w-full mt-4 pt-4 border-t border-ink-200/40">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-ink-400">沫饽状态</span>
              </div>
              <span className={cn(
                "inline-block px-3 py-1 rounded-md text-sm font-medium",
                record.foam_state === "凝乳咬盏" || record.foam_state === "细密如雪"
                  ? "bg-tea/10 text-tea-dark"
                  : record.foam_state === "粗散易消" || record.foam_state === "薄而不匀"
                  ? "bg-cinnabar/10 text-cinnabar"
                  : "bg-gold/10 text-gold-dark"
              )}>
                {record.foam_state}
              </span>
              {foamLabels[record.foam_state] && (
                <p className="text-xs text-ink-400 mt-1.5">{foamLabels[record.foam_state]}</p>
              )}
            </div>
          </div>

          <div className="card-paper p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-gold" />
                <span className="text-sm font-serif font-semibold text-ink-800">最终纹样照片占位</span>
              </div>
              {!record.pattern_photo_url && (
                <span className="text-[10px] text-ink-300">未上传</span>
              )}
            </div>
            {record.pattern_photo_url ? (
              <div>
                <div className="w-full aspect-square rounded-lg border-2 border-dashed border-gold/40 bg-paper-light flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "radial-gradient(circle, #B8924A 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }} />
                  <div className="relative text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                      <Camera size={22} className="text-gold" />
                    </div>
                    <div className="font-serif font-semibold text-ink-800 text-sm mb-1">
                      {photoLabelMap[record.pattern_photo_url] || "纹样照片"}
                    </div>
                    <div className="text-xs text-ink-400 leading-relaxed">
                      照片占位标识<br />
                      等待实际拍照归档
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gold/10 text-gold-dark text-[10px] font-medium">
                      <ImagePlus size={10} /> 点位：{record.pattern_photo_url}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-square rounded-lg border-2 border-dashed border-ink-200 flex flex-col items-center justify-center bg-paper-light/50">
                <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center mb-2 opacity-60">
                  <ImagePlus size={18} className="text-ink-300" />
                </div>
                <div className="text-xs text-ink-300">未设置照片占位</div>
                <div className="text-[10px] text-ink-200 mt-1">录入点茶时可选择纹样类型占位</div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card-paper p-6">
            <SectionTitle subtitle="本次点茶所用的器具组合">器具组合</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-paper border border-ink-200/40">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf size={16} className="text-tea" />
                  <span className="text-xs text-ink-400">茶样</span>
                </div>
                <div className="font-serif font-semibold text-ink-800 text-sm">{record.tea_sample?.name ?? "—"}</div>
                {record.tea_sample?.origin && <div className="text-xs text-ink-400 mt-0.5">{record.tea_sample.origin}</div>}
              </div>
              <div className="p-4 rounded-lg bg-paper border border-ink-200/40">
                <div className="flex items-center gap-2 mb-2">
                  <CupSoda size={16} className="text-gold" />
                  <span className="text-xs text-ink-400">茶盏</span>
                </div>
                <div className="font-serif font-semibold text-ink-800 text-sm">{record.tea_bowl?.name ?? "—"}</div>
                {record.tea_bowl?.glaze && <div className="text-xs text-ink-400 mt-0.5">{record.tea_bowl.glaze}釉</div>}
              </div>
              <div className="p-4 rounded-lg bg-paper border border-ink-200/40">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-tea-dark" />
                  <span className="text-xs text-ink-400">茶筅</span>
                </div>
                <div className="font-serif font-semibold text-ink-800 text-sm">{record.tea_whisk?.name ?? "—"}</div>
                {record.tea_whisk?.material && <div className="text-xs text-ink-400 mt-0.5">{record.tea_whisk.material}</div>}
              </div>
              <div className="p-4 rounded-lg bg-paper border border-ink-200/40">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets size={16} className="text-cinnabar" />
                  <span className="text-xs text-ink-400">手法</span>
                </div>
                <div className="font-serif font-semibold text-ink-800 text-sm">{record.technique?.name ?? "—"}</div>
                {record.technique?.pour_speed && <div className="text-xs text-ink-400 mt-0.5">{record.technique.pour_speed}</div>}
              </div>
            </div>
          </div>

          <div className="card-paper p-6">
            <SectionTitle subtitle="茶粉用量、注水轮次、击拂时长等关键参数">操作参数</SectionTitle>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-5 rounded-lg bg-paper border border-ink-200/40">
                <div className="text-3xl font-serif font-bold text-tea">{record.tea_powder_grams}</div>
                <div className="text-xs text-ink-400 mt-1">茶粉 (g)</div>
              </div>
              <div className="text-center p-5 rounded-lg bg-paper border border-ink-200/40">
                <div className="text-3xl font-serif font-bold text-gold">{record.water_pour_rounds}</div>
                <div className="text-xs text-ink-400 mt-1">注水轮次</div>
              </div>
              <div className="text-center p-5 rounded-lg bg-paper border border-ink-200/40">
                <div className="text-3xl font-serif font-bold text-ink-800">{record.whisking_duration_sec}s</div>
                <div className="text-xs text-ink-400 mt-1">击拂时长</div>
              </div>
            </div>
          </div>

          {review ? (
            <div className="card-paper p-6">
              <div className="flex items-center justify-between mb-5">
                <SectionTitle subtitle="老师按三维度给出评分和纠偏建议" className="mb-0">点评反馈</SectionTitle>
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <MessageSquareText size={15} />
                  <span className="font-serif">{review.teacher_name}</span>
                  <span className="text-ink-300">·</span>
                  <span className="text-xs text-ink-400">{formatDate(review.created_at)}</span>
                </div>
              </div>

              <div className="space-y-5">
                <ScoreBar
                  label="汤花细腻度"
                  value={review.foam_delicacy_score}
                  color="#7C8C5E"
                />
                <ScoreBar
                  label="咬盏时长"
                  value={review.cup_biting_duration_sec}
                  max={120}
                  color="#B8924A"
                />
                <ScoreBar
                  label="纹样完整度"
                  value={review.pattern_completeness_score}
                  color="#566340"
                />
              </div>

              {review.correction_suggestion && (
                <div className="mt-5 pt-5 border-t border-ink-200/40">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-ink-600">纠偏建议</span>
                  </div>
                  <div className="bg-paper border-l-2 border-gold rounded-r-md px-4 py-3">
                    <p className="text-sm text-ink-700 leading-relaxed">{review.correction_suggestion}</p>
                  </div>
                </div>
              )}

              {review.is_successful === 0 && review.failure_reason && (
                <div className="mt-4 p-4 rounded-lg bg-cinnabar/5 border border-cinnabar/20">
                  <div className="flex items-center gap-2 text-cinnabar text-sm font-medium mb-1">
                    <span>失败原因：{review.failure_reason}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card-paper p-6">
              <SectionTitle subtitle="此记录尚未被点评">点评反馈</SectionTitle>
              <div className="text-center py-8">
                <div className="text-ink-300 mb-3">
                  <MessageSquareText size={40} className="mx-auto opacity-30" />
                </div>
                <p className="text-ink-400 mb-4">此练习记录尚待老师点评</p>
                <button onClick={() => setReviewModalOpen(true)} className="btn-ink">
                  <MessageSquareText size={16} /> 提交点评
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={reviewModalOpen}
        title="提交点评"
        onClose={() => setReviewModalOpen(false)}
        footer={
          <>
            <button onClick={() => setReviewModalOpen(false)} className="btn-outline">取消</button>
            <button onClick={handleSubmitReview} disabled={saving || !reviewForm.teacher_name} className="btn-ink">
              {saving ? "提交中…" : "提交点评"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label-ink">老师姓名</label>
            <input
              value={reviewForm.teacher_name}
              onChange={(e) => setReviewForm({ ...reviewForm, teacher_name: e.target.value })}
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
                value={reviewForm.foam_delicacy_score}
                onChange={(e) => setReviewForm({ ...reviewForm, foam_delicacy_score: e.target.value })}
                className="input-ink"
              />
            </div>
            <div>
              <label className="label-ink">咬盏时长(秒)</label>
              <input
                type="number"
                min={0}
                value={reviewForm.cup_biting_duration_sec}
                onChange={(e) => setReviewForm({ ...reviewForm, cup_biting_duration_sec: e.target.value })}
                className="input-ink"
              />
            </div>
            <div>
              <label className="label-ink">纹样完整度</label>
              <input
                type="number"
                min={0}
                max={100}
                value={reviewForm.pattern_completeness_score}
                onChange={(e) => setReviewForm({ ...reviewForm, pattern_completeness_score: e.target.value })}
                className="input-ink"
              />
            </div>
          </div>

          <div>
            <label className="label-ink">是否成功</label>
            <div className="flex gap-2">
              <button
                onClick={() => setReviewForm({ ...reviewForm, is_successful: true })}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium border transition-all",
                  reviewForm.is_successful
                    ? "bg-tea text-paper-light border-tea"
                    : "border-ink-200 text-ink-600 hover:border-ink-300"
                )}
              >
                成功
              </button>
              <button
                onClick={() => setReviewForm({ ...reviewForm, is_successful: false })}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium border transition-all",
                  !reviewForm.is_successful
                    ? "bg-cinnabar text-paper-light border-cinnabar"
                    : "border-ink-200 text-ink-600 hover:border-ink-300"
                )}
              >
                待改进
              </button>
            </div>
          </div>

          {!reviewForm.is_successful && (
            <div>
              <label className="label-ink">失败原因</label>
              <input
                value={reviewForm.failure_reason}
                onChange={(e) => setReviewForm({ ...reviewForm, failure_reason: e.target.value })}
                placeholder="如 沫饽粗散、咬盏时长不足、纹样断裂"
                className="input-ink"
              />
            </div>
          )}

          <div>
            <label className="label-ink">纠偏建议</label>
            <textarea
              value={reviewForm.correction_suggestion}
              onChange={(e) => setReviewForm({ ...reviewForm, correction_suggestion: e.target.value })}
              placeholder="给出具体的改进建议"
              rows={3}
              className="input-ink resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
