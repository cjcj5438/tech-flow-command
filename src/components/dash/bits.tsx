import { useEffect, useState } from "react";
import type { Status } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const STATUS_COLOR: Record<Status, string> = {
  normal: "var(--mint)",
  warn: "var(--warn)",
  alarm: "var(--danger)",
  offline: "var(--idle)",
};

/** 四角 HUD 拐角括号 + 十字准星 */
export function Corners({ size = 8, color = "var(--cyan)", cross = false }: { size?: number; color?: string; cross?: boolean }) {
  const base: React.CSSProperties = { position: "absolute", width: size, height: size, borderColor: color, borderStyle: "solid", borderWidth: 0 };
  return (
    <span className="pointer-events-none absolute inset-0">
      <i style={{ ...base, top: -1, left: -1, borderTopWidth: 1, borderLeftWidth: 1 }} />
      <i style={{ ...base, top: -1, right: -1, borderTopWidth: 1, borderRightWidth: 1 }} />
      <i style={{ ...base, bottom: -1, left: -1, borderBottomWidth: 1, borderLeftWidth: 1 }} />
      <i style={{ ...base, bottom: -1, right: -1, borderBottomWidth: 1, borderRightWidth: 1 }} />
      {cross && (
        <>
          <i className="absolute left-1/2 top-[-4px] h-[7px] w-px" style={{ background: color, opacity: 0.7 }} />
          <i className="absolute left-1/2 bottom-[-4px] h-[7px] w-px" style={{ background: color, opacity: 0.7 }} />
        </>
      )}
    </span>
  );
}

