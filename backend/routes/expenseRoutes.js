const express = require("express");
const router = express.Router();

const {
  addExpense,
  getAllExpense,
  deleteExpense,
  downloadExpenseExcel,
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

/* All expense routes require a valid JWT */
router.use(protect);

router.post("/add", addExpense);
router.get("/getAll", getAllExpense);
router.get("/download", downloadExpenseExcel);
router.delete("/:id", deleteExpense);

module.exports = router;
