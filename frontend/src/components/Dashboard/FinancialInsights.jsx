/**
 * Analytics section: pie charts for financial distribution, a grouped bar
 * chart for the 30-day income/expense trend, and a line chart for the
 * daily spending pattern. All charts are responsive via Recharts containers.
 */
import {
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingDown,
} from "lucide-react";

import CustomPieChart from "../charts/CustomPieChart.jsx";
import CustomBarChart from "../charts/CustomBarChart.jsx";
import CustomLineChart from "../charts/CustomLineChart.jsx";

/** Small titled card wrapper used for each chart. */
function ChartCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`card p-4 sm:p-5 ${className}`}>
      <div className="mb-2 flex items-center gap-2">
        <Icon size={16} className="text-primary-600" />
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function FinancialInsights({ charts }) {
  const {
    last30Days = [],
    dailyExpenseTrend = [],
    incomeBySource = [],
    expenseByCategory = [],
  } = charts || {};

  const incomeTotal = incomeBySource.reduce((sum, item) => sum + item.value, 0);
  const expenseTotal = expenseByCategory.reduce((sum, item) => sum + item.value, 0);

  return (
    <section aria-label="Financial analytics" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* 30-day income vs expense trend (bar) */}
      <ChartCard title="Income vs Expense — Last 30 Days" icon={BarChart3}>
        <CustomBarChart data={last30Days} />
      </ChartCard>

      {/* Daily spending pattern (line) */}
      <ChartCard title="Daily Spending Pattern — Last 30 Days" icon={LineChartIcon}>
        <CustomLineChart data={dailyExpenseTrend} />
      </ChartCard>

      {/* Income distribution (pie) */}
      <ChartCard title="Income by Source" icon={PieChartIcon}>
        <CustomPieChart data={incomeBySource} label="Total Income" totalAmount={incomeTotal} />
      </ChartCard>

      {/* Expense distribution (pie) */}
      <ChartCard title="Expense by Category" icon={TrendingDown}>
        <CustomPieChart data={expenseByCategory} label="Total Expense" totalAmount={expenseTotal} />
      </ChartCard>
    </section>
  );
}
