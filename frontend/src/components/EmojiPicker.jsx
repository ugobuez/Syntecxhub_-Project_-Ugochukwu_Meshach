/**
 * Lightweight emoji picker.
 * A dependency-free popover grid of curated emojis. Clicking the trigger
 * toggles the panel; selecting an emoji pushes it back via `onSelect`.
 */
import { useEffect, useRef, useState } from "react";

const EMOJIS = [
  "💰", "💵", "🏦", "💳", "📈", "💼", "🎁", "🏆", "✈️", "🏠",
  "🚗", "🛒", "🍔", "☕", "🎬", "🩺", "📚", "💡", "📱", "👕",
  "🎮", "🏋️", "🐾", "🎓", "⛽", "🔧", "🍕", "🍓", "🎵", "🧾",
];

export default function EmojiPicker({ icon, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close the popover when clicking anywhere outside of it
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger button shows the currently selected emoji */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-2xl shadow-sm transition hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        aria-label="Pick an emoji"
        aria-expanded={isOpen}
      >
        {icon || "＋"}
      </button>

      {/* Popover grid */}
      {isOpen && (
        <div className="absolute left-0 top-14 z-50 w-64 animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-3 shadow-lg">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Choose an icon
          </p>
          <div className="grid max-h-40 grid-cols-10 gap-1 overflow-y-auto">
            {EMOJIS.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                type="button"
                onClick={() => {
                  onSelect(emoji);
                  setIsOpen(false);
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-primary-100 ${
                  icon === emoji ? "bg-primary-100 ring-1 ring-primary-400" : ""
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
