import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Filter, Trash2, Camera } from "lucide-react";
import { recordApi } from "@/api/client";
import { useArchiveStore } from "@/store/useArchiveStore";
import type { PracticeRecord, RecordStatus } from "@/types";
import { SectionTitle, StatusSeal, formatDate } from "@/components/ui";
import PatternArt from "@/components/PatternArt";
import Modal from "@/components/Modal";
import { cn } from "@/lib/utils";

const foamStates = ["细密如雪", "粗散易消", "乳白绵厚", "薄而不匀", "凝乳咬盏"];

const photoPlaceholders = [
  { key: "bamboo_slope", label: "竹枝斜出" },
  { key: "plum_shadow", label: "梅枝疏影" },
  { key: "orchid_three", label: "兰叶三笔" },
  { key: "cloud_roll", label: "云纹舒卷" },
  { key: "pine_needle", label: "松针细描" },
  { key: "far_mountain", label: "远山如黛" },
  { key: "moon_circle", label: "月映汤面" },
  { key: "lotus_leaf", label: "荷露初凝" },
];

export default function Records() {
  const { teaSamples, teaBowls, teaWhisks, techniques, fetchAll } = useArchiveStore();
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [status, setStatus] = useState<RecordStatus>("all");
  const [teaFilter, setTeaFilter] = useState<number | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    practitioner_name: "",
    tea_sample_id: "",
    tea_bowl_id: "",
    tea_whisk_id: "",
    technique_id: "",
    tea_powder_grams: "2.5",
    water_pour_rounds: "3",
    whisking_duration_sec: "180",
    foam_state: "细密如雪",
    pattern_description: "",
    pattern_photo_url: "",
  });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    loadRecords();
  }, [status, teaFilter]);

  async function loadRecords() {
    const params: { status?: RecordStatus; tea_sample_id?: number } = {};
    if (status !== "all") params.status = status;
    if (teaFilter !== "") params.tea_sample_id = teaFilter;
    const data = await recordApi.list(params);
    setRecords(data);
  }

  async function handleCreate() {
    setSaving(true);
    try {
      await recordApi.create({
        practitioner_name: form.practitioner_name,
        tea_sample_id: Number(form.tea_sample_id),
        tea_bowl_id: Number(form.tea_bowl_id),
        tea_whisk_id: Number(form.tea_whisk_id),
        technique_id: Number(form.technique_id),
        tea_powder_grams: Number(form.tea_powder_grams),
        water_pour_rounds: Number(form.water_pour_rounds),
        whisking_duration_sec: Number(form.whisking_duration_sec),
        foam_state: form.foam_state,
        pattern_description: form.pattern_description || undefined,
        pattern_photo_url: form.pattern_photo_url || undefined,
      });
      await loadRecords();
      setModalOpen(false);
      setForm({
        ...form,
        practitioner_name: "",
        pattern_description: "",
        pattern_photo_url: "",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确认删除此练习记录？")) return;
    await recordApi.remove(id);
    await loadRecords();
  }

  const statusTabs: { key: RecordStatus; label: string }[] = [
    { key: "all", label: "全部" },
    { key: "success", label: "成功" },
    { key: "fail", label: "待改进" },
    { key: "pending", label: "待点评" },
  ];

  const canCreate =
    form.practitioner_name &&
    form.tea_sample_id &&
    form.tea_bowl_id &&
    form.tea_whisk_id &&
    form.technique_id;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <SectionTitle subtitle="记录每次点茶的茶粉、注水、击拂与沫饽状态">
          练习记录
        </SectionTitle>
        <button onClick={() => setModalOpen(true)} className="btn-ink">
          <Plus size={16} /> 录入点茶
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm text-ink-400">
          <Filter size={15} /> 筛选：
        </div>
        <div className="flex gap-1 bg-paper-light rounded-lg p-1 border border-ink-200/50">
          {statusTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                status === t.key ? "bg-ink-800 text-paper-light" : "text-ink-500 hover:text-ink-700"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          value={teaFilter}
          onChange={(e) => setTeaFilter(e.target.value ? Number(e.target.value) : "")}
          className="input-ink w-auto py-1.5"
        >
          <option value="">全部茶样</option>
          {teaSamples.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <span className="text-sm text-ink-400 ml-auto">共 {records.length} 条</span>
      </div>

      {records.length === 0 ? (
        <div className="card-paper p-12 text-center text-ink-400">
          暂无练习记录，点击右上角录入
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((r) => (
            <div key={r.id} className="card-paper p-5 group hover:shadow-ink-lg transition-all duration-200">
              <div className="flex items-start gap-4">
                <Link to={`/records/${r.id}`} className="relative">
                  <PatternArt
                    seed={r.pattern_seed}
                    foamState={r.foam_state}
                    size={72}
                    className="rounded-full shrink-0 shadow-ink"
                  />
                  {r.pattern_photo_url && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gold border-2 border-paper-light flex items-center justify-center shadow-ink">
                      <Camera size={10} className="text-paper-light" />
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-serif font-semibold text-ink-800 truncate">{r.practitioner_name}</span>
                    <StatusSeal review={r.review} />
                  </div>
                  <div className="text-xs text-ink-500 space-y-0.5">
                    <div>茶样 · {r.tea_sample?.name ?? "—"}</div>
                    <div>手法 · {r.technique?.name ?? "—"}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-ink-200/40">
                <div className="text-center">
                  <div className="text-sm font-serif font-semibold text-ink-800">{r.tea_powder_grams}g</div>
                  <div className="text-[10px] text-ink-400">茶粉</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-serif font-semibold text-ink-800">{r.water_pour_rounds}</div>
                  <div className="text-[10px] text-ink-400">注水轮次</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-serif font-semibold text-ink-800">{r.whisking_duration_sec}s</div>
                  <div className="text-[10px] text-ink-400">击拂</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-ink-400">{formatDate(r.created_at)}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/records/${r.id}`}
                    className="text-xs text-gold hover:underline"
                  >
                    复盘 →
                  </Link>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1 rounded text-ink-400 hover:text-cinnabar transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title="录入点茶记录"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-outline">取消</button>
            <button onClick={handleCreate} disabled={saving || !canCreate} className="btn-ink">
              {saving ? "保存中…" : "记录"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label-ink">练习者</label>
            <input
              value={form.practitioner_name}
              onChange={(e) => setForm({ ...form, practitioner_name: e.target.value })}
              placeholder="练习者姓名"
              className="input-ink"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-ink">茶样</label>
              <select
                value={form.tea_sample_id}
                onChange={(e) => setForm({ ...form, tea_sample_id: e.target.value })}
                className="input-ink"
              >
                <option value="">选择茶样</option>
                {teaSamples.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-ink">茶盏</label>
              <select
                value={form.tea_bowl_id}
                onChange={(e) => setForm({ ...form, tea_bowl_id: e.target.value })}
                className="input-ink"
              >
                <option value="">选择茶盏</option>
                {teaBowls.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-ink">茶筅</label>
              <select
                value={form.tea_whisk_id}
                onChange={(e) => setForm({ ...form, tea_whisk_id: e.target.value })}
                className="input-ink"
              >
                <option value="">选择茶筅</option>
                {teaWhisks.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-ink">注汤手法</label>
              <select
                value={form.technique_id}
                onChange={(e) => setForm({ ...form, technique_id: e.target.value })}
                className="input-ink"
              >
                <option value="">选择手法</option>
                {techniques.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label-ink">茶粉(g)</label>
              <input
                type="number"
                step="0.1"
                value={form.tea_powder_grams}
                onChange={(e) => setForm({ ...form, tea_powder_grams: e.target.value })}
                className="input-ink"
              />
            </div>
            <div>
              <label className="label-ink">注水轮次</label>
              <input
                type="number"
                value={form.water_pour_rounds}
                onChange={(e) => setForm({ ...form, water_pour_rounds: e.target.value })}
                className="input-ink"
              />
            </div>
            <div>
              <label className="label-ink">击拂(秒)</label>
              <input
                type="number"
                value={form.whisking_duration_sec}
                onChange={(e) => setForm({ ...form, whisking_duration_sec: e.target.value })}
                className="input-ink"
              />
            </div>
          </div>
          <div>
            <label className="label-ink">沫饽状态</label>
            <div className="flex flex-wrap gap-2">
              {foamStates.map((s) => (
                <button
                  key={s}
                  onClick={() => setForm({ ...form, foam_state: s })}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm border transition-all",
                    form.foam_state === s
                      ? "bg-ink-800 text-paper-light border-ink-800"
                      : "border-ink-200 text-ink-600 hover:border-ink-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-ink">纹样描述</label>
            <textarea
              value={form.pattern_description}
              onChange={(e) => setForm({ ...form, pattern_description: e.target.value })}
              placeholder="描述本次纹样，如 竹枝斜出，留白处似远山"
              rows={2}
              className="input-ink resize-none"
            />
          </div>
          <div>
            <label className="label-ink flex items-center gap-1.5">
              <Camera size={14} /> 纹样照片占位
            </label>
            <p className="text-xs text-ink-400 mb-2">选择对应纹样类型作为照片占位标识（实际拍照留位）</p>
            <div className="flex flex-wrap gap-2">
              {photoPlaceholders.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setForm({ ...form, pattern_photo_url: form.pattern_photo_url === p.key ? "" : p.key })}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs border transition-all flex items-center gap-1",
                    form.pattern_photo_url === p.key
                      ? "bg-gold text-paper-light border-gold shadow-ink"
                      : "border-ink-200 text-ink-600 hover:border-ink-300 bg-paper-light"
                  )}
                >
                  <Camera size={11} /> {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
