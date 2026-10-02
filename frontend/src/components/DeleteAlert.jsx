/**
 * Delete confirmation dialog.
 * Used by the Income and Expense pages before permanently removing an entry.
 */
import { Trash2 } from "lucide-react";

import Modal from "./Modal.jsx";

export default function DeleteAlert({ isOpen, onClose, onDelete, title = "Delete Entry" }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
          <Trash2 className="text-red-600" size={20} />
        </div>
        <div>
          <p className="text-sm leading-relaxed text-gray-600">
            Are you sure you want to delete this entry? This action cannot be
            undone and the data will be permanently removed.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          onClick={onDelete}
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </Modal>
  );
}
