import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ClipboardList, TrendingUp, CheckCircle2, XCircle, CalendarClock, AlertOctagon } from "lucide-react";
import { statsApi } from "@/api/client";
import type {
  Overview,
  TeaSuccessStat,
  FailureReasonStat,
  StabilityStat,
  DurationBin,
  TrainingPlanStat,
} from "@/types";
import { SectionTitle, StatCard, formatDateShort } from "@/components/ui";
import { cn } from "@/lib/utils";

const CHART_HEIGHT = 280;

const TOOLTIP_PROPS = {
  contentStyle: {
    backgroundColor: "#FAF5EA",
    border: "1px solid #D9D2C4",
    borderRadius: 8,
    fontSize: 12,
    color: "#1C1A17",
  },
  labelStyle: { color: "#5C5446" },
  itemStyle: { color: "#1C1A17" },
};

const FAILURE_COLORS = ["#B23A2E", "#B8924A", "#7C8C5E", "#566340"];

const AXIS_TICK = { fontSize: 12, fill: "#8C8270" };

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-paper p-6">
      <div className="mb-4 flex items-baseline gap-2.5">
        <div className="w-1 h-5 bg-gold rounded-full" />
        <div>
          <h3 className="text-lg font-serif font-semibold text-ink-800">{title}</h3>
          {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function ChartBody({
  loading,
  hasData,
  children,
}: {
  loading: boolean;
  hasData: boolean;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div
        className={cn("flex items-center justify-center text-sm animate-pulse", "text-ink-300")}
        style={{ height: CHART_HEIGHT }}
      >
        正在汇总…
      </div>
    );
  }
  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center text-sm text-ink-300"
        style={{ height: CHART_HEIGHT }}
      >
        暂无数据
      </div>
    );
  }
  return <>{children}</>;
}

