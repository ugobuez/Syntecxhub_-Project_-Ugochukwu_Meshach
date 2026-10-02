/**
 * "Add Income" modal.
 * Fields: emoji icon (picker), source, amount, date.
 * Validates locally before submitting, then notifies via toast.
 */
import { useState } from "react";
import toast from "react-hot-toast";

import Modal from "../Modal.jsx";
import EmojiPicker from "../EmojiPicker.jsx";
import { incomeAPI } from "../../utils/api.js";

export default function AddIncomeModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ icon: "", source: "", amount: "", date: "" });
  const [submitting, setSubmitting] = useState(false);

  const { icon, source, amount, date } = form;

  /** Generic field updater */
  const handleChange = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const validate = () => {
    if (!source.trim()) return "Income source is required";
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
      await incomeAPI.add({
        icon,
        source: source.trim(),
        amount: Number(amount),
        date,
      });
      toast.success("Income added successfully");
      setForm({ icon: "", source: "", amount: "", date: "" }); // reset for next open
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to add income");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Income">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Icon + source row */}
        <div className="flex items-start gap-3">
          <div>
            <span className="form-label">Icon</span>
            <EmojiPicker icon={icon} onSelect={(emoji) => setForm((prev) => ({ ...prev, icon: emoji }))} />
          </div>
          <div className="flex-1">
            <label htmlFor="income-source" className="form-label">
              Income Source <span className="text-red-500">*</span>
            </label>
            <input
              id="income-source"
              type="text"
              className="input-field"
              placeholder="e.g. Salary, Freelance, Bonus"
              value={source}
              onChange={handleChange("source")}
              maxLength={100}
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="income-amount" className="form-label">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            id="income-amount"
            type="number"
            min="0.01"
            step="0.01"
            className="input-field"
            placeholder="e.g. 2500.00"
            value={amount}
            onChange={handleChange("amount")}
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="income-date" className="form-label">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="income-date"
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
            {submitting ? "Adding…" : "Add Income"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
