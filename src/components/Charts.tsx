import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const revenueData = [
  { label: "Apr 5", revenue: 7.2, expenses: 4.5, profit: 2.7 },
  { label: "Apr 8", revenue: 9.4, expenses: 5.8, profit: 3.6 },
  { label: "Apr 11", revenue: 8.3, expenses: 5.1, profit: 3.2 },
  { label: "Apr 14", revenue: 10.1, expenses: 6.0, profit: 4.1 },
  { label: "Apr 17", revenue: 12.6, expenses: 7.2, profit: 5.4 },
  { label: "Apr 20", revenue: 10.2, expenses: 6.6, profit: 3.6 },
  { label: "Apr 23", revenue: 11.5, expenses: 7.4, profit: 4.1 },
  { label: "Apr 26", revenue: 12.4, expenses: 7.9, profit: 4.5 },
  { label: "Apr 29", revenue: 14.8, expenses: 10.0, profit: 4.8 },
  { label: "May 2", revenue: 10.7, expenses: 7.1, profit: 3.6 },
  { label: "May 5", revenue: 12.1, expenses: 8.5, profit: 3.6 },
  { label: "May 8", revenue: 15.4, expenses: 11.1, profit: 4.3 },
];

const hoursData = [
  { day: "Mon", billable: 5.5, nonbillable: 1.4 },
  { day: "Tue", billable: 6.8, nonbillable: 1.1 },
  { day: "Wed", billable: 4.8, nonbillable: 1.7 },
  { day: "Thu", billable: 7.2, nonbillable: 0.8 },
  { day: "Fri", billable: 5.7, nonbillable: 1.4 },
  { day: "Sat", billable: 2.1, nonbillable: 0.5 },
  { day: "Sun", billable: 1.4, nonbillable: 0.2 },
];

const tooltipStyle = {
  border: "1px solid var(--line)",
  borderRadius: 10,
  background: "var(--surface-strong)",
  color: "var(--text-primary)",
  fontSize: 12,
  boxShadow: "0 10px 28px rgba(30, 24, 20, .12)",
};

export function RevenueChart({ period = "30D" }: { period?: string }) {
  const data = period === "7D" ? revenueData.slice(-7) : period === "3M" ? revenueData.map((item, index) => ({ ...item, label: ["Mar 1", "Mar 8", "Mar 15", "Mar 22", "Mar 29", "Apr 5", "Apr 12", "Apr 19", "Apr 26", "May 3", "May 10", "May 17"][index] })) : period === "12M" ? revenueData.map((item, index) => ({ ...item, label: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"][index] })) : revenueData;
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 14, right: 5, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-revenue)" stopOpacity={0.17} /><stop offset="100%" stopColor="var(--chart-revenue)" stopOpacity={0.01} /></linearGradient>
            <linearGradient id="expensesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-expenses)" stopOpacity={0.12} /><stop offset="100%" stopColor="var(--chart-expenses)" stopOpacity={0.01} /></linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--line-soft)" strokeDasharray="3 5" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} minTickGap={20} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickFormatter={(value) => `$${value}k`} width={40} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${Number(value).toFixed(1)}k`]} />
          <Area type="monotone" dataKey="revenue" stroke="var(--chart-revenue)" strokeWidth={2.6} fill="url(#revenueFill)" />
          <Area type="monotone" dataKey="expenses" stroke="var(--chart-expenses)" strokeWidth={2} fill="url(#expensesFill)" />
          <Line type="monotone" dataKey="profit" stroke="var(--chart-profit)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeeklyHoursChart() {
  return (
    <div className="small-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={hoursData} margin={{ top: 8, right: 2, left: -26, bottom: 0 }} barSize={16}>
          <CartesianGrid vertical={false} stroke="var(--line-soft)" strokeDasharray="3 5" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="billable" stackId="hours" fill="var(--chart-revenue)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="nonbillable" stackId="hours" fill="var(--chart-muted)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ClientRevenueChart({ data }: { data: { name: string; revenue: number; color: string }[] }) {
  return (
    <div className="donut-chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="revenue" nameKey="name" innerRadius="66%" outerRadius="88%" paddingAngle={3} stroke="none">
            {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`$${Number(value).toLocaleString()}`]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProfitabilityChart({ data }: { data: { name: string; margin: number }[] }) {
  return (
    <div className="medium-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 2, right: 18, left: 4, bottom: 0 }} barSize={11}>
          <CartesianGrid horizontal={false} stroke="var(--line-soft)" strokeDasharray="3 5" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 10 }} tickFormatter={(value) => `${value}%`} />
          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "var(--text-secondary)", fontSize: 10 }} width={128} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, "Margin"]} />
          <Bar dataKey="margin" fill="var(--chart-revenue)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}