/** HUD 模块框体： [ · 标题 · ] + 右上伪代码 */
export function Panel({
  title, code, tabs, className, bodyClass, children, right, mark = "·",
}: {
  title?: string;
  code?: string;
  tabs?: string[];
  className?: string;
  bodyClass?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  mark?: string;
}) {
  return (
    <section className={cn("hud relative flex flex-col overflow-hidden", className)}>
      <Corners size={9} cross />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
        <div className="anim-scanx h-full w-1/4 bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent" />
      </div>
      <div className="ruler-y pointer-events-none absolute inset-y-2 left-0 w-[3px] opacity-30" />
      {title && (
        <header className="relative flex shrink-0 items-center gap-2 border-b border-[rgba(0,240,255,0.15)] px-[10px] py-[5px]">
          <span className="num text-[13px] text-[var(--cyan)] opacity-70">[</span>
          <span className="num text-[11px] text-[var(--mint)]">{mark}</span>
          <h2 className="glow-cyan text-[15px] font-semibold tracking-[0.2em]">{title}</h2>
          <span className="num text-[11px] text-[var(--mint)]">{mark}</span>
          <span className="num text-[13px] text-[var(--cyan)] opacity-70">]</span>
          <div className="ruler-x mx-2 h-[5px] flex-1 opacity-35" />
          {tabs && (
            <div className="flex items-center gap-[3px]">
              {tabs.map((t, i) => (
                <span
                  key={t}
                  className="num px-[5px] text-[9px] leading-[13px]"
                  style={{
                    color: i === 0 ? "var(--cyan)" : "rgba(120,178,210,0.6)",
                    border: `1px solid ${i === 0 ? "rgba(0,240,255,0.6)" : "rgba(0,240,255,0.18)"}`,
                    background: i === 0 ? "rgba(0,240,255,0.12)" : "transparent",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {code && <span className="code-x text-[9px]">{code}</span>}
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
      <span className="absolute inset-0 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
      {status !== "offline" && (
        <span className="absolute inset-0 rounded-full" style={{ background: c, animation: "pulseRing 2s ease-out infinite" }} />
      )}
    </span>
  );
}

export function StatusBadge({ status, label }: { status: Status; label: string }) {
  const c = STATUS_COLOR[status];
  return (
    <span
      className={cn("num px-[5px] py-0 text-[9px] leading-[14px]", status === "alarm" && "anim-breath")}
      style={{ color: c, border: `1px solid ${c}`, background: `color-mix(in oklab, ${c} 16%, transparent)` }}
    >
      {label}
    </span>
  );
}

/** 阶梯式能量电平条（绿 → 橙 → 红） */
export function EnergyMeter({
  pct, bars = 22, h = 9, showEdge = true,
}: { pct: number; bars?: number; h?: number; showEdge?: boolean }) {
  const on = Math.round((Math.max(0, Math.min(100, pct)) / 100) * bars);
  return (
    <div className="flex w-full items-end gap-[1.5px]" style={{ height: h }}>
      {Array.from({ length: bars }).map((_, i) => {
        const ratio = i / (bars - 1);
        const c = ratio < 0.6 ? "var(--mint)" : ratio < 0.82 ? "var(--warn)" : "var(--danger)";
        const lit = i < on;
        return (
          <span
            key={i}
            className={cn("flex-1", lit && i >= on - 2 && "anim-meter")}
            style={{
              height: `${45 + ratio * 55}%`,
              background: lit ? c : "rgba(90,140,170,0.16)",
              boxShadow: lit ? `0 0 5px ${c}` : "none",
            }}
          />
        );
      })}
      {showEdge && null}
    </div>
  );
}

/** 带上下限刻度的测点电平尺 */
export function LevelBar({
  value, min, max, lo, hi, color,
}: { value: number; min: number; max: number; lo: number; hi: number; color: string }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const loP = ((lo - min) / (max - min)) * 100;
  const hiP = ((hi - min) / (max - min)) * 100;
  const bars = 24;
  const on = Math.round((pct / 100) * bars);
  return (
    <div className="relative mt-[3px] h-[8px] w-full">
      <div className="absolute inset-y-0" style={{ left: `${loP}%`, width: `${hiP - loP}%`, background: "rgba(0,255,157,0.09)" }} />
      <div className="flex h-full w-full items-end gap-[1px]">
        {Array.from({ length: bars }).map((_, i) => (
          <span
            key={i}
            className={cn("flex-1", i < on && i >= on - 2 && "anim-meter")}
            style={{
              height: i < on ? "100%" : "40%",
              background: i < on ? color : "rgba(90,140,170,0.16)",
              boxShadow: i < on ? `0 0 5px ${color}` : "none",
            }}
          />
        ))}
      </div>
      <span className="absolute inset-y-[-2px] w-px bg-[rgba(0,240,255,0.65)]" style={{ left: `${loP}%` }} />
      <span className="absolute inset-y-[-2px] w-px bg-[rgba(255,42,85,0.75)]" style={{ left: `${hiP}%` }} />
    </div>
  );
}

/** 同心旋转雷达仪表环 */
export function RingGauge({
  pct, code, label, value, unit, color = "var(--cyan)", size = 118,
}: { pct: number; code: string; label: string; value: string; unit?: string; color?: string; size?: number }) {
  const cx = size / 2;
  const rOuter = cx - 5;
  const rMid = cx - 17;
  const cMid = 2 * Math.PI * rMid;
  const ticks = Array.from({ length: 60 });
  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="block overflow-visible">
        {/* 外层虚线旋转刻度环 */}
        <circle cx={cx} cy={cx} r={rOuter} fill="none" stroke={color} strokeOpacity="0.28" strokeWidth="1" strokeDasharray="3 7" className="anim-spin-slow" />
        <g className="anim-spin-rev">
          {ticks.map((_, i) => {
            const a = (i / ticks.length) * Math.PI * 2;
            const long = i % 5 === 0;
            const r1 = rOuter - 4;
            const r2 = rOuter - (long ? 10 : 7);
            return (
              <line
                key={i}
                x1={cx + Math.cos(a) * r1} y1={cx + Math.sin(a) * r1}
                x2={cx + Math.cos(a) * r2} y2={cx + Math.sin(a) * r2}
                stroke={color} strokeOpacity={long ? 0.55 : 0.2} strokeWidth="1"
              />
            );
          })}
        </g>
        {/* 中层电平环 */}
        <circle cx={cx} cy={cx} r={rMid} fill="none" stroke="rgba(0,240,255,0.12)" strokeWidth="5" />
        <circle
          cx={cx} cy={cx} r={rMid} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${(cMid * pct) / 100} ${cMid}`}
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dasharray 1s ease" }}
        />
        <circle cx={cx} cy={cx} r={rMid - 9} fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="14 9" className="anim-spin-slow" />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-[19px] leading-[20px]" style={{ color }}>{value}</span>
        {unit && <span className="num text-[9px] text-muted-foreground">{unit}</span>}
        <span className="code-x mt-[1px] text-[8px]">{code}</span>
      </div>
      <span className="mt-[1px] text-[10px] tracking-[0.16em] text-muted-foreground">{label}</span>
    </div>
  );
}

/** 高精度双曲线仪表：设定（青蓝虚线）+ 实际（荧光绿实线含发光面积） */
export function CurveChart({
  set, real, holdFrom, holdTo, w = 250, h = 55, id = "c",
}: { set: number[]; real: number[]; holdFrom: number; holdTo: number; w?: number; h?: number; id?: string }) {
  const max = Math.max(...set, ...real) * 1.14 || 1;
  const px = (i: number, arr: number[]) => (i / (arr.length - 1)) * w;
  const py = (v: number) => h - (v / max) * h;
  const path = (arr: number[]) => arr.map((v, i) => `${i ? "L" : "M"}${px(i, arr).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const area = `${path(real)} L${w},${h} L0,${h} Z`;
  const hx1 = (holdFrom / (set.length - 1)) * w;
  const hx2 = (holdTo / (set.length - 1)) * w;
  const lastY = py(real[real.length - 1] ?? 0);
  return (
    <svg width={w} height={h} className="block">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,255,157,0.4)" />
          <stop offset="100%" stopColor="rgba(0,255,157,0)" />
        </linearGradient>
        <pattern id={`p-${id}`} width="14" height="11" patternUnits="userSpaceOnUse">
          <path d="M14 0 L0 0 0 11" fill="none" stroke="rgba(0,240,255,0.09)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#p-${id})`} />
      <rect x={hx1} y={0} width={hx2 - hx1} height={h} fill="rgba(0,240,255,0.09)" />
      <path d={area} fill={`url(#g-${id})`} />
      <path d={path(set)} fill="none" stroke="rgba(0,240,255,0.85)" strokeWidth="1.1" strokeDasharray="4 3" className="anim-dash" />
      <path d={path(real)} fill="none" stroke="var(--mint)" strokeWidth="1.6" style={{ filter: "drop-shadow(0 0 4px rgba(0,255,157,.7))" }} />
      <circle cx={w} cy={lastY} r="2.4" fill="var(--mint)" className="anim-anchor" style={{ filter: "drop-shadow(0 0 6px var(--mint))" }} />
    </svg>
  );
}

/** 科幻发光胶囊阶段步进器 */
export function StepBar({ steps }: { steps: { name: string; pct: number }[] }) {
  return (
    <div className="flex items-center gap-[3px]">
      {steps.map((s, i) => {
        const done = s.pct === 100;
        const active = s.pct > 0 && s.pct < 100;
        const c = done ? "var(--mint)" : active ? "var(--cyan)" : "var(--idle)";
        return (
          <div key={s.name} className="flex min-w-0 flex-1 items-center">
            <div
              className="relative h-[16px] w-full overflow-hidden"
              style={{
                border: `1px solid ${c}`,
                background: active ? "rgba(0,240,255,0.14)" : done ? "rgba(0,255,157,0.12)" : "rgba(74,96,118,0.12)",
                clipPath: "polygon(5px 0,100% 0,100% calc(100% - 5px),calc(100% - 5px) 100%,0 100%,0 5px)",
              }}
            >
              <span
                className="num absolute inset-0 flex items-center justify-center text-[9px] tracking-[0.06em]"
                style={{ color: c }}
              >
                {s.name}
              </span>
              {active && (
                <span className="anim-shimmer absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[rgba(0,240,255,0.55)] to-transparent" />
              )}
            </div>
            {i < steps.length - 1 && <span className="mx-[2px] text-[8px]" style={{ color: c }}>➔</span>}
          </div>
        );
      })}
    </div>
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

/** 走马灯无缝滚动 + 上下渐隐遮罩 */
export function Marquee({ children, duration }: { children: React.ReactNode; duration: number }) {
  return (
    <div className="fade-mask-y relative h-full overflow-hidden">
      <div style={{ animation: `marquee ${duration}s linear infinite` }}>
        {children}
        {children}
      </div>
    </div>
  );
}
