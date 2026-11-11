/**
 * Cross-device clipboard helper that falls back cleanly on mobile browsers
 * or non-HTTPS origins where navigator.clipboard is unavailable.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to legacy textarea copy
    }
  }

  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      textarea.style.pointerEvents = "none"
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(textarea)
      return ok
    } catch {
      return false
    }
  }

  return false
}
