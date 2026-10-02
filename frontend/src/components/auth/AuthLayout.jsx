/**
 * Shared split-screen layout for the Login / Sign Up pages.
 * Left: brand + value proposition (hidden on mobile).
 * Right: centered auth form card.
 */
import { Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children, footerText, footerLinkTo, footerLinkLabel }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Brand panel — desktop only */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary-700 p-10 text-white lg:flex">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary-500/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-primary-500/30 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Wallet size={20} />
          </div>
          <span className="text-xl font-bold">ExpenseTracker</span>
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
            Take control of your money,
            <br />
            one transaction at a time.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-100">
            Track income and expenses, visualise spending patterns with rich
            analytics, and export your financial reports — all in one place.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-primary-100">
            <li className="flex items-center gap-2">✦ Real-time balance & analytics dashboard</li>
            <li className="flex items-center gap-2">✦ Beautiful charts for income and expenses</li>
            <li className="flex items-center gap-2">✦ One-click Excel export of your data</li>
          </ul>
        </div>

        <p className="relative text-xs text-primary-200">
          © {new Date().getFullYear()} ExpenseTracker. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-10 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Wallet size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">ExpenseTracker</span>
          </Link>

          <div className="card p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>

            <div className="mt-6">{children}</div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            {footerText}{" "}
            <Link
              to={footerLinkTo}
              className="font-semibold text-primary-600 transition hover:text-primary-700 hover:underline"
            >
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