export default function Stats() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [teaSuccess, setTeaSuccess] = useState<TeaSuccessStat[]>([]);
  const [failureReasons, setFailureReasons] = useState<FailureReasonStat[]>([]);
  const [stability, setStability] = useState<StabilityStat[]>([]);
  const [duration, setDuration] = useState<DurationBin[]>([]);
  const [planStats, setPlanStats] = useState<TrainingPlanStat[]>([]);

  useEffect(() => {
    Promise.all([
      statsApi.overview(),
      statsApi.teaSuccess(),
      statsApi.failureReasons(),
      statsApi.stability(),
      statsApi.duration(),
      statsApi.trainingPlans(),
    ])
      .then(([ov, ts, fr, st, du, ps]) => {
        setOverview(ov);
        setTeaSuccess(ts);
        setFailureReasons(fr);
        setStability(st);
        setDuration(du);
        setPlanStats(ps);
      })
      .finally(() => setLoading(false));
  }, []);

  const failureTotal = failureReasons.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="space-y-6">
      <SectionTitle subtitle="各茶样成功率、常见失败原因、纹样复现稳定度与练习时长分布">
        统计
      </SectionTitle>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="练习记录"
          value={overview?.total_records ?? "—"}
          icon={<ClipboardList size={18} />}
          accent="ink"
        />
        <StatCard
          label="成功率"
          value={overview?.success_rate ?? "—"}
          suffix="%"
          icon={<TrendingUp size={18} />}
          accent="gold"
        />
        <StatCard
          label="成功次数"
          value={overview?.success_count ?? "—"}
          icon={<CheckCircle2 size={18} />}
          accent="tea"
        />
        <StatCard
          label="待改进次数"
          value={overview?.fail_count ?? "—"}
          icon={<XCircle size={18} />}
          accent="cinnabar"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="各茶样成功率" subtitle="不同茶样的点茶成功比率">
          <ChartBody loading={loading} hasData={teaSuccess.length > 0}>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={teaSuccess} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E1" vertical={false} />
                <XAxis dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: "#D9D2C4" }} />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                <Tooltip {...TOOLTIP_PROPS} />
                <Bar dataKey="rate" name="成功率" fill="#7C8C5E" radius={[4, 4, 0, 0]} unit="%" maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBody>
        </ChartCard>

        <ChartCard title="常见失败原因" subtitle="失败原因分布占比">
          <ChartBody loading={loading} hasData={failureReasons.length > 0}>
            <div className="relative">
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <PieChart>
                  <Pie
                    data={failureReasons}
                    dataKey="count"
                    nameKey="reason"
                    cx="40%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {failureReasons.map((_, i) => (
                      <Cell key={i} fill={FAILURE_COLORS[i % FAILURE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_PROPS} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: 12, color: "#5C5446" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute left-[40%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                <span
                  className={cn(
                    "text-2xl font-serif font-semibold",
                    failureTotal === 0 ? "text-ink-300" : "text-ink-800"
                  )}
                >
                  {failureTotal === 0 ? "—" : failureTotal}
                </span>
                <span className="text-xs text-ink-400">失败总数</span>
              </div>
            </div>
          </ChartBody>
        </ChartCard>

        <ChartCard title="纹样复现稳定度" subtitle="标准差越低，纹样复现越稳定">
          <ChartBody loading={loading} hasData={stability.length > 0}>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={stability} margin={{ top: 8, right: 12, left: -16, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E1" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={{ stroke: "#D9D2C4" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} />
                <Tooltip
                  {...TOOLTIP_PROPS}
                  formatter={(value) => [Number(value).toFixed(2), "标准差"]}
                />
                <Bar dataKey="std" name="标准差" fill="#B8924A" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBody>
        </ChartCard>

        <ChartCard title="练习时长分布" subtitle="击拂时长区间记录数">
          <ChartBody loading={loading} hasData={duration.length > 0}>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <BarChart data={duration} margin={{ top: 8, right: 12, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E1" vertical={false} />
                <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: "#D9D2C4" }} />
                <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip {...TOOLTIP_PROPS} />
                <Bar dataKey="count" name="记录数" fill="#7C8C5E" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </ChartBody>
        </ChartCard>
      </div>

      <div className="space-y-4">
        <ChartCard
          title="训练计划维度统计"
          subtitle="各计划达成率、课次完成率、计划内练习成功率与逾期课次数"
        >
          <ChartBody loading={loading} hasData={planStats.length > 0}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-200/60 text-left">
                    <th className="py-3 px-3 font-medium text-ink-600">计划名称</th>
                    <th className="py-3 px-3 font-medium text-ink-600">负责老师</th>
                    <th className="py-3 px-3 font-medium text-ink-600">适用茶样</th>
                    <th className="py-3 px-3 font-medium text-ink-600 text-center">阶段达成率</th>
                    <th className="py-3 px-3 font-medium text-ink-600 text-center">课次完成率</th>
                    <th className="py-3 px-3 font-medium text-ink-600 text-center">练习成功率</th>
                    <th className="py-3 px-3 font-medium text-ink-600 text-center">逾期课次</th>
                  </tr>
                </thead>
                <tbody>
                  {planStats.map((p) => (
                    <tr key={p.id} className="border-b border-ink-100/60 hover:bg-ink-50/30 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-medium text-ink-800">{p.name}</span>
                      </td>
                      <td className="py-3 px-3 text-ink-600">{p.teacher_name}</td>
                      <td className="py-3 px-3 text-ink-600">{p.tea_sample_name}</td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-16 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gold"
                              style={{ width: `${p.achievement_rate}%` }}
                            />
                          </div>
                          <span className="font-medium text-gold text-xs w-12">{p.achievement_rate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-16 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-tea"
                              style={{ width: `${p.session_completion_rate}%` }}
                            />
                          </div>
                          <span className="font-medium text-tea text-xs w-12">{p.session_completion_rate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-16 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${p.in_plan_success_rate}%`,
                                backgroundColor: p.in_plan_success_rate >= 60 ? "#566340" : "#B23A2E",
                              }}
                            />
                          </div>
                          <span
                            className="font-medium text-xs w-12"
                            style={{
                              color: p.in_plan_success_rate >= 60 ? "#566340" : "#B23A2E",
                            }}
                          >
                            {p.in_plan_success_rate}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {p.overdue_sessions_count > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cinnabar/10 text-cinnabar text-xs font-medium">
                            <AlertOctagon size={11} /> {p.overdue_sessions_count}
                          </span>
                        ) : (
                          <span className="text-ink-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartBody>
        </ChartCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="各计划达成率对比" subtitle="计划阶段达成率柱状图">
            <ChartBody loading={loading} hasData={planStats.length > 0}>
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart
                  data={planStats}
                  margin={{ top: 8, right: 12, left: -16, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E1" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={{ stroke: "#D9D2C4" }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip
                    {...TOOLTIP_PROPS}
                    formatter={(value: number) => [`${value}%`, "达成率"]}
                  />
                  <Bar
                    dataKey="achievement_rate"
                    name="达成率"
                    fill="#B8924A"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartBody>
          </ChartCard>

          <ChartCard title="计划内练习成功率对比" subtitle="计划关联练习的成功率">
            <ChartBody loading={loading} hasData={planStats.some((p) => p.in_plan_success_rate > 0)}>
              <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart
                  data={planStats.filter((p) => p.in_plan_success_rate > 0)}
                  margin={{ top: 8, right: 12, left: -16, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE9E1" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={{ stroke: "#D9D2C4" }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip
                    {...TOOLTIP_PROPS}
                    formatter={(value: number) => [`${value}%`, "成功率"]}
                  />
                  <Bar
                    dataKey="in_plan_success_rate"
                    name="成功率"
                    fill="#7C8C5E"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartBody>
          </ChartCard>
        </div>

        {planStats.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="训练计划总数"
              value={planStats.length}
              icon={<CalendarClock size={18} />}
              accent="ink"
            />
            <StatCard
              label="平均达成率"
              value={
                planStats.length > 0
                  ? Math.round(planStats.reduce((s, p) => s + p.achievement_rate, 0) / planStats.length)
                  : 0
              }
              suffix="%"
              icon={<TrendingUp size={18} />}
              accent="gold"
            />
            <StatCard
              label="总逾期课次"
              value={planStats.reduce((s, p) => s + p.overdue_sessions_count, 0)}
              icon={<AlertOctagon size={18} />}
              accent="cinnabar"
            />
            <StatCard
              label="平均练习成功率"
              value={
                planStats.filter((p) => p.in_plan_success_rate > 0).length > 0
                  ? Math.round(
                      planStats.filter((p) => p.in_plan_success_rate > 0).reduce((s, p) => s + p.in_plan_success_rate, 0) /
                        planStats.filter((p) => p.in_plan_success_rate > 0).length
                    )
                  : 0
              }
              suffix="%"
              icon={<CheckCircle2 size={18} />}
              accent="tea"
            />
          </div>
        )}
      </div>
    </div>
  );
}
