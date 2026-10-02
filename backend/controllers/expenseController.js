/**
 * Expense controller — CRUD plus Excel export for the authenticated user.
 * All queries are scoped by `userId` so users can never read each other's data.
 */
const ExcelJS = require("exceljs");

const Expense = require("../models/Expense");

/**
 * POST /api/v1/expense/add
 * Body: { icon, category, amount, date }
 */
exports.addExpense = async (req, res, next) => {
  try {
    const { icon = "", category, amount, date } = req.body;

    if (!category || !amount || !date) {
      return res
        .status(400)
        .json({ message: "Category, amount and date are required" });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      icon,
      category: String(category).trim(),
      amount: Number(amount),
      date: new Date(date),
    });

    return res.status(201).json({ message: "Expense added successfully", expense });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/expense/getAll
 * Returns all expense entries for the user, newest first.
 */
exports.getAllExpense = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    return res.status(200).json({ expenses });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/v1/expense/:id
 * Deletes an expense entry owned by the authenticated user.
 */
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense entry not found" });
    }

    return res.status(200).json({ message: "Expense entry deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid expense entry id" });
    }
    return next(error);
  }
};

/**
 * GET /api/v1/expense/download
 * Streams the user's expense entries as an .xlsx file (ExcelJS).
 */
exports.downloadExpenseExcel = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Expense Tracker";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Expenses");
    sheet.columns = [
      { header: "Category", key: "category", width: 35 },
      { header: "Amount", key: "amount", width: 18 },
      { header: "Date", key: "date", width: 22 },
      { header: "Icon", key: "icon", width: 10 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF7C3AED" },
    };

    expenses.forEach((item) => {
      sheet.addRow({
        category: item.category,
        amount: item.amount,
        date: new Date(item.date).toISOString().split("T")[0],
        icon: item.icon || "",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="expense_report_${new Date().toISOString().split("T")[0]}.xlsx"`
    );

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    return next(error);
  }
};
