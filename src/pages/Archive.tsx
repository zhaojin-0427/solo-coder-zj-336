import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Leaf, CupSoda, Sparkles, Droplets } from "lucide-react";
import { useArchiveStore } from "@/store/useArchiveStore";
import {
  teaSampleApi,
  teaBowlApi,
  teaWhiskApi,
  techniqueApi,
} from "@/api/client";
import type { TeaSample, TeaBowl, TeaWhisk, PouringTechnique } from "@/types";
import { SectionTitle } from "@/components/ui";
import Modal from "@/components/Modal";
import { cn } from "@/lib/utils";

type TabKey = "tea" | "bowl" | "whisk" | "technique";

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "textarea";
  placeholder?: string;
}

const tabConfig: Record<TabKey, {
  label: string;
  icon: typeof Leaf;
  color: string;
  fields: FieldDef[];
}> = {
  tea: {
    label: "茶样",
    icon: Leaf,
    color: "#7C8C5E",
    fields: [
      { key: "name", label: "茶样名称", type: "text", placeholder: "如 白茶一号" },
      { key: "origin", label: "产地", type: "text", placeholder: "如 福建福鼎" },
      { key: "roast_level", label: "焙火度", type: "text", placeholder: "如 轻焙/中焙/蒸青" },
      { key: "grind_fineness", label: "研磨细度", type: "text", placeholder: "如 极细/细/中" },
      { key: "year", label: "年份", type: "number", placeholder: "如 2024" },
      { key: "notes", label: "备注", type: "textarea", placeholder: "茶样特征描述" },
    ],
  },
  bowl: {
    label: "茶盏",
    icon: CupSoda,
    color: "#B8924A",
    fields: [
      { key: "name", label: "茶盏名称", type: "text", placeholder: "如 兔毫盏甲" },
      { key: "kiln", label: "窑口", type: "text", placeholder: "如 建窑/龙泉窑" },
      { key: "glaze", label: "釉色", type: "text", placeholder: "如 兔毫/油滴/粉青" },
      { key: "capacity_ml", label: "容量(ml)", type: "number", placeholder: "如 120" },
      { key: "notes", label: "备注", type: "textarea", placeholder: "茶盏特征描述" },
    ],
  },
  whisk: {
    label: "茶筅",
    icon: Sparkles,
    color: "#566340",
    fields: [
      { key: "name", label: "茶筅名称", type: "text", placeholder: "如 七十二穗筅" },
      { key: "prong_count", label: "筅穗数", type: "number", placeholder: "如 72" },
      { key: "material", label: "材质", type: "text", placeholder: "如 老竹/新竹" },
      { key: "age_years", label: "使用年限", type: "number", placeholder: "如 1.5" },
      { key: "notes", label: "备注", type: "textarea", placeholder: "茶筅特征描述" },
    ],
  },
  technique: {
    label: "注汤手法",
    icon: Droplets,
    color: "#B23A2E",
    fields: [
      { key: "name", label: "手法名称", type: "text", placeholder: "如 高冲低斟" },
      { key: "water_temp_c", label: "水温(℃)", type: "number", placeholder: "如 85" },
      { key: "pour_speed", label: "注水速度", type: "text", placeholder: "如 先快后慢" },
      { key: "description", label: "手法描述", type: "textarea", placeholder: "手法要点描述" },
    ],
  },
};

const apiMap = {
  tea: teaSampleApi,
  bowl: teaBowlApi,
  whisk: teaWhiskApi,
  technique: techniqueApi,
};

type AnyItem = TeaSample | TeaBowl | TeaWhisk | PouringTechnique;

function renderField(item: AnyItem, field: FieldDef): string {
  const val = (item as unknown as Record<string, unknown>)[field.key];
  if (val === null || val === undefined || val === "") return "—";
  if (field.key === "capacity_ml") return `${val}ml`;
  if (field.key === "age_years") return `${val}年`;
  if (field.key === "water_temp_c") return `${val}℃`;
  if (field.key === "year") return `${val}年`;
  return String(val);
}

export default function Archive() {
  const [tab, setTab] = useState<TabKey>("tea");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AnyItem | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const store = useArchiveStore();
  const { teaSamples, teaBowls, teaWhisks, techniques, fetchAll } = store;

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const currentItems: AnyItem[] = {
    tea: teaSamples,
    bowl: teaBowls,
    whisk: teaWhisks,
    technique: techniques,
  }[tab];

  const config = tabConfig[tab];

  function openCreate() {
    setEditing(null);
    setForm({});
    setModalOpen(true);
  }

  function openEdit(item: AnyItem) {
    setEditing(item);
    const data: Record<string, string> = {};
    config.fields.forEach((f) => {
      const v = (item as unknown as Record<string, unknown>)[f.key];
      data[f.key] = v !== null && v !== undefined ? String(v) : "";
    });
    setForm(data);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      config.fields.forEach((f) => {
        const v = form[f.key];
        if (v !== undefined && v !== "") {
          payload[f.key] = f.type === "number" ? Number(v) : v;
        }
      });
      const api = apiMap[tab];
      if (editing) {
        await api.update(editing.id, payload);
      } else {
        await api.create(payload);
      }
      await fetchAll();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确认删除此档案？")) return;
    const api = apiMap[tab];
    await api.remove(id);
    await fetchAll();
  }

  return (
    <div className="space-y-6">
      <SectionTitle subtitle="为茶样、茶盏、茶筅、注汤手法建档，是训练闭环的起点">
        器具档案
      </SectionTitle>

      <div className="border-b border-ink-200/50">
        <div className="flex gap-1">
          {(Object.keys(tabConfig) as TabKey[]).map((key) => {
            const cfg = tabConfig[key];
            const Icon = cfg.icon;
            const count = { tea: teaSamples, bowl: teaBowls, whisk: teaWhisks, technique: techniques }[key].length;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn("tab-item flex items-center gap-2", tab === key ? "tab-active" : "tab-inactive")}
              >
                <Icon size={16} style={{ color: tab === key ? cfg.color : undefined }} />
                {cfg.label}
                <span className="text-xs text-ink-300">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={openCreate} className="btn-ink">
          <Plus size={16} /> 新增{config.label}
        </button>
      </div>

      {currentItems.length === 0 ? (
        <div className="card-paper p-12 text-center text-ink-400">
          暂无{config.label}档案，点击右上角新增
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentItems.map((item) => {
            const Icon = config.icon;
            return (
              <div key={item.id} className="card-paper p-5 group hover:shadow-ink-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <Icon size={20} style={{ color: config.color }} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-md hover:bg-ink-50 text-ink-400 hover:text-gold transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-md hover:bg-ink-50 text-ink-400 hover:text-cinnabar transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <h3 className="font-serif font-semibold text-ink-800 mb-3">{item.name}</h3>
                <div className="space-y-1.5">
                  {config.fields.slice(1).map((f) => (
                    <div key={f.key} className="flex items-start justify-between text-sm">
                      <span className="text-ink-400 shrink-0">{f.label}</span>
                      <span className="text-ink-700 text-right ml-3">{renderField(item, f)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? `编辑${config.label}` : `新增${config.label}`}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-outline">
              取消
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-ink">
              {saving ? "保存中…" : "保存"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {config.fields.map((f) => (
            <div key={f.key}>
              <label className="label-ink">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea
                  value={form[f.key] || ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  rows={3}
                  className="input-ink resize-none"
                />
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={form[f.key] || ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="input-ink"
                />
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
