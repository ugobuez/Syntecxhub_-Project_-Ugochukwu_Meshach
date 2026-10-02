/**
 * Dashboard controller — aggregates every dataset the home page needs in a
 * single request: summary totals, chart series and recent transactions.
 *
 * GET /api/v1/dashboard/stats
 */
const Income = require("../models/Income");
const Expense = require("../models/Expense");

/** Returns `daysAgo`-day boundary at midnight, inclusive of today. */
const startDate = (days) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
};

/** `YYYY-MM-DD` key for grouping documents by calendar day. */
const dayKey = (date) => new Date(date).toISOString().split("T")[0];

exports.getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Load all of the user's financial documents in parallel
    const [incomes, expenses] = await Promise.all([
      Income.find({ userId }).sort({ date: -1 }).lean(),
      Expense.find({ userId }).sort({ date: -1 }).lean(),
    ]);

    /* --------------------------- Summary totals --------------------------- */
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBalance = totalIncome - totalExpense;

    /* --------------------- Bar chart: last 30 days ------------------------ */
    // Group income and expense per calendar day, then emit one row per day
    const barMap = new Map();
    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      barMap.set(dayKey(d), {
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        income: 0,
        expense: 0,
      });
    }
    incomes.forEach((i) => {
      const key = dayKey(i.date);
      if (barMap.has(key)) barMap.get(key).income += i.amount;
    });
    expenses.forEach((e) => {
      const key = dayKey(e.date);
      if (barMap.has(key)) barMap.get(key).expense += e.amount;
    });
    const last30Days = Array.from(barMap.values());

    /* ------------------- Line chart: daily expense trend ------------------ */
    // Last 30 days, cumulative spend per day
    const lineMap = new Map();
    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      lineMap.set(dayKey(d), 0);
    }
    expenses.forEach((e) => {
      const key = dayKey(e.date);
      if (lineMap.has(key)) lineMap.set(key, lineMap.get(key) + e.amount);
    });
    const dailyExpenseTrend = Array.from(lineMap.entries()).map(([key, amount], idx) => ({
      label: new Date(key).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      day: idx + 1,
      amount,
    }));

    /* ---------------- Pie charts: category / source breakdown ------------- */
    const groupBy = (items, field) => {
      const map = new Map();
      items.forEach((item) => {
        const name = item[field] || "Other";
        map.set(name, (map.get(name) || 0) + item.amount);
      });
      return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    };

    const expenseByCategory = groupBy(expenses, "category");
    const incomeBySource = groupBy(incomes, "source");

    // Same breakdown but limited to the last 60 days of activity
    const cutoff60 = startDate(60);
    const recentExpenses = expenses.filter((e) => new Date(e.date) >= cutoff60);
    const last60DaysExpenseByCategory = groupBy(recentExpenses, "category");

    /* ------------------------ Recent transactions ------------------------- */
    const recentTransactions = [
      ...incomes.slice(0, 5).map((i) => ({
        _id: i._id,
        type: "income",
        title: i.source,
        icon: i.icon,
        amount: i.amount,
        date: i.date,
      })),
      ...expenses.slice(0, 5).map((e) => ({
        _id: e._id,
        type: "expense",
        title: e.category,
        icon: e.icon,
        amount: e.amount,
        date: e.date,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return res.status(200).json({
      totals: {
        totalBalance,
        totalIncome,
        totalExpense,
        incomeCount: incomes.length,
        expenseCount: expenses.length,
      },
      charts: {
        last30Days, // bar chart: income vs expense per day
        dailyExpenseTrend, // line chart: daily spend
        expenseByCategory, // pie: all-time spend by category
        incomeBySource, // pie: all-time income by source
        last60DaysExpenseByCategory, // pie: recent-spend distribution
      },
      recentTransactions,
    });
  } catch (error) {
    return next(error);
  }
};
