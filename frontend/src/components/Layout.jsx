/**
 * App shell: responsive sidebar + mobile navbar wrapping the routed content.
 * The sidebar becomes a slide-in drawer (with backdrop) below the `lg` breakpoint.
 */
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar.jsx";
import Navbar from "./Navbar.jsx";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar with hamburger trigger */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Slide-in drawer on mobile / persistent sidebar on desktop */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Page content. `lg:pl-64` reserves the sidebar's width on desktop. */}
      <main className="pt-16 lg:pt-0 lg:pl-64">
        <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
