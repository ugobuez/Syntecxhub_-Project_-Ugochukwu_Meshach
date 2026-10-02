/**
 * Grouped bar chart wrapper around Recharts.
 * Used for the 30-day income vs expense trend on the dashboard.
 */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function CustomBarChart({ data }) {
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
      notation: Math.max(...data.flatMap((d) => [d.income || 0, d.expense || 0])) > 9999 ? "compact" : "standard",
    }).format(value || 0);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2} margin={{ top: 10, right: 8, bottom: 0, left: -12 }}>
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
            formatter={(value, name) => [
              new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0),
              name === "income" ? "Income" : "Expense",
            ]}
            cursor={{ fill: "rgba(124, 58, 237, 0.06)" }}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
          <Bar dataKey="income" name="Income" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={22} />
          <Bar dataKey="expense" name="Expense" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
