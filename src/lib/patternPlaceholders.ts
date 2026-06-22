export interface PatternPlaceholder {
  key: string;
  label: string;
}

export const PATTERN_PLACEHOLDERS: PatternPlaceholder[] = [
  { key: "bamboo_slope", label: "竹枝斜出" },
  { key: "plum_shadow", label: "梅枝疏影" },
  { key: "orchid_three", label: "兰叶三笔" },
  { key: "cloud_roll", label: "云纹舒卷" },
  { key: "pine_needle", label: "松针细描" },
  { key: "far_mountain", label: "远山如黛" },
  { key: "moon_circle", label: "月映汤面" },
  { key: "lotus_leaf", label: "荷露初凝" },
  { key: "empty_scatter", label: "散落点墨" },
  { key: "early_dissolve", label: "初现即散" },
  { key: "no_foam", label: "汤花未起" },
];

export const PATTERN_LABEL_MAP: Record<string, string> = PATTERN_PLACEHOLDERS.reduce(
  (acc, p) => {
    acc[p.key] = p.label;
    return acc;
  },
  {} as Record<string, string>
);

export const PATTERN_KEY_MAP: Record<string, string> = PATTERN_PLACEHOLDERS.reduce(
  (acc, p) => {
    acc[p.label] = p.key;
    return acc;
  },
  {} as Record<string, string>
);

export function getPatternLabel(key: string | undefined | null): string {
  if (!key) return "";
  return PATTERN_LABEL_MAP[key] || key;
}

export function getPatternKey(label: string): string {
  return PATTERN_KEY_MAP[label] || label;
}

export function matchPatternPlaceholder(keyword: string, photoKey: string | undefined | null): boolean {
  if (!keyword || !photoKey) return false;
  const k = keyword.toLowerCase();
  const label = getPatternLabel(photoKey);
  return (
    photoKey.toLowerCase().includes(k) ||
    label.toLowerCase().includes(k)
  );
}
