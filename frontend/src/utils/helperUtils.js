/**
 * Shared UI helpers: currency/date formatting and file-download handling.
 */

/** Currency used across the app. Change here to localise. */
export const CURRENCY = "USD";
export const CURRENCY_LOCALE = "en-US";

/** Formats a number as currency, e.g. 1234.5 -> "$1,234.50". */
export const formatCurrency = (value) =>
  new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

/** Formats an ISO date string as "12 Feb 2025". */
export const formatDate = (date) =>
  new Date(date).toLocaleDateString(CURRENCY_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/** Strips the leading icon (if any) that transaction titles may carry. */
export const stripEmoji = (title = "") =>
  title.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\s]+/u, "");

/** Triggers a browser download for a Blob received from the API. */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/** Clamps a value between min and max. */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
