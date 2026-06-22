import { useMemo } from "react";

interface PatternArtProps {
  seed?: number;
  foamState?: string;
  size?: number;
  className?: string;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function PatternArt({
  seed = 42,
  foamState = "细密如雪",
  size = 240,
  className = "",
}: PatternArtProps) {
  const rng = useMemo(() => mulberry32(seed || 42), [seed]);
  const elements = useMemo(() => {
    const items: Array<{
      type: "branch" | "dot" | "curve" | "leaf";
      x: number;
      y: number;
      r: number;
      rot: number;
      len: number;
    }> = [];
    const count = 5 + Math.floor(rng() * 4);
    for (let i = 0; i < count; i++) {
      const roll = rng();
      items.push({
        type: roll < 0.4 ? "branch" : roll < 0.65 ? "leaf" : roll < 0.85 ? "curve" : "dot",
        x: 30 + rng() * (size - 60),
        y: 30 + rng() * (size - 60),
        r: 3 + rng() * 8,
        rot: rng() * 360,
        len: 30 + rng() * 60,
      });
    }
    return items;
  }, [rng, size]);

  const foamColor =
    foamState.includes("粗散") || foamState.includes("薄")
      ? "#D9D2C4"
      : foamState.includes("凝乳")
      ? "#F0E8D5"
      : "#FAF5EA";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id={`foam-${seed}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={foamColor} stopOpacity="1" />
          <stop offset="70%" stopColor={foamColor} stopOpacity="0.92" />
          <stop offset="100%" stopColor="#E8DFC9" stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id={`bowl-${seed}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3D382E" />
          <stop offset="100%" stopColor="#1C1A17" />
        </radialGradient>
        <filter id={`texture-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed % 100} />
          <feColorMatrix values="0 0 0 0 0.7 0 0 0 0 0.65 0 0 0 0 0.5 0 0 0 0.15 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      <circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill={`url(#bowl-${seed})`} />
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 10} fill={`url(#foam-${seed})`} />

      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 10}
        fill="#B8924A"
        opacity="0.08"
        filter={`url(#texture-${seed})`}
      />

      <g opacity="0.55" stroke="#5C5446" fill="none" strokeLinecap="round">
        {elements.map((el, i) => {
          if (el.type === "branch") {
            return (
              <path
                key={i}
                d={`M ${el.x} ${el.y} Q ${el.x + el.len * 0.5} ${el.y - el.len * 0.3} ${el.x + el.len} ${el.y + el.len * 0.2}`}
                strokeWidth="1.5"
              />
            );
          }
          if (el.type === "leaf") {
            return (
              <ellipse
                key={i}
                cx={el.x}
                cy={el.y}
                rx={el.len * 0.3}
                ry={el.len * 0.12}
                transform={`rotate(${el.rot} ${el.x} ${el.y})`}
                strokeWidth="1.2"
              />
            );
          }
          if (el.type === "curve") {
            return (
              <path
                key={i}
                d={`M ${el.x} ${el.y} C ${el.x + 20} ${el.y - 30} ${el.x + 40} ${el.y + 10} ${el.x + el.len} ${el.y}`}
                strokeWidth="1.2"
              />
            );
          }
          return <circle key={i} cx={el.x} cy={el.y} r={el.r * 0.4} strokeWidth="1" />;
        })}
      </g>

      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 10}
        fill="none"
        stroke="#B8924A"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  );
}
