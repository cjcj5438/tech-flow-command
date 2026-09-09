export type Status = "normal" | "warn" | "alarm" | "offline";

export const STATUS_LABEL: Record<Status, string> = {
  normal: "正常",
  warn: "预警",
  alarm: "报警",
  offline: "离线",
};

export const PROCESSES = [
  "烧结", "回火", "氢化", "气流磨", "还原", "扩散",
  "气流粉", "成型", "探伤", "制粉", "包装",
] as const;
export type ProcessName = (typeof PROCESSES)[number];

export type ProcessSummary = {
  name: ProcessName;
  total: number;
  online: number;
  offline: number;
  warn: number;
  alarm: number;
  status: Status;
};

export const PROCESS_SUMMARY: ProcessSummary[] = [
  { name: "烧结", total: 22, online: 20, offline: 2, warn: 1, alarm: 1, status: "alarm" },
  { name: "回火", total: 14, online: 14, offline: 0, warn: 1, alarm: 0, status: "warn" },
  { name: "氢化", total: 10, online: 9, offline: 1, warn: 0, alarm: 1, status: "alarm" },
  { name: "气流磨", total: 12, online: 12, offline: 0, warn: 0, alarm: 0, status: "normal" },
  { name: "还原", total: 8, online: 7, offline: 1, warn: 0, alarm: 0, status: "offline" },
  { name: "扩散", total: 9, online: 9, offline: 0, warn: 1, alarm: 0, status: "warn" },
  { name: "气流粉", total: 6, online: 6, offline: 0, warn: 0, alarm: 0, status: "normal" },
  { name: "成型", total: 16, online: 15, offline: 1, warn: 0, alarm: 0, status: "offline" },
  { name: "探伤", total: 5, online: 5, offline: 0, warn: 0, alarm: 0, status: "normal" },
  { name: "制粉", total: 11, online: 11, offline: 0, warn: 1, alarm: 0, status: "warn" },
  { name: "包装", total: 7, online: 7, offline: 0, warn: 0, alarm: 0, status: "normal" },
];

export type Metric = {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  lo: number;
  hi: number;
};

export type DeviceCard = {
  id: string;
  name: string;
  process: ProcessName;
  status: Status;
  batch: string;
  mode: "生产状态采集" | "设备空转采集";
  metrics: [Metric, Metric];
  pump?: { temp: number; press: string; valve: "开启" | "关闭" | "调节中" } | undefined;
  energy: { prod: number; idle: number; tier: "峰" | "平" | "谷" };
};

const PROC_ABBR: Record<string, string> = {
  烧结: "SJ", 回火: "HH", 氢化: "QH", 气流磨: "QM", 还原: "HY", 扩散: "KS",
  气流粉: "QF", 成型: "CX", 探伤: "TS", 制粉: "ZF", 包装: "BZ",
};

