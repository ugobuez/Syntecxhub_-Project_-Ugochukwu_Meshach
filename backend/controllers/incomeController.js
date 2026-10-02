/**
 * Income controller — CRUD plus Excel export for the authenticated user.
 * All queries are scoped by `userId` so users can never read each other's data.
 */
const ExcelJS = require("exceljs");

const Income = require("../models/Income");

/**
 * POST /api/v1/income/add
 * Body: { icon, source, amount, date }
 */
exports.addIncome = async (req, res, next) => {
  try {
    const { icon = "", source, amount, date } = req.body;

    if (!source || !amount || !date) {
      return res
        .status(400)
        .json({ message: "Source, amount and date are required" });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    const income = await Income.create({
      userId: req.user._id,
      icon,
      source: String(source).trim(),
      amount: Number(amount),
      date: new Date(date),
    });

    return res.status(201).json({ message: "Income added successfully", income });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/v1/income/getAll
 * Returns all income entries for the user, newest first.
 */
exports.getAllIncome = async (req, res, next) => {
  try {
    const income = await Income.find({ userId: req.user._id }).sort({ date: -1 });
    return res.status(200).json({ income });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/v1/income/:id
 * Deletes an income entry owned by the authenticated user.
 */
exports.deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!income) {
      return res.status(404).json({ message: "Income entry not found" });
    }

    return res.status(200).json({ message: "Income entry deleted successfully" });
  } catch (error) {
    // Mongoose cast errors surface as 400 rather than 500
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid income entry id" });
    }
    return next(error);
  }
};

/**
 * GET /api/v1/income/download
 * Streams the user's income entries as an .xlsx file (ExcelJS).
 */
exports.downloadIncomeExcel = async (req, res, next) => {
  try {
    const income = await Income.find({ userId: req.user._id }).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Expense Tracker";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Income");
    sheet.columns = [
      { header: "Source", key: "source", width: 35 },
      { header: "Amount", key: "amount", width: 18 },
      { header: "Date", key: "date", width: 22 },
      { header: "Icon", key: "icon", width: 10 },
    ];

    // Style the header row
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF7C3AED" }, // violet-600 to match the app theme
    };

    income.forEach((item) => {
      sheet.addRow({
        source: item.source,
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
      `attachment; filename="income_report_${new Date().toISOString().split("T")[0]}.xlsx"`
    );

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    return next(error);
  }
};
