import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/dash/TopBar";
import { ProcessOverview } from "@/components/dash/ProcessOverview";
import { DeviceWall } from "@/components/dash/DeviceWall";
import { AlarmPanel } from "@/components/dash/AlarmPanel";
import { CorePanel } from "@/components/dash/CorePanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "京磁大厂集控中心 · 数据采集与集中控制大屏" },
      {
        name: "description",
        content:
          "京磁大厂集控中心可视化大屏：11 大工序总览、全厂设备卡片墙、实时告警与 MES 待确认工单、集控核心设备工艺曲线与能耗监控。",
      },
      { property: "og:title", content: "京磁大厂集控中心 · 集控可视化大屏" },
      {
        property: "og:description",
        content: "工序总览、设备卡片墙、实时分级告警、MES 工单与多段工艺曲线的一体化集中控制大屏。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Screen,
});

const W = 3952;
const H = 832;

function Screen() {
  const [scale, setScale] = useState(0.25);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <main className="dot-grid h-screen w-screen overflow-hidden">
      <div className="flex h-full w-full items-center justify-center">
        <div
          style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "center center" }}
          className="relative shrink-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_-10%,#062442_0%,#020611_65%)]"
        >
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" />
          {/* 垂直扫描线光晕 */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="anim-scany h-[2px] w-full bg-[linear-gradient(90deg,transparent,rgba(0,240,255,0.35),transparent)]" />
          </div>
          <div className="relative flex h-full w-full flex-col p-[8px] pt-0">
            <TopBar />
            <div className="mt-[8px] flex min-h-0 flex-1 gap-[10px]">
              <div className="w-[470px] shrink-0">
                <ProcessOverview />
              </div>
              <div className="w-[1990px] shrink-0">
                <DeviceWall />
              </div>
              <div className="w-[862px] shrink-0">
                <AlarmPanel />
              </div>
              <div className="w-[584px] shrink-0">
                <CorePanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
