/**
 * Expense page.
 * Lists all expense entries with management cards, an add-entry modal,
 * delete confirmation and an Excel export button.
 */
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Download, TrendingDown, ReceiptText } from "lucide-react";

import { expenseAPI } from "../utils/api.js";
import { downloadBlob } from "../utils/helperUtils.js";
import LoadingScreen from "../components/LoadingScreen.jsx";
import TransactionCard from "../components/TransactionCard.jsx";
import AddExpenseModal from "../components/transactions/AddExpenseModal.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";

export default function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // id awaiting confirmation
  const [exporting, setExporting] = useState(false);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await expenseAPI.getAll();
      setExpenses(data.expenses ?? []);
    } catch (err) {
      toast.error(err.message || "Failed to load expense entries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  /** Opens the delete confirmation dialog for the given entry id. */
  const requestDelete = (id) => setDeleteTarget(id);

  /** Confirms deletion and removes the entry from local state immediately. */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await expenseAPI.delete(deleteTarget);
      setExpenses((prev) => prev.filter((item) => item._id !== deleteTarget));
      toast.success("Expense entry deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete expense entry");
    } finally {
      setDeleteTarget(null);
    }
  };

  /** Downloads the expense report as an .xlsx file. */
  const handleDownload = async () => {
    setExporting(true);
    try {
      const response = await expenseAPI.downloadExcel();
      downloadBlob(response.data, `expense_report_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Expense report downloaded");
    } catch (err) {
      toast.error(err.message || "Failed to download the report");
    } finally {
      setExporting(false);
    }
  };

  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  if (loading) return <LoadingScreen label="Loading expense entries…" />;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Expense</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {expenses.length} {expenses.length === 1 ? "entry" : "entries"} ·{" "}
            <span className="font-semibold text-rose-600">
              −{totalExpense.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </span>{" "}
            total
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="btn-secondary"
            disabled={exporting || expenses.length === 0}
            aria-label="Download expense data as Excel"
          >
            <Download size={16} />
            <span className="hidden sm:inline">
              {exporting ? "Exporting…" : "Excel"}
            </span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Entry list */}
      {expenses.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-300">
            <ReceiptText size={26} />
          </div>
          <div>
            <p className="flex items-center justify-center gap-2 font-semibold text-gray-700">
              <TrendingDown size={16} className="text-rose-500" />
              No expenses recorded yet
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Click “Add Expense” to log your first expense.
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary mt-2">
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {expenses.map((item) => (
            <TransactionCard
              key={item._id}
              item={item}
              type="expense"
              onDelete={requestDelete}
            />
          ))}
        </div>
      )}

      {/* Add entry modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadExpenses}
      />

      {/* Delete confirmation */}
      <DeleteAlert
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onDelete={confirmDelete}
        title="Delete Expense"
      />
    </div>
  );
}