function rnd(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const METRIC_POOL: Record<string, Omit<Metric, "value">[]> = {
  烧结: [
    { label: "炉温", unit: "℃", min: 0, max: 1200, lo: 980, hi: 1120 },
    { label: "真空度", unit: "Pa", min: 0, max: 10, lo: 0.5, hi: 5 },
  ],
  回火: [
    { label: "回火温度", unit: "℃", min: 0, max: 900, lo: 480, hi: 620 },
    { label: "腔体压力", unit: "kPa", min: 0, max: 120, lo: 40, hi: 90 },
  ],
  氢化: [
    { label: "氢压", unit: "MPa", min: 0, max: 1, lo: 0.2, hi: 0.7 },
    { label: "床层温度", unit: "℃", min: 0, max: 600, lo: 260, hi: 420 },
  ],
  气流磨: [
    { label: "研磨压力", unit: "MPa", min: 0, max: 1.2, lo: 0.5, hi: 0.9 },
    { label: "氧含量", unit: "ppm", min: 0, max: 200, lo: 10, hi: 90 },
  ],
  还原: [
    { label: "还原温度", unit: "℃", min: 0, max: 1000, lo: 700, hi: 880 },
    { label: "氩气流量", unit: "L/m", min: 0, max: 60, lo: 15, hi: 45 },
  ],
  扩散: [
    { label: "扩散温度", unit: "℃", min: 0, max: 1100, lo: 820, hi: 960 },
    { label: "真空度", unit: "Pa", min: 0, max: 8, lo: 0.3, hi: 3.5 },
  ],
  气流粉: [
    { label: "分级转速", unit: "rpm", min: 0, max: 6000, lo: 2200, hi: 4800 },
    { label: "粒径 SMD", unit: "μm", min: 0, max: 8, lo: 2.6, hi: 3.6 },
  ],
  成型: [
    { label: "取向磁场", unit: "T", min: 0, max: 3, lo: 1.6, hi: 2.4 },
    { label: "压制力", unit: "kN", min: 0, max: 400, lo: 180, hi: 320 },
  ],
  探伤: [
    { label: "探头增益", unit: "dB", min: 0, max: 60, lo: 20, hi: 45 },
    { label: "检出率", unit: "%", min: 0, max: 100, lo: 92, hi: 100 },
  ],
  制粉: [
    { label: "料位", unit: "%", min: 0, max: 100, lo: 25, hi: 85 },
    { label: "主轴电流", unit: "A", min: 0, max: 300, lo: 80, hi: 220 },
  ],
  包装: [
    { label: "封口温度", unit: "℃", min: 0, max: 260, lo: 140, hi: 200 },
    { label: "计数节拍", unit: "s", min: 0, max: 20, lo: 3, hi: 12 },
  ],
};

function buildDevices(): DeviceCard[] {
  const r = rnd(77);
  const out: DeviceCard[] = [];
  PROCESS_SUMMARY.forEach((p, pi) => {
    const count = Math.min(p.total, pi < 4 ? 8 : 5);
    for (let i = 1; i <= count; i++) {
      let status: Status = "normal";
      if (i === 1 && p.alarm) status = "alarm";
      else if (i === 2 && p.warn) status = "warn";
      else if (i === 3 && p.offline) status = "offline";
      const defs = METRIC_POOL[p.name]!;
      const metrics = defs.map((d) => {
        const span = d.hi - d.lo;
        let v = d.lo + span * (0.15 + r() * 0.75);
        if (status === "alarm") v = d.hi + span * 0.12;
        if (status === "warn") v = d.hi - span * 0.03;
        if (status === "offline") v = 0;
        return { ...d, value: Number(v.toFixed(v > 100 ? 0 : 2)) };
      }) as [Metric, Metric];
      out.push({
        id: `${PROC_ABBR[p.name]}-${String(i).padStart(2, "0")}`,
        name: `${p.name}${String(i).padStart(2, "0")}#`,
        process: p.name,
        status,
        batch: `B24${String(90 + pi)}${String(100 + i)}`,
        mode: status === "offline" || i % 5 === 0 ? "设备空转采集" : "生产状态采集",
        metrics,
        pump:
          p.name === "扩散"
            ? {
                temp: Number((180 + r() * 60).toFixed(0)),
                press: `${(2 + r() * 4).toFixed(1)}E-2`,
                valve: i % 3 === 0 ? "调节中" : i % 4 === 0 ? "关闭" : "开启",
              }
            : undefined,
        energy: {
          prod: Number((800 + r() * 2400).toFixed(0)),
          idle: Number((40 + r() * 260).toFixed(0)),
          tier: (["峰", "平", "谷"] as const)[Math.floor(r() * 3)] ?? "平",
        },
      });
    }
  });
  const order: Record<Status, number> = { alarm: 0, warn: 1, offline: 2, normal: 3 };
  return out.sort((a, b) => order[a.status] - order[b.status] || a.process.localeCompare(b.process));
}

export const DEVICES = buildDevices();

export type AlarmLevel = "red" | "orange" | "yellow" | "blue";

export type AlarmItem = {
  time: string;
  level: AlarmLevel;
  critical: boolean;
  process: ProcessName;
  device: string;
  point: string;
  desc: string;
  value: string;
  limit: string;
  duration: string;
  tag?: string;
  firstTime: string;
  count: number;
  lastTime: string;
  refs?: string;
};

export const ALARMS: AlarmItem[] = [
  {
    time: "09:41:22", level: "red", critical: true, process: "烧结", device: "烧结01#",
    point: "主炉温 TE-101", desc: "超高温报警（延时 30s 触发）", value: "1178 ℃", limit: "≤1120 ℃",
    duration: "00:12:41", tag: "超高温", firstTime: "09:28:41", count: 6, lastTime: "09:41:22",
  },
  {
    time: "09:39:05", level: "red", critical: true, process: "氢化", device: "氢化01#",
    point: "氢压 PT-204", desc: "保温平台真空度上限报警", value: "6.8 Pa", limit: "≤5.0 Pa",
    duration: "00:07:18", tag: "保温平台", firstTime: "09:31:47", count: 3, lastTime: "09:39:05",
    refs: "平台前参考 1.2 Pa / 平台后参考 4.6 Pa",
  },
  {
    time: "09:36:50", level: "orange", critical: false, process: "回火", device: "回火02#",
    point: "回火温度 TE-311", desc: "曲线第 2 段保温平台温度下限（延时触发）", value: "462 ℃", limit: "≥480 ℃",
    duration: "00:09:52", tag: "超低温", firstTime: "09:26:58", count: 4, lastTime: "09:36:50",
  },
  {
    time: "09:34:12", level: "orange", critical: false, process: "扩散", device: "扩散02#",
    point: "扩散泵温 TE-518", desc: "扩散泵温度接近上限", value: "236 ℃", limit: "≤240 ℃",
    duration: "00:15:03", firstTime: "09:19:09", count: 2, lastTime: "09:34:12",
  },
  {
    time: "09:31:44", level: "yellow", critical: false, process: "制粉", device: "制粉02#",
    point: "主轴电流 IA-902", desc: "电流波动超出常规区间", value: "228 A", limit: "≤220 A",
    duration: "00:05:27", firstTime: "09:26:17", count: 1, lastTime: "09:31:44",
  },
  {
    time: "09:28:30", level: "blue", critical: false, process: "成型", device: "成型03#",
    point: "通信链路 PLC-17", desc: "PLC 通信闪断，已自动重连", value: "断 1 次", limit: "0 次/h",
    duration: "00:00:42", firstTime: "09:27:48", count: 1, lastTime: "09:28:30",
  },
  {
    time: "09:25:11", level: "orange", critical: false, process: "气流磨", device: "气流磨04#",
    point: "氧含量 O2-771", desc: "氧含量上升趋势预警", value: "86 ppm", limit: "≤90 ppm",
    duration: "00:21:33", firstTime: "09:03:38", count: 5, lastTime: "09:25:11",
  },
  {
    time: "09:22:07", level: "red", critical: true, process: "烧结", device: "烧结05#",
    point: "真空度 VG-118", desc: "保温平台真空度上限报警", value: "7.4 Pa", limit: "≤5.0 Pa",
    duration: "00:24:19", tag: "保温平台", firstTime: "08:58:02", count: 9, lastTime: "09:22:07",
    refs: "平台前参考 0.9 Pa / 平台后参考 5.2 Pa",
  },
  {
    time: "09:18:53", level: "yellow", critical: false, process: "还原", device: "还原03#",
    point: "氩气流量 FT-620", desc: "流量低于工艺推荐区间", value: "13.6 L/m", limit: "≥15 L/m",
    duration: "00:31:12", firstTime: "08:47:41", count: 2, lastTime: "09:18:53",
  },
];

export type MesOrder = {
  no: string;
  batch: string;
  process: ProcessName;
  temp: string;
  vac: string;
  hold: string;
};

export const MES_ORDERS: MesOrder[] = [
  { no: "MES-2024-08871", batch: "B2490112", process: "烧结", temp: "1085 ℃", vac: "≤3.0 Pa", hold: "240 min" },
  { no: "MES-2024-08872", batch: "B2491105", process: "回火", temp: "560 ℃", vac: "≤5.0 Pa", hold: "180 min" },
  { no: "MES-2024-08873", batch: "B2492103", process: "氢化", temp: "380 ℃", vac: "≤2.4 Pa", hold: "120 min" },
  { no: "MES-2024-08874", batch: "B2495101", process: "扩散", temp: "900 ℃", vac: "≤1.8 Pa", hold: "300 min" },
];

export type CoreDevice = {
  name: string;
  process: "烧结" | "回火" | "气流磨" | "氢化";
  work: "加工中" | "空闲" | "停机";
  batch: string;
  order: string;
  program: string;
  holdFlag: string;
  vacSet: string;
  matchState: "已归类匹配" | "待归类" | "参数偏差";
  energyProd: number;
  energyIdle: number;
  stage: string;
  elapsed: number;
  total: number;
  material: string;
  segments: { name: string; pct: number }[];
  setCurve: number[];
  realCurve: number[];
  holdFrom: number;
  holdTo: number;
};

const curve = (peak: number, noise: number, seed: number) => {
  const r = rnd(seed);
  const set: number[] = [];
  const real: number[] = [];
  for (let i = 0; i < 40; i++) {
    let v: number;
    if (i < 10) v = (peak * 0.55 * i) / 10;
    else if (i < 16) v = peak * 0.55;
    else if (i < 26) v = peak * 0.55 + (peak * 0.45 * (i - 16)) / 10;
    else v = peak;
    set.push(v);
    real.push(v + (r() - 0.5) * noise * (i < 4 ? 0.2 : 1));
  }
  return { set, real };
};

function core(
  name: string, process: CoreDevice["process"], work: CoreDevice["work"], peak: number,
  seed: number, o: Partial<CoreDevice>,
): CoreDevice {
  const c = curve(peak, peak * 0.05, seed);
  return {
    name, process, work,
    batch: `B24${seed}`,
    order: `MES-2024-0${8800 + seed}`,
    program: `PRG-${peak}-${seed}`,
    holdFlag: "多段保温 · 已启用",
    vacSet: "≤3.0 Pa",
    matchState: "已归类匹配",
    energyProd: 1200 + seed * 3,
    energyIdle: 60 + seed,
    stage: "真空烧结",
    elapsed: 148, total: 420,
    material: "N52 高牌号",
    segments: [
      { name: "烘炉", pct: 100 },
      { name: "升温Ⅰ", pct: 100 },
      { name: "保温Ⅰ", pct: 72 },
      { name: "升温Ⅱ", pct: 0 },
      { name: "保温Ⅱ", pct: 0 },
    ],
    setCurve: c.set, realCurve: c.real, holdFrom: 10, holdTo: 16,
    ...o,
  };
}

export const CORE_DEVICES: CoreDevice[] = [
  core("烧结01#", "烧结", "加工中", 1080, 811, { stage: "真空烧结", elapsed: 148, total: 420, matchState: "参数偏差" }),
  core("烧结03#", "烧结", "加工中", 1060, 823, { stage: "保温Ⅰ", elapsed: 262, total: 400 }),
  core("回火02#", "回火", "加工中", 560, 835, { stage: "升温Ⅱ", elapsed: 96, total: 300, material: "N48H 中牌号" }),
  core("回火04#", "回火", "空闲", 540, 847, { stage: "待料", elapsed: 0, total: 300, work: "空闲", matchState: "待归类" }),
  core("气流磨01#", "气流磨", "加工中", 720, 859, { stage: "研磨稳定", elapsed: 205, total: 360, material: "SC 速凝片" }),
  core("气流磨03#", "气流磨", "停机", 700, 871, { stage: "计划停机", elapsed: 0, total: 360, work: "停机" }),
  core("氢化01#", "氢化", "加工中", 380, 883, { stage: "烘炉", elapsed: 42, total: 260, material: "HD 破碎料" }),
  core("氢化02#", "氢化", "加工中", 400, 895, { stage: "保温Ⅱ", elapsed: 318, total: 380 }),
];

export const TOP_KPI = {
  points: 168,
  devTotal: 22,
  devOnline: 20,
  plcTotal: 45,
  plcOnline: 42,
  alarms: 3,
  mesPending: 2,
};
