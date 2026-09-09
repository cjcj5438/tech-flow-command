import { PROCESS_SUMMARY } from "@/lib/dashboard-data";
import { Dot, Panel } from "./bits";

function Badge({ n, color, text }: { n: number; color: string; text: string }) {
  if (!n) return null;
  return (
    <span
      className="num inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-[3px] text-[9px]"
      style={{ color, border: `1px solid ${color}`, background: `color-mix(in oklab, ${color} 16%, transparent)` }}
    >
      {text}
      {n}
    </span>
  );
}

export function ProcessOverview() {
  return (
    <Panel title="工序总览" sub="PROCESS OVERVIEW / 11" className="h-full" bodyClass="p-2">
      <div className="grid h-full grid-cols-2 grid-rows-6 gap-[6px]">
        {PROCESS_SUMMARY.map((p, i) => (
          <div
            key={p.name}
            className="anim-rise panel corner relative flex flex-col justify-center gap-[3px] px-2 py-1"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-[6px]">
              <Dot status={p.status} />
              <span className="text-[14px] font-semibold tracking-[0.08em] text-[#d6f2ff]">{p.name}</span>
              <span className="num ml-auto text-[12px] text-[rgba(140,200,230,0.8)]">
                <span className="glow-cyan">{p.total}</span>台
                <span className="glow-mint ml-1">{p.online}</span>在线
              </span>
            </div>
            <div className="flex items-center gap-[4px]">
              <Badge n={p.offline} color="var(--idle)" text="离" />
              <Badge n={p.warn} color="var(--warn)" text="预" />
              <Badge n={p.alarm} color="var(--danger)" text="警" />
              <div className="ml-auto h-[4px] w-[60px] overflow-hidden bg-[rgba(0,200,255,0.12)]">
                <div
                  className="h-full bg-[var(--mint)] shadow-[0_0_6px_var(--mint)]"
                  style={{ width: `${(p.online / p.total) * 100}%`, transition: "width 1s ease" }}
                />
              </div>
            </div>
          </div>
        ))}
        <div className="panel corner flex flex-col items-center justify-center">
          <span className="num glow-cyan text-[22px]">120/115</span>
          <span className="text-[10px] tracking-[0.2em] text-muted-foreground">全厂设备 / 在线</span>
        </div>
      </div>
    </Panel>
  );
}
