import { ALARMS, MES_ORDERS, type AlarmItem } from "@/lib/dashboard-data";
import { Corners, Marquee, Panel } from "./bits";

const LEVEL: Record<AlarmItem["level"], { c: string; t: string }> = {
  red: { c: "var(--danger)", t: "严重" },
  orange: { c: "var(--warn)", t: "主要" },
  yellow: { c: "var(--yellow)", t: "次要" },
  blue: { c: "var(--ice)", t: "提示" },
};

function Row({ a }: { a: AlarmItem }) {
  const l = LEVEL[a.level];
  return (
    <div
      className="relative mb-[4px] flex items-center gap-[6px] border border-[rgba(0,240,255,0.12)] bg-[rgba(2,14,28,0.6)] px-[6px] py-[4px]"
      style={{ borderLeft: `2px solid ${l.c}` }}
    >
      {/* 时间 */}
      <span className="num w-[56px] shrink-0 text-[11px] text-[rgba(140,200,230,0.9)]">{a.time}</span>

      {/* 级别胶囊 */}
      <span
        className={a.level === "red" ? "num anim-breath w-[34px] shrink-0 text-center text-[9px] leading-[14px]" : "num w-[34px] shrink-0 text-center text-[9px] leading-[14px]"}
        style={{ color: l.c, border: `1px solid ${l.c}`, background: `color-mix(in oklab, ${l.c} 16%, transparent)` }}
      >
        {l.t}
      </span>

      {/* 设备 */}
      <span className="w-[92px] shrink-0 truncate text-[12px] text-[#daf7ff]">
        <span className="code-x mr-1 text-[8px]">{a.process}</span>
        {a.device}
      </span>

      {/* 测点与标识 */}
      <span className="min-w-0 flex-1">
        <span className="num flex items-center gap-[4px] text-[10px] text-[rgba(150,210,240,0.9)]">
          {a.point}
          {a.tag && (
            <b className="px-[3px] text-[9px]" style={{ color: "var(--yellow)", border: "1px solid var(--yellow)" }}>{a.tag}</b>
          )}
          <b className="px-[3px] text-[9px]" style={{ color: a.critical ? "var(--danger)" : "var(--ice)", border: `1px dashed ${a.critical ? "var(--danger)" : "var(--ice)"}` }}>
            {a.critical ? "关键" : "常规"}
          </b>
        </span>
        <span className="num block truncate text-[9px] text-[rgba(130,185,215,0.7)]">
          {a.desc}
          {a.refs ? ` · ${a.refs}` : ""}
        </span>
      </span>

      {/* 实时值 vs 阈值 */}
      <span className="w-[110px] shrink-0 text-right">
        <span className="num block text-[13px] leading-[14px]" style={{ color: l.c }}>{a.value}</span>
        <span className="num block text-[9px] text-muted-foreground">阈值 {a.limit}</span>
      </span>

      {/* 频次与时长 */}
      <span className="num w-[86px] shrink-0 text-right text-[9px] text-[rgba(140,200,230,0.8)]">
        <span className="block">累计 <b className="glow-danger">{a.count}</b> 次</span>
        <span className="block glow-warn">{a.duration}</span>
      </span>
    </div>
  );
}

export function AlarmPanel() {
  return (
    <div className="flex h-full flex-col gap-[8px]">
      {/* 上：MES 待确认（静） */}
      <Panel title="MES 下发待确认" mark="+" code="MES-QUE // 0x18B" className="h-[268px]" bodyClass="flex flex-col gap-[6px] p-[7px]">
        <div className="flex items-center gap-3">
          <span className="num anim-breath glow-warn text-[34px] leading-[36px] tracking-[0.14em]">
            PENDING // {MES_ORDERS.length}
          </span>
          <div className="ruler-x h-[7px] flex-1 opacity-40" />
          <span className="code-x text-[9px]">WORK ORDER QUEUE</span>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-[6px]">
          {MES_ORDERS.map((o, i) => (
            <div
              key={o.no}
              className="anim-rise relative flex flex-col justify-center gap-[3px] border border-[rgba(255,179,0,0.3)] bg-[rgba(30,20,4,0.45)] px-[8px] py-[4px]"
              style={{
                animationDelay: `${i * 80}ms`,
                clipPath: "polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)",
              }}
            >
              <Corners size={6} color="rgba(255,179,0,0.7)" />
              <div className="flex items-center gap-2">
                <span className="num glow-warn text-[13px]">{o.no}</span>
                <span className="num ml-auto px-[4px] text-[9px] text-[var(--mint)]" style={{ border: "1px solid var(--mint)" }}>
                  {o.process}
                </span>
              </div>
              <div className="num text-[10px] text-[rgba(150,205,235,0.8)]">BATCH {o.batch}</div>
              <div className="num flex justify-between text-[10px] text-[rgba(150,210,240,0.9)]">
                <span>目标温 <b className="glow-mint">{o.temp}</b></span>
                <span>真空 <b className="glow-mint">{o.vac}</b></span>
                <span>保温 <b className="glow-mint">{o.hold}</b></span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* 下：实时告警（动） */}
      <Panel
        title="实时告警监控"
        mark="+"
        code="ALM-SYS // 0x90F2"
        className="min-h-0 flex-1"
        bodyClass="px-[6px] py-[2px]"
        right={<span className="num anim-breath glow-danger text-[16px]">{ALARMS.length}</span>}
      >
        <div className="num mb-[2px] flex items-center gap-[6px] border-b border-[rgba(0,240,255,0.15)] pb-[2px] text-[8px] tracking-[0.14em] text-muted-foreground">
          <span className="w-[56px] shrink-0">TIME</span>
          <span className="w-[34px] shrink-0 text-center">LVL</span>
          <span className="w-[92px] shrink-0">DEVICE</span>
          <span className="min-w-0 flex-1">POINT / FLAG</span>
          <span className="w-[110px] shrink-0 text-right">VALUE / LIMIT</span>
          <span className="w-[86px] shrink-0 text-right">FREQ / DUR</span>
        </div>
        <Marquee duration={34}>
          {ALARMS.map((a) => (
            <Row key={a.time + a.device} a={a} />
          ))}
        </Marquee>
      </Panel>
    </div>
  );
}
