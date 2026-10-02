/**
 * "Add Expense" modal.
 * Fields: emoji icon (picker), category, amount, date.
 * Validates locally before submitting, then notifies via toast.
 */
import { useState } from "react";
import toast from "react-hot-toast";

import Modal from "../Modal.jsx";
import EmojiPicker from "../EmojiPicker.jsx";
import { expenseAPI } from "../../utils/api.js";

export default function AddExpenseModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ icon: "", category: "", amount: "", date: "" });
  const [submitting, setSubmitting] = useState(false);

  const { icon, category, amount, date } = form;

  /** Generic field updater */
  const handleChange = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const validate = () => {
    if (!category.trim()) return "Expense category is required";
    if (!amount || Number(amount) <= 0) return "Amount must be greater than zero";
    if (!date) return "Please pick a date";
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSubmitting(true);
    try {
      await expenseAPI.add({
        icon,
        category: category.trim(),
        amount: Number(amount),
        date,
      });
      toast.success("Expense added successfully");
      setForm({ icon: "", category: "", amount: "", date: "" }); // reset for next open
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Icon + category row */}
        <div className="flex items-start gap-3">
          <div>
            <span className="form-label">Icon</span>
            <EmojiPicker icon={icon} onSelect={(emoji) => setForm((prev) => ({ ...prev, icon: emoji }))} />
          </div>
          <div className="flex-1">
            <label htmlFor="expense-category" className="form-label">
              Expense Category <span className="text-red-500">*</span>
            </label>
            <input
              id="expense-category"
              type="text"
              className="input-field"
              placeholder="e.g. Rent, Groceries, Transport"
              value={category}
              onChange={handleChange("category")}
              maxLength={100}
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="expense-amount" className="form-label">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            id="expense-amount"
            type="number"
            min="0.01"
            step="0.01"
            className="input-field"
            placeholder="e.g. 120.50"
            value={amount}
            onChange={handleChange("amount")}
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="expense-date" className="form-label">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="expense-date"
            type="date"
            className="input-field"
            value={date}
            max={new Date().toISOString().split("T")[0]}
            onChange={handleChange("date")}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Adding…" : "Add Expense"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
