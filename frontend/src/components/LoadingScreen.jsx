/**
 * Full-screen spinner shown while the session is being resolved
 * or a route-level data fetch is in flight.
 */
export default function LoadingScreen({ label = "Loading…" }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}
