/**
 * Transaction management card used on the Income and Expense pages.
 * Shows the emoji icon, title, amount and date, with a delete button that
 * is revealed on hover (always visible on touch devices).
 */
import { Trash2, CalendarDays } from "lucide-react";

import { formatCurrency, formatDate } from "../utils/helperUtils.js";

export default function TransactionCard({ item, type, onDelete }) {
  const isIncome = type === "income";

  return (
    <div className="card group relative flex items-center gap-4 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary-100 hover:shadow-card-hover">
      {/* Emoji icon */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
          isIncome ? "bg-emerald-50" : "bg-rose-50"
        }`}
      >
        {item.icon || (isIncome ? "💰" : "💸")}
      </div>

      {/* Title + date */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
          {isIncome ? item.source : item.category}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
          <CalendarDays size={12} />
          {formatDate(item.date)}
        </p>
      </div>

      {/* Amount + delete */}
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`text-sm font-bold sm:text-base ${
            isIncome ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          +{formatCurrency(item.amount).replace("+", "")}
        </span>
        <button
          onClick={() => onDelete(item._id)}
          className="rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          aria-label={`Delete ${isIncome ? "income" : "expense"} entry`}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}
