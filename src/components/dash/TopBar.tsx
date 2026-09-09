import { useEffect, useState } from "react";
import { TOP_KPI } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { Corners } from "./bits";

function Kpi({
  code, label, value, color = "var(--cyan)", blink,
}: { code: string; label: string; value: string; color?: string; blink?: boolean }) {
  return (
    <div className="relative flex h-[44px] min-w-[132px] items-center gap-2 border border-[rgba(0,240,255,0.18)] bg-[rgba(2,16,32,0.7)] px-[10px]">
      <Corners size={6} color={color} />
      <div className="flex flex-col">
        <span className="code-x text-[8px] leading-[10px]">{code}</span>
        <span className={cn("num text-[21px] leading-[22px]", blink && "anim-breath")} style={{ color }}>
          {value}
        </span>
      </div>
      <span className="ml-auto max-w-[46px] text-right text-[10px] leading-[11px] tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

const WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function TopBar() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const p2 = (n: number) => String(n).padStart(2, "0");

  return (
    <header className="relative flex h-[60px] w-full shrink-0 items-center justify-between border-b border-[rgba(0,240,255,0.25)] bg-[linear-gradient(180deg,rgba(0,70,110,0.28),rgba(2,6,17,0.2))] px-4">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden">
        <div className="anim-scanx h-full w-1/5 bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent" />
      </div>

      <div className="flex items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 40 40" className="shrink-0">
          <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(0,240,255,.28)" strokeWidth="1" strokeDasharray="3 6" className="anim-spin-slow" />
          <circle cx="20" cy="20" r="13" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeDasharray="20 62" className="anim-spin-rev" />
          <circle cx="20" cy="20" r="8" fill="none" stroke="var(--mint)" strokeWidth="1" strokeDasharray="8 10" className="anim-spin-slow" />
          <circle cx="20" cy="20" r="3" fill="var(--cyan)" className="anim-breath" />
        </svg>
        <div>
          <h1
            className="anim-flick text-[24px] font-bold leading-[26px] tracking-[0.18em]"
            style={{ color: "#d8fbff", textShadow: "0 0 14px rgba(0,240,255,.9), 0 0 34px rgba(0,150,255,.45)" }}
          >
            <span className="num text-[20px] text-[var(--mint)]">SAMRT-MES</span>
            <span className="mx-2 text-[var(--cyan)] opacity-60">//</span>
            京磁大厂集控系统
          </h1>
          <p className="code-x text-[10px]">SDV BIGDATA CONTROL SYSTEM · v4.02</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="num px-[6px] text-[10px] text-[var(--ice)]" style={{ border: "1px solid rgba(78,168,255,0.45)" }}>
          [ ホーム ]
        </span>
        <span className="num glow-cyan text-[32px] leading-none tracking-[0.12em]">
          {now ? `${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}` : "--:--:--"}
        </span>
        <div className="flex flex-col">
          <span className="num text-[11px] text-[rgba(150,205,235,0.85)]">
            {now ? `${now.getFullYear()}.${p2(now.getMonth() + 1)}.${p2(now.getDate())}` : "----.--.--"}
          </span>
          <span className="code-x text-[9px]">{now ? WEEK[now.getDay()] : "---"}</span>
        </div>
        <span className="num anim-breath px-[6px] text-[10px] text-[var(--mint)]" style={{ border: "1px solid rgba(0,255,157,0.45)" }}>
          [ 稼働監視中 ]
        </span>
      </div>

      <div className="flex items-center gap-[6px]">
        <Kpi code="SYS-ID: 1890F2X" label="测点总数" value={String(TOP_KPI.points)} />
        <Kpi code="EQP-NET: 0x21A" label="设备/在线" value={`${TOP_KPI.devTotal}/${TOP_KPI.devOnline}`} color="var(--mint)" />
        <Kpi code="PLC-BUS: 0x77C" label="PLC/在线" value={`${TOP_KPI.plcTotal}/${TOP_KPI.plcOnline}`} color="var(--ice)" />
        <Kpi code="ALM-SYS: 0x90F2" label="实时告警" value={String(TOP_KPI.alarms)} color="var(--danger)" blink />
        <Kpi code="MES-QUE: 0x18B" label="待确认" value={String(TOP_KPI.mesPending)} color="var(--warn)" blink />
      </div>
    </header>
  );
}
