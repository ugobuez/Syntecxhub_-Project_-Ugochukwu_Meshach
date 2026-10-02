/**
 * Centralised, validated application configuration.
 * Reads environment variables once and exposes them with sensible defaults.
 */
require("dotenv").config();

const required = (key, fallback = undefined) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    console.warn(`[config] Missing environment variable: ${key}`);
  }
  return value;
};

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(required("PORT", 5000)),
  MONGO_URI: required("MONGO_URI", "mongodb://127.0.0.1:27017/expense-tracker"),
  JWT_SECRET: required("JWT_SECRET", "dev_only_secret_change_me"),
  JWT_EXPIRES_IN: required("JWT_EXPIRES_IN", "7d"),
  CORS_ORIGIN: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  IS_PROD: process.env.NODE_ENV === "production",
};
