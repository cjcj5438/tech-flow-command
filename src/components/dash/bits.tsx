import { useEffect, useRef, useState } from "react";
import type { Status } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const STATUS_COLOR: Record<Status, string> = {
  normal: "var(--mint)",
  warn: "var(--warn)",
  alarm: "var(--danger)",
  offline: "var(--idle)",
};

export function Panel({
  title,
  sub,
  className,
  bodyClass,
  children,
  right,
}: {
  title?: string;
  sub?: string;
  className?: string;
  bodyClass?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className={cn("panel corner relative flex flex-col overflow-hidden", className)}>
      <div className="corner-2 pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden">
        <div className="anim-scanx h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent" />
      </div>
      {title && (
        <header className="flex shrink-0 items-center gap-2 border-b border-[rgba(0,200,255,0.15)] px-3 py-[6px]">
          <span className="inline-block h-3 w-[3px] bg-[var(--cyan)] shadow-[0_0_8px_var(--cyan)]" />
          <h2 className="glow-cyan text-[15px] font-semibold tracking-[0.14em]">{title}</h2>
          {sub && <span className="num text-[10px] text-muted-foreground">{sub}</span>}
          <div className="ruler mx-2 h-[6px] flex-1 opacity-40" />
          {right}
        </header>
      )}
      <div className={cn("min-h-0 flex-1", bodyClass)}>{children}</div>
    </section>
  );
}

export function Dot({ status, size = 8 }: { status: Status; size?: number }) {
  const c = STATUS_COLOR[status];
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: c, boxShadow: `0 0 8px ${c}` }}
      />
      {status !== "offline" && (
        <span
          className="absolute inset-0 rounded-full"
          style={{ background: c, animation: "pulseRing 1.8s ease-out infinite" }}
        />
      )}
    </span>
  );
}

export function StatusBadge({ status, label }: { status: Status; label: string }) {
  const c = STATUS_COLOR[status];
  return (
    <span
      className={cn("num px-[5px] py-[1px] text-[10px] leading-[14px]", status === "alarm" && "anim-breath")}
      style={{ color: c, border: `1px solid ${c}`, background: `color-mix(in oklab, ${c} 14%, transparent)` }}
    >
      {label}
    </span>
  );
}

/** 双色范围迷你电平条 */
export function LevelBar({
  value, min, max, lo, hi, color,
}: { value: number; min: number; max: number; lo: number; hi: number; color: string }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const loP = ((lo - min) / (max - min)) * 100;
  const hiP = ((hi - min) / (max - min)) * 100;
  const bars = 26;
  return (
    <div className="relative mt-[3px] flex h-[7px] w-full items-end gap-[1px]">
      <div
        className="absolute inset-y-0"
        style={{ left: `${loP}%`, width: `${hiP - loP}%`, background: "rgba(45,255,190,0.10)" }}
      />
      {Array.from({ length: bars }).map((_, i) => {
        const p = ((i + 1) / bars) * 100;
        const on = p <= pct;
        return (
          <span
            key={i}
            className={cn("flex-1", on && "anim-bar")}
            style={{
              height: on ? "100%" : "45%",
              background: on ? color : "rgba(120,160,190,0.18)",
              boxShadow: on ? `0 0 5px ${color}` : "none",
              animationDelay: `${i * 40}ms`,
            }}
          />
        );
      })}
      <span className="absolute inset-y-[-2px] w-px bg-[rgba(0,229,255,0.55)]" style={{ left: `${loP}%` }} />
      <span className="absolute inset-y-[-2px] w-px bg-[rgba(255,120,60,0.7)]" style={{ left: `${hiP}%` }} />
    </div>
  );
}

/** 科技仪表环 */
export function Gauge({
  pct, label, value, color = "var(--cyan)", size = 62,
}: { pct: number; label: string; value: string; color?: string; size?: number }) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="overflow-visible">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,200,255,0.14)" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${(c * pct) / 100} ${c}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 5px ${color})`, transition: "stroke-dasharray .8s ease" }}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r - 7} fill="none" stroke={color} strokeOpacity="0.45"
          strokeWidth="1" strokeDasharray="2 6"
          style={{ transformOrigin: "center", animation: "spinSlow 14s linear infinite" }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-[13px]" style={{ color, textShadow: `0 0 8px ${color}` }}>{value}</span>
      </div>
      <span className="mt-[2px] text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

/** 双曲线趋势图（设定 vs 实际） */
export function CurveChart({
  set, real, holdFrom, holdTo, w = 250, h = 66,
}: { set: number[]; real: number[]; holdFrom: number; holdTo: number; w?: number; h?: number }) {
  const max = Math.max(...set, ...real) * 1.12 || 1;
  const px = (i: number, arr: number[]) => (i / (arr.length - 1)) * w;
  const py = (v: number) => h - (v / max) * h;
  const path = (arr: number[]) => arr.map((v, i) => `${i ? "L" : "M"}${px(i, arr).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const area = `${path(real)} L${w},${h} L0,${h} Z`;
  const hx1 = (holdFrom / (set.length - 1)) * w;
  const hx2 = (holdTo / (set.length - 1)) * w;
  return (
    <svg width={w} height={h} className="block">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(45,255,190,0.35)" />
          <stop offset="100%" stopColor="rgba(45,255,190,0)" />
        </linearGradient>
        <pattern id="cgrid" width="16" height="13" patternUnits="userSpaceOnUse">
          <path d="M16 0 L0 0 0 13" fill="none" stroke="rgba(0,200,255,0.10)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill="url(#cgrid)" />
      <rect x={hx1} y={0} width={hx2 - hx1} height={h} fill="rgba(0,229,255,0.10)" />
      <path d={area} fill="url(#cg)" />
      <path d={path(set)} fill="none" stroke="rgba(0,229,255,0.85)" strokeWidth="1.2" strokeDasharray="4 3" className="anim-dash" />
      <path
        d={path(real)} fill="none" stroke="var(--mint)" strokeWidth="1.6"
        style={{ filter: "drop-shadow(0 0 4px rgba(45,255,190,.6))" }}
      />
      <circle cx={px(real.length - 1, real)} cy={py(real[real.length - 1] ?? 0)} r="2.6" fill="var(--mint)" className="anim-breath" />
    </svg>
  );
}

/** 自动翻页 */
export function usePager(totalPages: number, ms: number) {
  const [page, setPage] = useState(0);
  useEffect(() => {
    if (totalPages <= 1) return;
    const t = setInterval(() => setPage((p) => (p + 1) % totalPages), ms);
    return () => clearInterval(t);
  }, [totalPages, ms]);
  return page;
}

/** 走马灯滚动容器 */
export function Marquee({ children, duration }: { children: React.ReactNode; duration: number }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="relative h-full overflow-hidden" ref={ref}>
      <div style={{ animation: `marquee ${duration}s linear infinite` }}>
        {children}
        {children}
      </div>
    </div>
  );
}
