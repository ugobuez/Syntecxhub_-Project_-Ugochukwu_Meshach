/**
 * Recent activity: merges the latest incomes and expenses into a single,
 * live feed with type badges and relative styling.
 */
import { ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react";
import { Link } from "react-router-dom";

import { formatCurrency, formatDate } from "../../utils/helperUtils.js";

export default function RecentTransactions({ transactions = [] }) {
  return (
    <section aria-label="Recent transactions" className="card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt size={16} className="text-primary-600" />
          <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <span className="text-xs text-gray-400">Latest 5</span>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-300">
            <Receipt size={22} />
          </div>
          <p className="text-sm text-gray-400">
            No transactions yet — add income or expenses to see them here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {transactions.map((tx) => {
            const isIncome = tx.type === "income";
            return (
              <li key={`${tx.type}-${tx._id}`} className="flex items-center gap-3 py-3">
                {/* Icon / emoji badge */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                    isIncome ? "bg-emerald-50" : "bg-rose-50"
                  }`}
                >
                  {tx.icon || (isIncome ? "💰" : "💸")}
                </div>

                {/* Title + date */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{tx.title}</p>
                  <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
                </div>

                {/* Type badge */}
                <span
                  className={`hidden items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline-flex ${
                    isIncome
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {isIncome ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {isIncome ? "Income" : "Expense"}
                </span>

                {/* Amount */}
                <span
                  className={`shrink-0 text-sm font-bold ${
                    isIncome ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {isIncome ? "+" : "−"}
                  {formatCurrency(tx.amount)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer links to the full lists */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          to="/income"
          className="btn-secondary justify-center !py-2 text-xs sm:text-sm"
        >
          <ArrowUpRight size={14} />
          View All Income
        </Link>
        <Link
          to="/expense"
          className="btn-secondary justify-center !py-2 text-xs sm:text-sm"
        >
          <ArrowDownRight size={14} />
          View All Expenses
        </Link>
      </div>
    </section>
  );
}
