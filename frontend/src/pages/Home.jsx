/**
 * Dashboard page.
 * Fetches all stats from `/dashboard/stats` in a single request and renders
 * the summary cards, analytics charts and recent-activity feed.
 */
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";

import { dashboardAPI } from "../utils/api.js";
import LoadingScreen from "../components/LoadingScreen.jsx";
import DashboardOverview from "../components/Dashboard/DashboardOverview.jsx";
import FinancialInsights from "../components/Dashboard/FinancialInsights.jsx";
import RecentTransactions from "../components/Dashboard/RecentTransactions.jsx";

const EMPTY_STATS = {
  totals: {},
  charts: {},
  recentTransactions: [],
};

export default function Home() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const { data } = await dashboardAPI.getStats();
      setStats({
        totals: data.totals ?? {},
        charts: data.charts ?? {},
        recentTransactions: data.recentTransactions ?? [],
      });
    } catch (err) {
      toast.error(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) return <LoadingScreen label="Loading your dashboard…" />;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Overview of your financial activity
          </p>
        </div>
        <button
          onClick={() => loadStats(true)}
          className="btn-secondary"
          disabled={refreshing}
          aria-label="Refresh dashboard data"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Summary cards + quick actions */}
      <DashboardOverview totals={stats.totals} />

      {/* Analytics */}
      <FinancialInsights charts={stats.charts} />

      {/* Recent activity */}
      <RecentTransactions transactions={stats.recentTransactions} />
    </div>
  );
}
