import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Leaf,
  Target,
  Clock,
  CheckCircle2,
  Play,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  BookOpen,
  MessageSquareText,
  AlertTriangle,
} from "lucide-react";
import { trainingPlanApi, trainingSessionApi } from "@/api/client";
import { useArchiveStore } from "@/store/useArchiveStore";
import type { TrainingPlanDetail, TrainingSession, TrainingSessionCreate, SessionStatus } from "@/types";
import { SectionTitle, StatCard, ScoreBar, formatDate, formatDateShort } from "@/components/ui";
import Modal from "@/components/Modal";
import { cn } from "@/lib/utils";

const SESSION_STATUS_META: Record<SessionStatus, { label: string; className: string }> = {
  scheduled: { label: "待预约", className: "bg-ink-100 text-ink-500 border-ink-200" },
  completed: { label: "已完成", className: "bg-tea/10 text-tea border-tea/30" },
  cancelled: { label: "已取消", className: "bg-cinnabar/10 text-cinnabar border-cinnabar/30" },
};

function nextWeekISO() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(14, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export default function TrainingPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const planId = Number(id);
  const { teaBowls, teaWhisks, fetchAll } = useArchiveStore();
  const [plan, setPlan] = useState<TrainingPlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [savingSession, setSavingSession] = useState(false);

  const emptySession = {
    session_date: nextWeekISO(),
    practitioner_name: "",
    expected_tea_bowl_id: "",
    expected_tea_whisk_id: "",
    status: "scheduled" as SessionStatus,
    pre_session_tip: "",
  };
  const [sessionForm, setSessionForm] = useState(emptySession);

  useEffect(() => {
    fetchAll();
    loadPlan();
  }, [planId, fetchAll]);

  async function loadPlan() {
    setLoading(true);
    try {
      const data = await trainingPlanApi.get(planId);
      setPlan(data);
    } finally {
      setLoading(false);
    }
  }

  function openCreateSession() {
    setEditingSession(null);
    setSessionForm({ ...emptySession, session_date: nextWeekISO() });
    setSessionModalOpen(true);
  }

  function openEditSession(s: TrainingSession) {
    setEditingSession(s);
    setSessionForm({
      session_date: new Date(s.session_date).toISOString().slice(0, 16),
      practitioner_name: s.practitioner_name,
      expected_tea_bowl_id: s.expected_tea_bowl_id ? String(s.expected_tea_bowl_id) : "",
      expected_tea_whisk_id: s.expected_tea_whisk_id ? String(s.expected_tea_whisk_id) : "",
      status: s.status,
      pre_session_tip: s.pre_session_tip || "",
    });
    setSessionModalOpen(true);
  }

  async function handleSaveSession() {
    setSavingSession(true);
    try {
      const payload: TrainingSessionCreate = {
        plan_id: planId,
        session_date: new Date(sessionForm.session_date).toISOString(),
        practitioner_name: sessionForm.practitioner_name,
        expected_tea_bowl_id: sessionForm.expected_tea_bowl_id ? Number(sessionForm.expected_tea_bowl_id) : undefined,
        expected_tea_whisk_id: sessionForm.expected_tea_whisk_id ? Number(sessionForm.expected_tea_whisk_id) : undefined,
        status: sessionForm.status,
        pre_session_tip: sessionForm.pre_session_tip || undefined,
      };
      if (editingSession) {
        await trainingSessionApi.update(editingSession.id, payload);
      } else {
        await trainingSessionApi.create(payload);
      }
      await loadPlan();
      setSessionModalOpen(false);
    } finally {
      setSavingSession(false);
    }
  }

  async function handleDeleteSession(id: number) {
    if (!confirm("确认删除此课次预约？")) return;
    await trainingSessionApi.remove(id);
    await loadPlan();
  }

  const canSaveSession = sessionForm.practitioner_name && sessionForm.session_date;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card-paper p-12 text-center text-ink-400 animate-pulse">加载中…</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-6">
        <Link to="/training-plans" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700">
          <ArrowLeft size={14} /> 返回计划列表
        </Link>
        <div className="card-paper p-12 text-center text-ink-400">计划不存在或已被删除</div>
      </div>
    );
  }

  const totalSessions = plan.sessions.length;
  const scheduledSessions = plan.sessions.filter((s) => s.status === "scheduled").length;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/training-plans" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700 mb-4">
          <ArrowLeft size={14} /> 返回计划列表
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-baseline gap-3">
              <div className="w-1 h-8 bg-gold rounded-full" />
              <h2 className="text-2xl font-serif font-semibold text-ink-800">{plan.name}</h2>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 ml-4">
              <span className="flex items-center gap-1"><User size={11} /> {plan.teacher_name}</span>
              <span className="flex items-center gap-1"><Leaf size={11} className="text-tea" /> {plan.tea_sample?.name ?? "—"}</span>
              <span className="flex items-center gap-1"><Target size={11} className="text-gold" /> {plan.target_technique?.name ?? "—"}</span>
              <span className="flex items-center gap-1"><Clock size={11} /> 每周 {plan.weekly_frequency} 次</span>
              <span className="flex items-center gap-1">
                <Calendar size={11} /> {formatDateShort(plan.start_date)} ~ {formatDateShort(plan.end_date)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {plan.stage_goal && (
        <div className="card-paper p-5 border-l-4 border-gold bg-gradient-to-r from-gold/5 to-transparent">
          <div className="flex items-start gap-3">
            <BookOpen size={18} className="text-gold shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-gold mb-1">阶段目标说明</div>
              <p className="text-sm text-ink-600 whitespace-pre-wrap leading-relaxed">{plan.stage_goal}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="text-sm font-medium text-ink-600 mb-3 flex items-center gap-2">
          <TrendingUp size={15} className="text-tea" /> 进度看板
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="已完成课次"
            value={`${plan.completed_sessions}/${totalSessions}`}
            icon={<CheckCircle2 size={18} />}
            accent="tea"
          />
          <StatCard
            label="关联练习次数"
            value={plan.linked_records_count}
            icon={<Play size={18} />}
            accent="ink"
          />
          <StatCard
            label="已点评次数"
            value={plan.reviewed_count}
            icon={<MessageSquareText size={18} />}
            accent="gold"
          />
          <StatCard
            label="成功次数"
            value={plan.success_count}
            icon={<CheckCircle2 size={18} />}
            accent="tea"
          />
          <StatCard
            label="阶段达成率"
            value={plan.achievement_rate}
            suffix="%"
            icon={<TrendingUp size={18} />}
            accent="gold"
          />
        </div>
      </div>

      <div className="card-paper p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-ink-500" />
            <h3 className="font-serif font-semibold text-ink-800">课次预约管理</h3>
            <span className="text-xs text-ink-400">
              已完成 {plan.completed_sessions} · 待预约 {scheduledSessions} · 共 {totalSessions}
            </span>
          </div>
          <button onClick={openCreateSession} className="btn-ink !py-1.5 !px-3 text-xs">
            <Plus size={13} /> 添加课次
          </button>
        </div>

        {totalSessions === 0 ? (
          <div className="text-center py-10 text-ink-400 text-sm">
            暂无课次预约，点击右上角添加
          </div>
        ) : (
          <div className="space-y-2">
            {plan.sessions.map((s) => {
              const meta = SESSION_STATUS_META[s.status];
              return (
                <div
                  key={s.id}
                  className={cn(
                    "group border rounded-lg p-4 transition-all",
                    "border-ink-200/50 hover:border-ink-300 hover:bg-ink-50/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={13} className="text-ink-400 shrink-0" />
                        <span className="font-medium text-ink-800 text-sm">{formatDate(s.session_date)}</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", meta.className)}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500 ml-5">
                        <span className="flex items-center gap-1"><User size={10} /> {s.practitioner_name}</span>
                        {s.expected_tea_bowl && (
                          <span>茶盏：{s.expected_tea_bowl.name}</span>
                        )}
                        {s.expected_tea_whisk && (
                          <span>茶筅：{s.expected_tea_whisk.name}</span>
                        )}
                      </div>
                      {s.pre_session_tip && (
                        <div className="mt-2 ml-5 px-3 py-1.5 rounded-md bg-gold/5 border border-gold/20 text-xs text-ink-600">
                          <span className="text-gold font-medium mr-1.5">课前提示：</span>
                          {s.pre_session_tip}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => openEditSession(s)}
                        className="p-1.5 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteSession(s.id)}
                        className="p-1.5 rounded text-ink-400 hover:text-cinnabar hover:bg-cinnabar/5 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(plan.recent_reviews.length > 0 || plan.pending_improvements.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card-paper p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquareText size={16} className="text-gold" />
              <h3 className="font-serif font-semibold text-ink-800">最近点评建议</h3>
            </div>
            {plan.recent_reviews.length === 0 ? (
              <div className="text-center py-6 text-ink-400 text-sm">暂无点评</div>
            ) : (
              <div className="space-y-3">
                {plan.recent_reviews.map((r, i) => (
                  <div key={i} className="p-3 rounded-lg border border-ink-200/50 bg-paper-light">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-ink-700">
                        {r.practitioner_name} · {r.teacher_name}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded",
                          r.is_successful === 1
                            ? "bg-tea/10 text-tea"
                            : "bg-cinnabar/10 text-cinnabar"
                        )}
                      >
                        {r.is_successful === 1 ? "成功" : "待改进"}
                      </span>
                    </div>
                    {r.correction_suggestion && (
                      <p className="text-xs text-ink-600 leading-relaxed">{r.correction_suggestion}</p>
                    )}
                    <div className="mt-1.5 text-[10px] text-ink-400">{formatDate(r.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card-paper p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-cinnabar" />
              <h3 className="font-serif font-semibold text-ink-800">待改进项</h3>
            </div>
            {plan.pending_improvements.length === 0 ? (
              <div className="text-center py-6 text-ink-400 text-sm">
                {plan.reviewed_count > 0 ? "暂无待改进项，继续保持！" : "暂无点评记录"}
              </div>
            ) : (
              <div className="space-y-3">
                {plan.pending_improvements.map((r, i) => (
                  <div key={i} className="p-3 rounded-lg border border-cinnabar/20 bg-cinnabar/5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <XCircle size={12} className="text-cinnabar shrink-0" />
                      <span className="text-xs font-medium text-cinnabar-700">
                        {r.practitioner_name}
                      </span>
                    </div>
                    {r.correction_suggestion && (
                      <p className="text-xs text-ink-600 leading-relaxed">{r.correction_suggestion}</p>
                    )}
                    <div className="mt-1.5 text-[10px] text-ink-400">
                      {r.teacher_name} 点评 · {formatDate(r.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {plan.achievement_rate > 0 && (
        <div className="card-paper p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-tea" />
            <h3 className="font-serif font-semibold text-ink-800">阶段达成进度</h3>
          </div>
          <div className="px-4 py-2">
            <ScoreBar
              label="课次完成进度"
              value={plan.achievement_rate}
              max={100}
              color="#7C8C5E"
            />
            <div className="mt-4 grid grid-cols-3 gap-6 text-xs text-center">
              <div>
                <div className="text-2xl font-serif font-semibold text-tea">{plan.completed_sessions}</div>
                <div className="text-ink-400 mt-0.5">已完成课次</div>
              </div>
              <div>
                <div className="text-2xl font-serif font-semibold text-ink-700">
                  {plan.reviewed_count > 0
                    ? Math.round((plan.success_count / plan.reviewed_count) * 100)
                    : 0}
                  <span className="text-sm">%</span>
                </div>
                <div className="text-ink-400 mt-0.5">练习成功率</div>
              </div>
              <div>
                <div className="text-2xl font-serif font-semibold text-gold">{plan.linked_records_count}</div>
                <div className="text-ink-400 mt-0.5">关联练习数</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={sessionModalOpen}
        title={editingSession ? "编辑课次预约" : "添加课次预约"}
        onClose={() => setSessionModalOpen(false)}
        footer={
          <>
            <button onClick={() => setSessionModalOpen(false)} className="btn-outline">
              取消
            </button>
            <button onClick={handleSaveSession} disabled={savingSession || !canSaveSession} className="btn-ink">
              {savingSession ? "保存中…" : editingSession ? "保存修改" : "添加课次"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-ink">预约日期 *</label>
              <input
                type="datetime-local"
                value={sessionForm.session_date}
                onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })}
                className="input-ink"
              />
            </div>
            <div>
              <label className="label-ink">课次状态</label>
              <select
                value={sessionForm.status}
                onChange={(e) =>
                  setSessionForm({ ...sessionForm, status: e.target.value as SessionStatus })
                }
                className="input-ink"
              >
                <option value="scheduled">待预约</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-ink">练习者 *</label>
            <input
              value={sessionForm.practitioner_name}
              onChange={(e) => setSessionForm({ ...sessionForm, practitioner_name: e.target.value })}
              placeholder="练习者姓名"
              className="input-ink"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-ink">预计茶盏</label>
              <select
                value={sessionForm.expected_tea_bowl_id}
                onChange={(e) => setSessionForm({ ...sessionForm, expected_tea_bowl_id: e.target.value })}
                className="input-ink"
              >
                <option value="">不指定</option>
                {teaBowls.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-ink">预计茶筅</label>
              <select
                value={sessionForm.expected_tea_whisk_id}
                onChange={(e) => setSessionForm({ ...sessionForm, expected_tea_whisk_id: e.target.value })}
                className="input-ink"
              >
                <option value="">不指定</option>
                {teaWhisks.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label-ink">课前提示</label>
            <textarea
              value={sessionForm.pre_session_tip}
              onChange={(e) => setSessionForm({ ...sessionForm, pre_session_tip: e.target.value })}
              placeholder="如：提前温盏、准备茶粉 2.5g、注意水温 85 度"
              rows={2}
              className="input-ink resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
