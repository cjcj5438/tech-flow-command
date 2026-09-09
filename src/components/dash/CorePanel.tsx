import { CORE_DEVICES, type CoreDevice } from "@/lib/dashboard-data";
import { CurveChart, Gauge, Panel, usePager } from "./bits";

const WORK_COLOR: Record<CoreDevice["work"], string> = {
  加工中: "var(--mint)",
  空闲: "var(--ice)",
  停机: "var(--idle)",
};

function CoreCard({ d, i }: { d: CoreDevice; i: number }) {
  const c = WORK_COLOR[d.work];
  const pct = d.total ? Math.round((d.elapsed / d.total) * 100) : 0;
  return (
    <div className="anim-rise panel corner flex flex-col gap-[4px] px-2 py-[6px]" style={{ animationDelay: `${i * 90}ms` }}>
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-semibold tracking-[0.08em] text-[#d8f3ff]">{d.name}</span>
        <span className="num text-[10px] px-[4px] text-[var(--cyan)] border border-[rgba(0,229,255,0.4)]">{d.process}</span>
        <span
          className="num ml-auto px-[5px] text-[10px]"
          style={{ color: c, border: `1px solid ${c}`, background: `color-mix(in oklab, ${c} 14%, transparent)` }}
        >
          {d.work}
        </span>
      </div>

      <div className="num grid grid-cols-2 gap-x-3 gap-y-[1px] text-[10px] text-[rgba(140,200,230,0.82)]">
        <span>批次 <b className="glow-cyan">{d.batch}</b></span>
        <span>工艺单 <b className="glow-cyan">{d.order}</b></span>
        <span>程序号 <b className="glow-cyan">{d.program}</b></span>
        <span>设定真空 <b className="glow-mint">{d.vacSet}</b></span>
        <span>{d.holdFlag}</span>
        <span style={{ color: d.matchState === "已归类匹配" ? "var(--mint)" : "var(--warn)" }}>
          归类：{d.matchState}
        </span>
      </div>

      <div className="flex items-start gap-2">
        <CurveChart set={d.setCurve} real={d.realCurve} holdFrom={d.holdFrom} holdTo={d.holdTo} w={330} h={62} />
        <div className="flex flex-col items-center gap-[2px]">
          <Gauge pct={pct} label="阶段进度" value={`${pct}%`} color={c} size={58} />
        </div>
      </div>

      <div className="num flex items-center gap-3 text-[9px] text-[rgba(140,200,230,0.75)]">
        <span className="flex items-center gap-1"><i className="inline-block h-[2px] w-[12px] bg-[var(--cyan)]" />设定温度/时间</span>
        <span className="flex items-center gap-1"><i className="inline-block h-[2px] w-[12px] bg-[var(--mint)]" />实际输出</span>
        <span className="flex items-center gap-1"><i className="inline-block h-[8px] w-[10px] bg-[rgba(0,229,255,0.2)]" />当前保温区间</span>
        <span className="ml-auto">物料曲线 {d.material}</span>
      </div>

      <div className="flex items-center gap-[3px]">
        {d.segments.map((s) => (
          <div key={s.name} className="flex-1">
            <div className="num mb-[2px] flex justify-between text-[9px] text-muted-foreground">
              <span>{s.name}</span>
              <span style={{ color: s.pct === 100 ? "var(--mint)" : s.pct ? "var(--cyan)" : "var(--idle)" }}>{s.pct}%</span>
            </div>
            <div className="h-[5px] w-full overflow-hidden bg-[rgba(0,200,255,0.12)]">
              <div
                className="h-full"
                style={{
                  width: `${s.pct}%`,
                  background: s.pct === 100 ? "var(--mint)" : "var(--cyan)",
                  boxShadow: "0 0 6px currentColor",
                  transition: "width 1.2s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="num flex items-center justify-between border-t border-[rgba(0,200,255,0.14)] pt-[3px] text-[10px] text-[rgba(140,200,230,0.85)]">
        <span>当前阶段 <b className="glow-cyan">{d.stage}</b></span>
        <span>{d.elapsed} / {d.total} min</span>
        <span>生产电 <b className="glow-mint">{d.energyProd}</b>kWh</span>
        <span>空转电 <b className="glow-warn">{d.energyIdle}</b>kWh</span>
      </div>
    </div>
  );
}

const PER = 2;

export function CorePanel() {
  const pages = Math.ceil(CORE_DEVICES.length / PER);
  const page = usePager(pages, 12000);
  const items = CORE_DEVICES.slice(page * PER, page * PER + PER);
  return (
    <Panel
      title="集控核心设备运行状态"
      sub="烧结 · 回火 · 气流磨 · 氢化 / 12s 翻页"
      className="h-full"
      bodyClass="p-2"
      right={
        <div className="flex gap-1">
          {Array.from({ length: pages }).map((_, i) => (
            <span
              key={i}
              className="h-[4px] w-[12px]"
              style={{ background: i === page ? "var(--cyan)" : "rgba(0,200,255,0.2)", boxShadow: i === page ? "0 0 8px var(--cyan)" : "none" }}
            />
          ))}
        </div>
      }
    >
      <div key={page} className="grid h-full grid-rows-2 gap-2">
        {items.map((d, i) => (
          <CoreCard key={d.name} d={d} i={i} />
        ))}
      </div>
    </Panel>
  );
}
