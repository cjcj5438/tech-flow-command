import { useEffect, useState } from "react";
import { TOP_KPI } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

function Kpi({
  label, value, color = "var(--cyan)", blink,
}: { label: string; value: string; color?: string; blink?: boolean }) {
  return (
    <div className="relative flex h-[42px] min-w-[128px] items-center gap-2 border border-[rgba(0,200,255,0.18)] bg-[rgba(8,26,48,0.6)] px-3 corner">
      <div className="flex flex-col">
        <span className="text-[11px] leading-[13px] tracking-[0.12em] text-muted-foreground">{label}</span>
        <span
          className={cn("num text-[20px] leading-[22px]", blink && "anim-breath")}
          style={{ color, textShadow: `0 0 10px ${color}` }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

const WEEK = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

export function TopBar() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const p2 = (n: number) => String(n).padStart(2, "0");

  return (
    <header className="relative flex h-[60px] w-full shrink-0 items-center justify-between border-b border-[rgba(0,200,255,0.22)] bg-[linear-gradient(180deg,rgba(10,40,72,0.85),rgba(5,12,23,0.4))] px-4">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden">
        <div className="anim-scanx h-full w-1/4 bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent" />
      </div>

      <div className="flex items-center gap-3">
        <svg width="34" height="34" viewBox="0 0 40 40" className="shrink-0">
          <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(0,229,255,.35)" strokeWidth="1" />
          <circle
            cx="20" cy="20" r="17" fill="none" stroke="var(--cyan)" strokeWidth="1.6"
            strokeDasharray="26 80" style={{ transformOrigin: "center", animation: "spinSlow 6s linear infinite" }}
          />
          <circle
            cx="20" cy="20" r="11" fill="none" stroke="var(--mint)" strokeWidth="1.2"
            strokeDasharray="10 12" style={{ transformOrigin: "center", animation: "spinRev 9s linear infinite" }}
          />
          <circle cx="20" cy="20" r="4" fill="var(--cyan)" className="anim-breath" />
        </svg>
        <div>
          <h1
            className="text-[26px] font-bold leading-[27px] tracking-[0.28em] anim-flick"
            style={{ color: "#bff3ff", textShadow: "0 0 14px rgba(34,226,255,.85), 0 0 34px rgba(0,150,255,.5)" }}
          >
            京磁大厂集控中心
          </h1>
          <p className="num text-[11px] tracking-[0.34em] text-[rgba(120,200,235,0.75)]">
            数据采集 · 集中控制 &nbsp;/&nbsp; DATA ACQUISITION · CENTRAL CONTROL
          </p>
        </div>
      </div>

      <div className="flex items-baseline gap-4">
        <span className="num glow-mint text-[30px] leading-none">
          {now ? `${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}` : "--:--:--"}
        </span>
        <span className="num text-[13px] text-[rgba(150,205,235,0.85)]">
          {now ? `${now.getFullYear()}/${p2(now.getMonth() + 1)}/${p2(now.getDate())}` : "----/--/--"}
        </span>
        <span className="text-[13px] tracking-[0.2em] text-[rgba(150,205,235,0.85)]">
          {now ? WEEK[now.getDay()] : "—"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Kpi label="测点总数" value={String(TOP_KPI.points)} />
        <Kpi label="设备总数/在线" value={`${TOP_KPI.devTotal}/${TOP_KPI.devOnline}`} color="var(--mint)" />
        <Kpi label="PLC通信/在线" value={`${TOP_KPI.plcTotal}/${TOP_KPI.plcOnline}`} color="var(--ice)" />
        <Kpi label="实时告警" value={String(TOP_KPI.alarms)} color="var(--danger)" blink />
        <Kpi label="MES待确认" value={String(TOP_KPI.mesPending)} color="var(--warn)" blink />
      </div>
    </header>
  );
}
