import { DEVICES, STATUS_LABEL, type DeviceCard } from "@/lib/dashboard-data";
import { Corners, LevelBar, Panel, StatusBadge, STATUS_COLOR, usePager } from "./bits";

const PER_PAGE = 24; // 8 列 × 3 行

function TierTag({ tier }: { tier: "峰" | "平" | "谷" }) {
  const c = tier === "峰" ? "var(--danger)" : tier === "平" ? "var(--warn)" : "var(--mint)";
  return (
    <span className="num px-[3px] text-[9px] leading-[12px]" style={{ color: c, border: `1px solid ${c}` }}>
      {tier}
    </span>
  );
}

/** 状态微型指示环 */
function MicroRing({ color, pct }: { color: string; pct: number }) {
  const c = 2 * Math.PI * 6;
  return (
    <svg width="16" height="16" className="shrink-0">
      <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(0,240,255,0.16)" strokeWidth="2" />
      <circle
        cx="8" cy="8" r="6" fill="none" stroke={color} strokeWidth="2"
        strokeDasharray={`${(c * pct) / 100} ${c}`} transform="rotate(-90 8 8)"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

function EnergyBars({ prod, idle }: { prod: number; idle: number }) {
  const max = Math.max(prod, idle, 1);
  return (
    <div className="flex h-[18px] items-end gap-[3px]">
      <span className="w-[7px] bg-[var(--mint)] shadow-[0_0_6px_var(--mint)]" style={{ height: `${(prod / max) * 100}%` }} />
      <span className="w-[7px] bg-[var(--warn)] shadow-[0_0_6px_var(--warn)]" style={{ height: `${Math.max(8, (idle / max) * 100)}%` }} />
    </div>
  );
}

function Card({ d, i }: { d: DeviceCard; i: number }) {
  const c = STATUS_COLOR[d.status];
  const load = d.status === "offline" ? 0 : 40 + ((i * 17) % 60);
  return (
    <div
      className="anim-rise relative flex flex-col gap-[3px] border bg-[linear-gradient(180deg,rgba(0,60,96,0.14),rgba(2,10,22,0.66))] px-[7px] py-[4px]"
      style={{ animationDelay: `${i * 16}ms`, borderColor: d.status === "normal" ? "rgba(0,240,255,0.14)" : c }}
    >
      <Corners size={6} color={c} />
      <span className="absolute inset-y-0 left-0 w-[2px]" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />

      <div className="flex items-center gap-[4px]">
        <MicroRing color={c} pct={load} />
        <span className="text-[13px] font-semibold leading-[14px] tracking-[0.06em] text-[#daf7ff]">{d.name}</span>
        <span className="code-x text-[8px]">{d.id}</span>
        <span className="ml-auto">
          <StatusBadge status={d.status} label={STATUS_LABEL[d.status]} />
        </span>
      </div>

      <div className="num flex items-center justify-between text-[9px] text-[rgba(140,200,230,0.78)]">
        <span>BATCH <span className="glow-cyan">{d.batch}</span></span>
        <span style={{ color: d.mode === "生产状态采集" ? "var(--mint)" : "var(--idle)" }}>{d.mode}</span>
      </div>

      {d.metrics.map((m) => (
        <div key={m.label}>
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] tracking-[0.06em] text-muted-foreground">{m.label}</span>
            <span className="num text-[14px] leading-[15px]" style={{ color: c }}>
              {m.value}
              <span className="ml-[2px] text-[8px] opacity-70">{m.unit}</span>
            </span>
          </div>
          <LevelBar value={m.value} min={m.min} max={m.max} lo={m.lo} hi={m.hi} color={c} />
          <div className="num flex justify-between text-[7px] text-muted-foreground opacity-70">
            <span>{m.min}</span>
            <span>{m.lo} ~ {m.hi}</span>
            <span>{m.max}</span>
          </div>
        </div>
      ))}

      {d.pump && (
        <div className="num flex items-center justify-between border border-dashed border-[rgba(0,240,255,0.25)] px-[3px] text-[8px] text-[rgba(140,200,230,0.85)]">
          <span>泵温 <b className="glow-cyan">{d.pump.temp}℃</b></span>
          <span>泵压 <b className="glow-cyan">{d.pump.press}</b></span>
          <span>主阀 <b style={{ color: d.pump.valve === "开启" ? "var(--mint)" : "var(--warn)" }}>{d.pump.valve}</b></span>
        </div>
      )}

      <div className="mt-auto flex items-end gap-[6px] border-t border-[rgba(0,240,255,0.14)] pt-[3px]">
        <EnergyBars prod={d.energy.prod} idle={d.energy.idle} />
        <div className="num flex flex-col text-[8px] leading-[10px] text-[rgba(140,200,230,0.8)]">
          <span>生产 <b className="glow-mint">{d.energy.prod}</b>kWh</span>
          <span>空转 <b className="glow-warn">{d.energy.idle}</b>kWh</span>
        </div>
        <span className="ml-auto">
          <TierTag tier={d.energy.tier} />
        </span>
      </div>
    </div>
  );
}

export function DeviceWall() {
  const pages = Math.ceil(DEVICES.length / PER_PAGE);
  const page = usePager(pages, 15000);
  const items = DEVICES.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <Panel
      title="全厂设备卡片墙"
      mark="+"
      code={`EQP-WALL // ${DEVICES.length} UNITS · 15s`}
      className="h-full"
      bodyClass="p-[6px]"
      right={
        <div className="flex items-center gap-1">
          {Array.from({ length: pages }).map((_, i) => (
            <span
              key={i}
              className="h-[4px] w-[18px]"
              style={{
                background: i === page ? "var(--cyan)" : "rgba(0,240,255,0.2)",
                boxShadow: i === page ? "0 0 8px var(--cyan)" : "none",
              }}
            />
          ))}
        </div>
      }
    >
      <div key={page} className="grid h-full grid-cols-8 grid-rows-3 gap-[6px]">
        {items.map((d, i) => (
          <Card key={d.id} d={d} i={i} />
        ))}
      </div>
    </Panel>
  );
}
