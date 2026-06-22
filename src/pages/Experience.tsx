import { useEffect, useState } from "react";
import { Lightbulb, Plus, TrendingUp, CheckCircle2 } from "lucide-react";
import { experienceApi } from "@/api/client";
import { useArchiveStore } from "@/store/useArchiveStore";
import type { Experience, ExperienceCreate } from "@/types";
import { SectionTitle } from "@/components/ui";
import Modal from "@/components/Modal";

export default function ExperiencePage() {
  const { teaSamples, techniques, fetchAll } = useArchiveStore();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    tea_sample_id: "",
    technique_id: "",
    summary: "",
    key_points: "",
  });

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    loadExperiences();
  }, []);

  async function loadExperiences() {
    setLoading(true);
    try {
      const data = await experienceApi.list();
      setExperiences(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setSaving(true);
    try {
      const payload: ExperienceCreate = {
        tea_sample_id: Number(form.tea_sample_id),
        technique_id: Number(form.technique_id),
        summary: form.summary,
        key_points: form.key_points || undefined,
      };
      await experienceApi.create(payload);
      await loadExperiences();
      setModalOpen(false);
      setForm({ tea_sample_id: "", technique_id: "", summary: "", key_points: "" });
    } finally {
      setSaving(false);
    }
  }

  const canCreate = form.tea_sample_id && form.technique_id && form.summary;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <SectionTitle subtitle="不同茶样在不同手法下的成功经验，反哺下一轮练习">
          经验沉淀
        </SectionTitle>
        <button onClick={() => setModalOpen(true)} className="btn-ink">
          <Plus size={16} /> 新增经验
        </button>
      </div>

      {loading ? (
        <div className="card-paper p-12 text-center text-ink-400">加载中…</div>
      ) : experiences.length === 0 ? (
        <div className="card-paper p-12 text-center text-ink-400">
          <Lightbulb size={32} className="mx-auto mb-3 opacity-40" />
          暂无经验记录，点击右上角新增
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiences.map((exp) => {
            const pct = exp.total_count > 0 ? (exp.success_count / exp.total_count) * 100 : 0;
            const verified = exp.success_count >= 2;
            return (
              <div key={exp.id} className="card-paper p-5 hover:shadow-ink-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-gold" />
                    <span className="font-serif font-semibold text-ink-800">
                      {exp.tea_sample?.name ?? "未知茶样"}
                    </span>
                    <span className="text-ink-300">×</span>
                    <span className="font-serif font-semibold" style={{ color: "#B8924A" }}>
                      {exp.technique?.name ?? "未知手法"}
                    </span>
                  </div>
                  {verified && (
                    <span className="seal flex items-center gap-1">
                      <CheckCircle2 size={12} /> 已验证
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-ink-500">成功比率</span>
                    <span className="text-sm font-serif font-medium text-ink-700">
                      {exp.success_count}/{exp.total_count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: "#7C8C5E" }}
                    />
                  </div>
                </div>

                <p className="text-sm text-ink-600 leading-relaxed mb-3">{exp.summary}</p>

                {exp.key_points && (
                  <div className="bg-paper border-l-2 border-gold rounded-r-md px-3 py-2">
                    <p className="text-sm text-ink-700 leading-relaxed">{exp.key_points}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        title="新增经验"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-outline">取消</button>
            <button onClick={handleCreate} disabled={saving || !canCreate} className="btn-ink">
              {saving ? "保存中…" : "保存"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-ink">茶样</label>
              <select
                value={form.tea_sample_id}
                onChange={(e) => setForm({ ...form, tea_sample_id: e.target.value })}
                className="input-ink"
              >
                <option value="">选择茶样</option>
                {teaSamples.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-ink">手法</label>
              <select
                value={form.technique_id}
                onChange={(e) => setForm({ ...form, technique_id: e.target.value })}
                className="input-ink"
              >
                <option value="">选择手法</option>
                {techniques.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label-ink">经验总结</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="描述成功经验的核心要点"
              rows={3}
              className="input-ink resize-none"
            />
          </div>
          <div>
            <label className="label-ink">关键要点</label>
            <textarea
              value={form.key_points}
              onChange={(e) => setForm({ ...form, key_points: e.target.value })}
              placeholder="记录可复用的关键操作要点"
              rows={3}
              className="input-ink resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
