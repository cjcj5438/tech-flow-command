import { DEVICES, STATUS_LABEL, type DeviceCard } from "@/lib/dashboard-data";
import { LevelBar, Panel, StatusBadge, STATUS_COLOR, usePager } from "./bits";

const PER_PAGE = 24; // 8 列 × 3 行

function TierTag({ tier }: { tier: "峰" | "平" | "谷" }) {
  const c = tier === "峰" ? "var(--danger)" : tier === "平" ? "var(--warn)" : "var(--mint)";
  return (
    <span className="num px-[3px] text-[9px]" style={{ color: c, border: `1px solid ${c}` }}>
      {tier}
    </span>
  );
}

function Card({ d, i }: { d: DeviceCard; i: number }) {
  const c = STATUS_COLOR[d.status];
  return (
    <div
      className="anim-rise panel corner relative flex flex-col gap-[3px] px-2 py-[5px]"
      style={{ animationDelay: `${i * 18}ms`, borderColor: d.status === "normal" ? undefined : c }}
    >
      <span className="absolute inset-y-0 left-0 w-[2px]" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
      <div className="flex items-center gap-1">
        <span className="text-[13px] font-semibold tracking-[0.06em] text-[#d8f3ff]">{d.name}</span>
        <span className="num text-[9px] text-muted-foreground">{d.id}</span>
        <span className="ml-auto">
          <StatusBadge status={d.status} label={STATUS_LABEL[d.status]} />
        </span>
      </div>
      <div className="num flex items-center justify-between text-[10px] text-[rgba(140,200,230,0.8)]">
        <span>批次 <span className="glow-cyan">{d.batch}</span></span>
        <span style={{ color: d.mode === "生产状态采集" ? "var(--mint)" : "var(--idle)" }}>{d.mode}</span>
      </div>

      {d.metrics.map((m) => (
        <div key={m.label}>
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-muted-foreground">{m.label}</span>
            <span className="num text-[14px]" style={{ color: c, textShadow: `0 0 8px ${c}` }}>
              {m.value}
              <span className="ml-[2px] text-[9px] opacity-70">{m.unit}</span>
            </span>
          </div>
          <LevelBar value={m.value} min={m.min} max={m.max} lo={m.lo} hi={m.hi} color={c} />
        </div>
      ))}

      {d.pump && (
        <div className="num flex items-center justify-between border-t border-[rgba(0,200,255,0.14)] pt-[2px] text-[9px] text-[rgba(140,200,230,0.85)]">
          <span>泵温 <b className="glow-cyan">{d.pump.temp}℃</b></span>
          <span>泵压 <b className="glow-cyan">{d.pump.press}</b></span>
          <span>主阀 <b style={{ color: d.pump.valve === "开启" ? "var(--mint)" : "var(--warn)" }}>{d.pump.valve}</b></span>
        </div>
      )}

      <div className="num mt-auto flex items-center justify-between border-t border-[rgba(0,200,255,0.14)] pt-[2px] text-[9px] text-[rgba(140,200,230,0.8)]">
        <span>生产 <b className="glow-mint">{d.energy.prod}</b>kWh</span>
        <span>空转 <b className="glow-warn">{d.energy.idle}</b>kWh</span>
        <TierTag tier={d.energy.tier} />
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
      sub={`EQUIPMENT WALL / ${DEVICES.length} 台 · 异常前置 · 15s 自动翻页`}
      className="h-full"
      bodyClass="p-2 relative"
      right={
        <div className="flex items-center gap-1">
          {Array.from({ length: pages }).map((_, i) => (
            <span
              key={i}
              className="h-[4px] w-[16px]"
              style={{
                background: i === page ? "var(--cyan)" : "rgba(0,200,255,0.2)",
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
