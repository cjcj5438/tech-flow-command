import { CORE_DEVICES, type CoreDevice } from "@/lib/dashboard-data";
import { Corners, CurveChart, Panel, StepBar, usePager } from "./bits";

const WORK_COLOR: Record<CoreDevice["work"], string> = {
  加工中: "var(--mint)",
  空闲: "var(--ice)",
  停机: "var(--idle)",
};

function CoreCard({ d, i }: { d: CoreDevice; i: number }) {
  const c = WORK_COLOR[d.work];
  const pct = d.total ? Math.round((d.elapsed / d.total) * 100) : 0;
  return (
    <div
      className="anim-rise relative flex flex-col gap-[4px] border border-[rgba(0,240,255,0.15)] bg-[linear-gradient(180deg,rgba(0,60,96,0.16),rgba(2,10,22,0.7))] px-[8px] py-[5px]"
      style={{ animationDelay: `${i * 90}ms` }}
    >
      <Corners size={7} color={c} cross />
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-semibold tracking-[0.1em] text-[#daf7ff]">{d.name}</span>
        <span className="num px-[4px] text-[9px] text-[var(--cyan)]" style={{ border: "1px solid rgba(0,240,255,0.45)" }}>{d.process}</span>
        <span
          className="num ml-auto px-[5px] text-[9px]"
          style={{ color: c, border: `1px solid ${c}`, background: `color-mix(in oklab, ${c} 16%, transparent)` }}
        >
          {d.work}
        </span>
      </div>

      <div className="num grid grid-cols-2 gap-x-3 text-[9px] leading-[13px] text-[rgba(140,200,230,0.82)]">
        <span>批次 <b className="glow-cyan">{d.batch}</b></span>
        <span>工艺单 <b className="glow-cyan">{d.order}</b></span>
        <span>程序号 <b className="glow-cyan">{d.program}</b></span>
        <span>设定真空 <b className="glow-mint">{d.vacSet}</b></span>
        <span>{d.holdFlag}</span>
        <span style={{ color: d.matchState === "已归类匹配" ? "var(--mint)" : "var(--warn)" }}>归类：{d.matchState}</span>
      </div>

      <div className="relative">
        <CurveChart set={d.setCurve} real={d.realCurve} holdFrom={d.holdFrom} holdTo={d.holdTo} w={548} h={55} id={d.name} />
        <span className="num absolute right-1 top-[2px] text-[9px] text-[rgba(140,200,230,0.7)]">
          物料参考 {d.material}
        </span>
      </div>

      <div className="num flex items-center gap-3 text-[8px] text-[rgba(140,200,230,0.75)]">
        <span className="flex items-center gap-1"><i className="inline-block h-[2px] w-[12px] bg-[var(--cyan)]" />设定曲线</span>
        <span className="flex items-center gap-1"><i className="inline-block h-[2px] w-[12px] bg-[var(--mint)]" />实际温度</span>
        <span className="flex items-center gap-1"><i className="inline-block h-[8px] w-[10px] bg-[rgba(0,240,255,0.2)]" />保温区间</span>
        <span className="ml-auto">阶段 <b className="glow-cyan">{d.stage}</b> · {d.elapsed}/{d.total} min · {pct}%</span>
      </div>

      <StepBar steps={d.segments} />

      <div className="num flex items-center justify-between border-t border-[rgba(0,240,255,0.14)] pt-[3px] text-[9px] text-[rgba(140,200,230,0.85)]">
        <span>生产电 <b className="glow-mint">{d.energyProd}</b> kWh</span>
        <span>空转电 <b className="glow-warn">{d.energyIdle}</b> kWh</span>
        <span className="flex items-center gap-1">
          进度
          <i className="inline-block h-[5px] w-[70px] bg-[rgba(0,240,255,0.14)]">
            <i className="block h-full" style={{ width: `${pct}%`, background: c, boxShadow: `0 0 6px ${c}` }} />
          </i>
          <b style={{ color: c }}>{pct}%</b>
        </span>
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
      title="集控核心设备"
      mark="+"
      code="CORE-RUN // 12s PAGING"
      className="h-full"
      bodyClass="p-[6px]"
      right={
        <div className="flex gap-1">
          {Array.from({ length: pages }).map((_, i) => (
            <span
              key={i}
              className="h-[4px] w-[12px]"
              style={{ background: i === page ? "var(--cyan)" : "rgba(0,240,255,0.2)", boxShadow: i === page ? "0 0 8px var(--cyan)" : "none" }}
            />
          ))}
        </div>
      }
    >
      <div key={page} className="grid h-full grid-rows-2 gap-[6px]">
        {items.map((d, i) => (
          <CoreCard key={d.name} d={d} i={i} />
        ))}
      </div>
    </Panel>
  );
}
