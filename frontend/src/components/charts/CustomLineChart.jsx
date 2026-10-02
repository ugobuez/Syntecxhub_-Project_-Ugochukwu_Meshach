/**
 * Line chart wrapper around Recharts.
 * Used for the daily spending pattern (last 30 days) on the dashboard.
 */
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function CustomLineChart({ data, color = "#ef4444" }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-gray-400">
        No data to display yet
      </div>
    );
  }

  const formatValue = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
      notation: Math.max(...data.map((d) => d.amount || 0)) > 9999 ? "compact" : "standard",
    }).format(value || 0);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            interval="preserveStartEnd"
            minTickGap={24}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickFormatter={formatValue}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [
              new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0),
              "Spent",
            ]}
            cursor={{ stroke: "#d1d5db" }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
          <Line
            type="monotone"
            dataKey="amount"
            name="Daily spend"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
