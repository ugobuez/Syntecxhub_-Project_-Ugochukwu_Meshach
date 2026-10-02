/**
 * Mobile-only top bar. Shows the brand and a hamburger button that
 * opens the sidebar drawer. Hidden on `lg` screens where the sidebar
 * is permanently visible.
 */
import { Menu, Wallet } from "lucide-react";

export default function Navbar({ onMenuClick }) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm lg:hidden">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
          <Wallet size={16} />
        </div>
        <span className="text-base font-bold text-gray-900">ExpenseTracker</span>
      </div>

      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>
    </header>
  );
}
