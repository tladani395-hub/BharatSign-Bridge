/**
 * Central API configuration for BharatSign Bridge.
 * Allows overriding the backend base URL via environment variable VITE_API_URL,
 * defaulting to the local development FastAPI server.
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, "") || "http://127.0.0.1:8000"
