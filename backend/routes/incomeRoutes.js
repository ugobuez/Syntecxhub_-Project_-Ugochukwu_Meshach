const express = require("express");
const router = express.Router();

const {
  addIncome,
  getAllIncome,
  deleteIncome,
  downloadIncomeExcel,
} = require("../controllers/incomeController");
const { protect } = require("../middleware/authMiddleware");

/* All income routes require a valid JWT */
router.use(protect);

router.post("/add", addIncome);
router.get("/getAll", getAllIncome);
router.get("/download", downloadIncomeExcel);
router.delete("/:id", deleteIncome);

module.exports = router;
