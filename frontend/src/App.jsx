import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";

import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import Home from "./pages/Home.jsx";
import Income from "./pages/Income.jsx";
import Expense from "./pages/Expense.jsx";

/** Redirects unauthenticated users to /login; renders children otherwise. */
function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

/** Keeps authenticated users away from the auth pages. */
function PublicOnlyRoute({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignUp />
          </PublicOnlyRoute>
        }
      />

      {/* Protected app routes (shared shell layout) */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/income" element={<Income />} />
        <Route path="/expense" element={<Expense />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
