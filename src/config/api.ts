/**
 * Central API configuration for BharatSign Bridge.
 * - If VITE_API_URL is explicitly configured, uses it.
 * - In Vite development mode, defaults to "" (relative `/api/...` paths) so Vite's
 *   reverse proxy seamlessly forwards requests across localhost, LAN mobile IPs, and HTTPS tunnels.
 * - In production preview without VITE_API_URL, resolves dynamically from current hostname.
 */
function resolveApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/$/, "")
  if (envUrl) return envUrl

  if (import.meta.env.DEV) {
    return ""
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname
    if (host === "localhost" || host === "127.0.0.1") {
      return `http://${host}:8000`
    }
    return window.location.origin
  }

  return "http://127.0.0.1:8000"
}

export const API_BASE_URL = resolveApiBaseUrl()

/**
 * Returns the canonical OAuth callback URI, normalizing 127.0.0.1 to localhost
 * so Google and GitHub OAuth redirect_uri checks never mismatch locally.
 */
export function getOAuthRedirectUri(): string {
  if (typeof window === "undefined") return "http://localhost:5173/auth/callback"
  if (window.location.hostname === "127.0.0.1") {
    return `${window.location.protocol}//localhost:${window.location.port || "5173"}/auth/callback`
  }
  return `${window.location.origin}/auth/callback`
}
