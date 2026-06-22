import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Filter,
  Search,
  Edit2,
  Trash2,
  Calendar,
  User,
  Leaf,
  Target,
  Clock,
  ChevronRight,
} from "lucide-react";
import { trainingPlanApi } from "@/api/client";
import { useArchiveStore } from "@/store/useArchiveStore";
import type { TrainingPlan, TrainingPlanCreate, PlanStatus } from "@/types";
import { SectionTitle, formatDateShort } from "@/components/ui";
import Modal from "@/components/Modal";
import { cn } from "@/lib/utils";

const STATUS_META: Record<PlanStatus, { label: string; className: string }> = {
  not_started: { label: "未开始", className: "bg-ink-100 text-ink-500 border-ink-200" },
  in_progress: { label: "进行中", className: "bg-tea/10 text-tea border-tea/30" },
  completed: { label: "已完成", className: "bg-gold/10 text-gold border-gold/30" },
  overdue: { label: "已逾期", className: "bg-cinnabar/10 text-cinnabar border-cinnabar/30" },
};

function computeLocalStatus(plan: TrainingPlan): PlanStatus {
  const now = new Date();
  const start = new Date(plan.start_date);
  const end = new Date(plan.end_date);
  if (now < start) return "not_started";
  if (now > end) return "overdue";
  return "in_progress";
}

function todayISO() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

function addDaysISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export default function TrainingPlans() {
  const { teaSamples, techniques, fetchAll } = useArchiveStore();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [teaFilter, setTeaFilter] = useState<number | "">("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<PlanStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const defaultStart = todayISO();
  const defaultEnd = addDaysISO(28);

  const emptyForm = {
    name: "",
    tea_sample_id: "",
    target_pattern: "",
    target_technique_id: "",
    start_date: defaultStart,
    end_date: defaultEnd,
    weekly_frequency: "2",
    stage_goal: "",
    teacher_name: "",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchAll();
    loadPlans();
  }, [fetchAll]);

  async function loadPlans() {
    setLoading(true);
    try {
      const params: { tea_sample_id?: number; teacher_name?: string; status?: PlanStatus } = {};
      if (teaFilter !== "") params.tea_sample_id = teaFilter;
      if (teacherFilter) params.teacher_name = teacherFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await trainingPlanApi.list(params);
      setPlans(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(loadPlans, 300);
    return () => clearTimeout(t);
  }, [teaFilter, teacherFilter, statusFilter]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, start_date: todayISO(), end_date: addDaysISO(28) });
    setModalOpen(true);
  }

  function openEdit(plan: TrainingPlan) {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      tea_sample_id: String(plan.tea_sample_id),
      target_pattern: plan.target_pattern || "",
      target_technique_id: String(plan.target_technique_id),
      start_date: new Date(plan.start_date).toISOString().slice(0, 16),
      end_date: new Date(plan.end_date).toISOString().slice(0, 16),
      weekly_frequency: String(plan.weekly_frequency),
      stage_goal: plan.stage_goal || "",
      teacher_name: plan.teacher_name,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: TrainingPlanCreate = {
        name: form.name,
        tea_sample_id: Number(form.tea_sample_id),
        target_pattern: form.target_pattern || undefined,
        target_technique_id: Number(form.target_technique_id),
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        weekly_frequency: Number(form.weekly_frequency),
        stage_goal: form.stage_goal || undefined,
        teacher_name: form.teacher_name,
      };
      if (editingId) {
        await trainingPlanApi.update(editingId, payload);
      } else {
        await trainingPlanApi.create(payload);
      }
      await loadPlans();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确认删除此训练计划？关联的课次预约将一同删除。")) return;
    await trainingPlanApi.remove(id);
    await loadPlans();
  }

  const teacherOptions = useMemo(() => {
    const set = new Set<string>();
    plans.forEach((p) => p.teacher_name && set.add(p.teacher_name));
    return Array.from(set);
  }, [plans]);

  const filteredPlans = useMemo(() => {
    if (!searchKeyword) return plans;
    const k = searchKeyword.toLowerCase();
    return plans.filter(
      (p) =>
        p.name.toLowerCase().includes(k) ||
        (p.target_pattern || "").toLowerCase().includes(k) ||
        (p.stage_goal || "").toLowerCase().includes(k)
    );
  }, [plans, searchKeyword]);

  const canSave =
    form.name &&
    form.tea_sample_id &&
    form.target_technique_id &&
    form.start_date &&
    form.end_date &&
    form.teacher_name &&
    Number(form.weekly_frequency) >= 1;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <SectionTitle subtitle="分阶段制定训练目标，排定课次预约，追踪练习进度">
          训练计划
        </SectionTitle>
        <button onClick={openCreate} className="btn-ink">
          <Plus size={16} /> 新建计划
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-ink-400">
          <Filter size={15} /> 筛选：
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-[320px]">
          <Search size={14} className="text-ink-400" />
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索计划名称、目标纹样…"
            className="flex-1 bg-transparent outline-none text-sm text-ink-700 placeholder:text-ink-300"
          />
        </div>
        <select
          value={teaFilter}
          onChange={(e) => setTeaFilter(e.target.value ? Number(e.target.value) : "")}
          className="input-ink w-auto py-1.5"
        >
          <option value="">全部茶样</option>
          {teaSamples.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={teacherFilter}
          onChange={(e) => setTeacherFilter(e.target.value)}
          className="input-ink w-auto py-1.5"
        >
          <option value="">全部老师</option>
          {teacherOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="flex gap-1 bg-paper-light rounded-lg p-1 border border-ink-200/50">
          {(["all", "not_started", "in_progress", "completed", "overdue"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                statusFilter === s ? "bg-ink-800 text-paper-light" : "text-ink-500 hover:text-ink-700"
              )}
            >
              {s === "all" ? "全部状态" : STATUS_META[s].label}
            </button>
          ))}
        </div>
        <span className="text-sm text-ink-400 ml-auto">共 {filteredPlans.length} 个计划</span>
      </div>

      {loading ? (
        <div className="card-paper p-12 text-center text-ink-400 animate-pulse">加载中…</div>
      ) : filteredPlans.length === 0 ? (
        <div className="card-paper p-12 text-center text-ink-400">
          暂无训练计划，点击右上角新建
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((plan) => {
            const status = computeLocalStatus(plan);
            const meta = STATUS_META[status];
            return (
              <div
                key={plan.id}
                className="card-paper p-5 group hover:shadow-ink-lg transition-all duration-200 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-serif font-semibold text-ink-800 truncate text-lg">{plan.name}</h3>
                      <span className={cn("shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium border", meta.className)}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-ink-400 flex items-center gap-1">
                      <User size={11} /> {plan.teacher_name}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-ink-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Leaf size={12} className="text-tea shrink-0" />
                    <span className="truncate">茶样：{plan.tea_sample?.name ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target size={12} className="text-gold shrink-0" />
                    <span className="truncate">手法：{plan.target_technique?.name ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-ink-400 shrink-0" />
                    <span>每周 {plan.weekly_frequency} 次</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-ink-400 shrink-0" />
                    <span>
                      {formatDateShort(plan.start_date)} ~ {formatDateShort(plan.end_date)}
                    </span>
                  </div>
                </div>

                {plan.target_pattern && (
                  <div className="mb-4 px-3 py-2 rounded-lg bg-ink-50 text-xs text-ink-600 border border-ink-100 line-clamp-2">
                    目标纹样：{plan.target_pattern}
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-ink-200/40 flex items-center justify-between">
                  <Link
                    to={`/training-plans/${plan.id}`}
                    className="text-xs text-gold hover:underline flex items-center gap-1"
                  >
                    查看详情 <ChevronRight size={12} />
                  </Link>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(plan)}
                      className="p-1.5 rounded text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
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

      <Modal
        open={modalOpen}
        title={editingId ? "编辑训练计划" : "新建训练计划"}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-outline">
              取消
            </button>
            <button onClick={handleSave} disabled={saving || !canSave} className="btn-ink">
              {saving ? "保存中…" : editingId ? "保存修改" : "创建计划"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label-ink">计划名称 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="如：白茶·梅枝纹进阶训练"
              className="input-ink"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-ink">适用茶样 *</label>
              <select
                value={form.tea_sample_id}
                onChange={(e) => setForm({ ...form, tea_sample_id: e.target.value })}
                className="input-ink"
              >
                <option value="">选择茶样</option>
                {teaSamples.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-ink">目标手法 *</label>
              <select
                value={form.target_technique_id}
                onChange={(e) => setForm({ ...form, target_technique_id: e.target.value })}
                className="input-ink"
              >
                <option value="">选择手法</option>
                {techniques.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label-ink">目标纹样</label>
            <input
              value={form.target_pattern}
              onChange={(e) => setForm({ ...form, target_pattern: e.target.value })}
              placeholder="如：疏影横斜梅枝纹"
              className="input-ink"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-ink">开始日期 *</label>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="input-ink"
              />
            </div>
            <div>
              <label className="label-ink">结束日期 *</label>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="input-ink"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-ink">每周练习频次 *</label>
              <input
                type="number"
                min={1}
                max={7}
                value={form.weekly_frequency}
                onChange={(e) => setForm({ ...form, weekly_frequency: e.target.value })}
                className="input-ink"
              />
            </div>
            <div>
              <label className="label-ink">负责老师 *</label>
              <input
                value={form.teacher_name}
                onChange={(e) => setForm({ ...form, teacher_name: e.target.value })}
                placeholder="主理人姓名"
                className="input-ink"
              />
            </div>
          </div>
          <div>
            <label className="label-ink">阶段目标说明</label>
            <textarea
              value={form.stage_goal}
              onChange={(e) => setForm({ ...form, stage_goal: e.target.value })}
              placeholder="描述本阶段的训练目标与期望达成效果"
              rows={3}
              className="input-ink resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
