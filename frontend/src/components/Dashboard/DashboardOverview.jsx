/**
 * Top summary cards: Total Balance, Total Income and Total Expense,
 * plus quick-action cards for the most common next steps.
 */
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Plus,
} from "lucide-react";

import { formatCurrency } from "../../utils/helperUtils.js";

export default function DashboardOverview({ totals }) {
  const { totalBalance = 0, totalIncome = 0, totalExpense = 0, incomeCount = 0, expenseCount = 0 } = totals || {};

  const summaryCards = [
    {
      label: "Total Balance",
      value: totalBalance,
      icon: Wallet,
      iconBg: "bg-primary-100 text-primary-600",
      hint: "Income minus expenses",
    },
    {
      label: "Total Income",
      value: totalIncome,
      icon: TrendingUp,
      iconBg: "bg-emerald-100 text-emerald-600",
      hint: `${incomeCount} income ${incomeCount === 1 ? "entry" : "entries"}`,
    },
    {
      label: "Total Expense",
      value: totalExpense,
      icon: TrendingDown,
      iconBg: "bg-rose-100 text-rose-600",
      hint: `${expenseCount} expense ${expenseCount === 1 ? "entry" : "entries"}`,
    },
  ];

  const quickActions = [
    {
      to: "/income",
      label: "Add Income",
      description: "Record a new source of income",
      icon: Plus,
      iconBg: "bg-emerald-500",
      arrow: ArrowUpRight,
    },
    {
      to: "/expense",
      label: "Add Expense",
      description: "Log something you spent on",
      icon: Plus,
      iconBg: "bg-rose-500",
      arrow: ArrowDownRight,
    },
    {
      to: "/income",
      label: "Download Income",
      description: "Export income data to Excel",
      icon: FileSpreadsheet,
      iconBg: "bg-primary-500",
      arrow: ArrowUpRight,
    },
    {
      to: "/expense",
      label: "Download Expense",
      description: "Export expense data to Excel",
      icon: FileSpreadsheet,
      iconBg: "bg-amber-500",
      arrow: ArrowDownRight,
    },
  ];

  return (
    <section aria-label="Financial overview" className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map(({ label, value, icon: Icon, iconBg, hint }) => (
          <div
            key={label}
            className="card flex items-center gap-4 p-5 transition hover:shadow-card-hover"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {label}
              </p>
              <p className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
                {formatCurrency(value)}
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-400">{hint}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {quickActions.map(({ to, label, description, icon: Icon, iconBg, arrow: Arrow }) => (
          <Link
            key={label}
            to={to}
            className="card group flex flex-col justify-between gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-card-hover sm:p-5"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${iconBg}`}>
                <Icon size={18} />
              </div>
              <Arrow
                size={16}
                className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-primary-500"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="mt-0.5 hidden text-xs text-gray-400 sm:block">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
