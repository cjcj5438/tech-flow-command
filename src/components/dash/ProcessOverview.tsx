import { PROCESS_SUMMARY, PROC_ABBR } from "@/lib/dashboard-data";
import { Corners, Dot, EnergyMeter, Panel, RingGauge } from "./bits";

function Badge({ n, color, text }: { n: number; color: string; text: string }) {
  if (!n) return null;
  return (
    <span
      className="num inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-[3px] text-[9px]"
      style={{ color, border: `1px solid ${color}`, background: `color-mix(in oklab, ${color} 18%, transparent)` }}
    >
      {text}
      {n}
    </span>
  );
}

export function ProcessOverview() {
  return (
    <div className="flex h-full flex-col gap-[8px]">
      <Panel title="工序总览" className="min-h-0 flex-1" bodyClass="p-[6px]" tabs={["D", "W", "M"]} code="PRC-SYS // 0x11A4">
        <div className="grid h-full grid-cols-2 grid-rows-6 gap-[5px]">
          {PROCESS_SUMMARY.map((p, i) => (
            <div
              key={p.name}
              className="anim-rise relative flex flex-col justify-center gap-[2px] border border-[rgba(0,240,255,0.13)] bg-[rgba(2,14,28,0.55)] px-[7px] py-[3px]"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              <Corners size={5} color="rgba(0,240,255,0.6)" />
              <div className="flex items-center gap-[5px]">
                <Dot status={p.status} size={7} />
                <span className="code-x text-[9px]">{PROC_ABBR[p.name]}</span>
                <span className="text-[13px] font-semibold tracking-[0.1em] text-[#daf7ff]">{p.name}</span>
                <span className="num ml-auto text-[10px] text-[rgba(140,200,230,0.85)]">
                  <span className="glow-cyan">{p.total}</span>台/
                  <span className="glow-mint">{p.online}</span>在线
                </span>
              </div>
              <div className="flex items-center gap-[5px]">
                <div className="min-w-0 flex-1">
                  <EnergyMeter pct={(p.online / p.total) * 100} bars={18} h={7} />
                </div>
                <Badge n={p.offline} color="var(--idle)" text="离" />
                <Badge n={p.warn} color="var(--warn)" text="预" />
                <Badge n={p.alarm} color="var(--danger)" text="警" />
              </div>
            </div>
          ))}
          <div className="relative flex flex-col items-center justify-center border border-[rgba(0,240,255,0.2)] bg-[rgba(0,240,255,0.05)]">
            <Corners size={6} />
            <span className="num glow-cyan text-[22px]">120/115</span>
            <span className="code-x text-[9px]">TOTAL / ONLINE</span>
          </div>
        </div>
      </Panel>

      <Panel title="主线运行雷达" className="h-[178px]" mark="+" code="RDR-CORE // 0x4E71">
        <div className="flex h-full items-center justify-around px-1">
          <RingGauge pct={82} code="AMD 600" label="主线真空度" value="2.4" unit="Pa" color="var(--cyan)" size={116} />
          <RingGauge pct={64} code="XGM 600" label="全厂负荷率" value="64" unit="%" color="var(--mint)" size={116} />
          <RingGauge pct={93} code="TREX 600" label="PLC 吞吐率" value="93" unit="%" color="var(--warn)" size={116} />
        </div>
      </Panel>
    </div>
  );
}
