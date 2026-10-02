/**
 * Expense Tracker — API entry point.
 * Wires middleware, routes and the MongoDB connection together.
 */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const config = require("./config");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

/* ---------------------------- Global middleware --------------------------- */
app.disable("x-powered-by");
app.use(express.json({ limit: "5mb" })); // image uploads via base64 are not used, but keep headroom
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Allow the React dev servers to send/receive cookies
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);

// Serve uploaded profile images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* --------------------------------- Routes -------------------------------- */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Health check for monitoring / load balancers
app.get("/api/health", (_req, res) =>
  res.status(200).json({ status: "ok", uptime: process.uptime() })
);

/* --------------------------- 404 + error handling ------------------------- */
// Unknown API routes -> JSON 404 (not an HTML error page)
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  return res.status(404).json({ message: "Not found" });
});

// Centralised error handler — never leak stack traces in production
app.use((err, _req, res, _next) => {
  console.error(`[error] ${err.message}`);

  // Multer-specific errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large — maximum size is 5 MB" });
  }
  if (err.message && err.message.startsWith("Invalid file type")) {
    return res.status(400).json({ message: err.message });
  }

  // Mongoose validation errors -> 400 with field messages
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value — record already exists" });
  }

  return res.status(err.status || 500).json({
    message: config.IS_PROD ? "Internal server error" : err.message,
  });
});

/* -------------------------------- Bootstrap ------------------------------- */
const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.PORT, () => {
      console.log(
        `Server running in ${config.NODE_ENV} mode on http://localhost:${config.PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server — exiting.");
    process.exit(1);
  }
};

// Handle graceful shutdown on SIGINT/SIGTERM
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    console.log(`\n${signal} received — shutting down gracefully`);
    process.exit(0);
  });
}

startServer();

module.exports = app; // exported for testability
