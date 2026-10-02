/**
 * Pie chart wrapper around Recharts.
 * Renders a donut-style distribution chart with a custom legend and a
 * center label (total or last hovered/active value).
 */
import { useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Palette rotates if a dataset has more slices than colors
const COLORS = [
  "#7c3aed", "#10b981", "#f59e0b", "#3b82f6", "#ef4444",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

export default function CustomPieChart({ data, label, totalAmount }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-gray-400">
        No data to display yet
      </div>
    );
  }

  const formatValue = (value) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

  return (
    <div className="relative h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={90}
            paddingAngle={3}
            strokeWidth={0}
            activeIndex={activeIndex}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(-1)}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [formatValue(value), name]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
          <Legend
            iconType="circle"
            layout="vertical"
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label showing the active slice or the overall total */}
      <div className="pointer-events-none absolute left-1/2 top-[38%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-lg font-bold text-gray-900">
          {formatValue(activeIndex >= 0 ? data[activeIndex].value : totalAmount)}
        </span>
      </div>
    </div>
  );
}
