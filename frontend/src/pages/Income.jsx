/**
 * Income page.
 * Lists all income entries with management cards, an add-entry modal,
 * delete confirmation and an Excel export button.
 */
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Download, TrendingUp, ReceiptText } from "lucide-react";

import { incomeAPI } from "../utils/api.js";
import { downloadBlob } from "../utils/helperUtils.js";
import LoadingScreen from "../components/LoadingScreen.jsx";
import TransactionCard from "../components/TransactionCard.jsx";
import AddIncomeModal from "../components/transactions/AddIncomeModal.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // id awaiting confirmation
  const [exporting, setExporting] = useState(false);

  const loadIncomes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await incomeAPI.getAll();
      setIncomes(data.income ?? []);
    } catch (err) {
      toast.error(err.message || "Failed to load income entries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  /** Opens the delete confirmation dialog for the given entry id. */
  const requestDelete = (id) => setDeleteTarget(id);

  /** Confirms deletion and removes the entry from local state immediately. */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await incomeAPI.delete(deleteTarget);
      setIncomes((prev) => prev.filter((item) => item._id !== deleteTarget));
      toast.success("Income entry deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete income entry");
    } finally {
      setDeleteTarget(null);
    }
  };

  /** Downloads the income report as an .xlsx file. */
  const handleDownload = async () => {
    setExporting(true);
    try {
      const response = await incomeAPI.downloadExcel();
      downloadBlob(response.data, `income_report_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Income report downloaded");
    } catch (err) {
      toast.error(err.message || "Failed to download the report");
    } finally {
      setExporting(false);
    }
  };

  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  if (loading) return <LoadingScreen label="Loading income entries…" />;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Income</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {incomes.length} {incomes.length === 1 ? "entry" : "entries"} ·{" "}
            <span className="font-semibold text-emerald-600">
              +{totalIncome.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </span>{" "}
            total
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="btn-secondary"
            disabled={exporting || incomes.length === 0}
            aria-label="Download income data as Excel"
          >
            <Download size={16} />
            <span className="hidden sm:inline">
              {exporting ? "Exporting…" : "Excel"}
            </span>
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={16} />
            Add Income
          </button>
        </div>
      </div>

      {/* Entry list */}
      {incomes.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-300">
            <ReceiptText size={26} />
          </div>
          <div>
            <p className="flex items-center justify-center gap-2 font-semibold text-gray-700">
              <TrendingUp size={16} className="text-emerald-500" />
              No income recorded yet
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Click “Add Income” to record your first source of income.
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary mt-2">
            <Plus size={16} />
            Add Income
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {incomes.map((item) => (
            <TransactionCard
              key={item._id}
              item={item}
              type="income"
              onDelete={requestDelete}
            />
          ))}
        </div>
      )}

      {/* Add entry modal */}
      <AddIncomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadIncomes}
      />

      {/* Delete confirmation */}
      <DeleteAlert
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onDelete={confirmDelete}
        title="Delete Income"
      />
    </div>
  );
}
