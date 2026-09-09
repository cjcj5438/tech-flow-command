import { ALARMS, MES_ORDERS, type AlarmItem } from "@/lib/dashboard-data";
import { Marquee, Panel } from "./bits";

const LEVEL: Record<AlarmItem["level"], { c: string; t: string }> = {
  red: { c: "var(--danger)", t: "严重" },
  orange: { c: "var(--warn)", t: "预警" },
  yellow: { c: "var(--yellow)", t: "注意" },
  blue: { c: "var(--ice)", t: "提示" },
};

function Row({ a }: { a: AlarmItem }) {
  const l = LEVEL[a.level];
  return (
    <div
      className="relative mb-[5px] border border-[rgba(0,200,255,0.12)] bg-[rgba(8,24,44,0.6)] px-2 py-[5px]"
      style={{ borderLeft: `2px solid ${l.c}` }}
    >
      <div className="flex items-center gap-[6px]">
        <span className="num text-[11px] text-[rgba(140,200,230,0.85)]">{a.time}</span>
        <span
          className={a.level === "red" ? "num anim-breath px-[4px] text-[10px]" : "num px-[4px] text-[10px]"}
          style={{ color: l.c, border: `1px solid ${l.c}`, background: `color-mix(in oklab, ${l.c} 15%, transparent)` }}
        >
          {l.t}
        </span>
        <span
          className="num px-[4px] text-[10px]"
          style={{
            color: a.critical ? "var(--danger)" : "var(--ice)",
            border: `1px dashed ${a.critical ? "var(--danger)" : "var(--ice)"}`,
          }}
        >
          {a.critical ? "关键报警" : "常规报警"}
        </span>
        {a.tag && (
          <span className="num px-[4px] text-[10px] text-[var(--yellow)] border border-[var(--yellow)]">{a.tag}</span>
        )}
        <span className="ml-auto num text-[11px] glow-warn">持续 {a.duration}</span>
      </div>

      <div className="mt-[3px] flex items-baseline gap-2 text-[12px]">
        <span className="text-[rgba(150,210,240,0.9)]">
          {a.process} · <b className="text-[#d8f3ff]">{a.device}</b> · {a.point}
        </span>
        <span className="num ml-auto" style={{ color: l.c, textShadow: `0 0 8px ${l.c}` }}>
          {a.value}
        </span>
        <span className="num text-[10px] text-muted-foreground">阈值 {a.limit}</span>
      </div>

      <div className="num mt-[2px] text-[10px] text-[rgba(140,195,225,0.75)]">{a.desc}</div>
      {a.refs && <div className="num text-[10px] text-[var(--cyan)]/80">{a.refs}</div>}
      <div className="num mt-[2px] flex gap-3 border-t border-[rgba(0,200,255,0.1)] pt-[2px] text-[9px] text-muted-foreground">
        <span>初次 {a.firstTime}</span>
        <span>累计 <b className="glow-danger">{a.count}</b> 次</span>
        <span>末次 {a.lastTime}</span>
      </div>
    </div>
  );
}

export function AlarmPanel() {
  return (
    <div className="flex h-full flex-col gap-[8px]">
      <Panel
        title="实时告警"
        sub="REAL-TIME ALARM · 走马灯滚动"
        className="h-[480px]"
        bodyClass="px-2 py-1"
        right={<span className="num glow-danger anim-breath text-[15px]">{ALARMS.length}</span>}
      >
        <Marquee duration={38}>
          {ALARMS.map((a) => (
            <Row key={a.time + a.device} a={a} />
          ))}
        </Marquee>
      </Panel>

      <Panel title="MES下发待确认" sub="PENDING WORK ORDERS" className="min-h-0 flex-1" bodyClass="flex gap-2 p-2">
        <div className="panel corner flex w-[110px] shrink-0 flex-col items-center justify-center">
          <span className="text-[10px] tracking-[0.2em] text-muted-foreground">待确认工单</span>
          <span className="num anim-breath text-[52px] leading-[54px] glow-warn">{MES_ORDERS.length}</span>
          <span className="num text-[10px] text-[rgba(140,200,230,0.7)]">WAITING</span>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-2 grid-rows-2 gap-2">
          {MES_ORDERS.map((o, i) => (
            <div
              key={o.no}
              className="anim-rise panel corner flex flex-col justify-center gap-[2px] px-2 py-1"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="flex items-center gap-2">
                <span className="num text-[12px] glow-cyan">{o.no}</span>
                <span className="num ml-auto text-[10px] px-[4px] text-[var(--mint)] border border-[var(--mint)]">
                  {o.process}
                </span>
              </div>
              <div className="num text-[10px] text-[rgba(140,200,230,0.8)]">批次 {o.batch}</div>
              <div className="num flex justify-between text-[10px] text-[rgba(150,210,240,0.9)]">
                <span>目标温 <b className="glow-mint">{o.temp}</b></span>
                <span>真空 <b className="glow-mint">{o.vac}</b></span>
                <span>保温 <b className="glow-mint">{o.hold}</b></span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
