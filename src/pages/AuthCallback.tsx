import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { RefreshCw, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Logo from "@/components/brand/Logo"
import { useAuthAndTheme } from "@/context/AuthAndThemeContext"
import { API_BASE_URL, getOAuthRedirectUri } from "@/config/api"

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { login } = useAuthAndTheme()
  const navigate = useNavigate()
  const hasExchangedRef = useRef(false)

  useEffect(() => {
    if (hasExchangedRef.current) return

    const code = searchParams.get("code")
    const state = searchParams.get("state") || ""
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    if (error) {
      setStatus("error")
      setErrorMessage(errorDescription || `OAuth provider returned error: ${error}`)
      return
    }

    if (!code) {
      setStatus("error")
      setErrorMessage("No authorization code received from identity provider.")
      return
    }

    hasExchangedRef.current = true

    const exchangeCode = async () => {
      try {
        const isGoogle = state.toLowerCase().includes("google") || (searchParams.has("scope") && searchParams.get("scope")?.includes("google"))
        const providerEndpoint = isGoogle
          ? `${API_BASE_URL}/api/auth/oauth/google`
          : `${API_BASE_URL}/api/auth/oauth/github`

        const response = await fetch(providerEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            redirect_uri: getOAuthRedirectUri(),
          }),
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.detail || "Failed to exchange authorization code.")
        }

        setStatus("success")

        setTimeout(() => {
          login(
            data.user.name,
            data.user.email,
            data.user.preferredLanguage,
            data.user,
            data.token
          )
          if (data.user && data.user.hasSecurityQuestions === false) {
            navigate("/security-setup", { replace: true })
          } else {
            navigate("/profile", { replace: true })
          }
        }, 1200)
      } catch (err: any) {
        setStatus("error")
        setErrorMessage(err.message || "An unexpected error occurred during authorization.")
      }
    }

    exchangeCode()
  }, [searchParams, login, navigate])

  return (
    <div className="min-h-screen bg-[#eceff8] dark:bg-[#060914] text-[#0e1430] dark:text-[#eef1ff] flex flex-col justify-center items-center px-4 py-8 relative">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0e1328] border border-[#d8e0f2] dark:border-[#222b4a] p-8 shadow-2xl text-center relative overflow-hidden">
        <div className="flex justify-center mb-6">
          <Logo variant="full" size="md" />
        </div>

        {status === "processing" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#2f4bff]/10 dark:bg-[#2f4bff]/20 border border-[#2f4bff]/30 flex items-center justify-center">
              <RefreshCw className="w-7 h-7 text-[#2f4bff] animate-spin" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0e1430] dark:text-[#eef1ff]">
                Verifying Authorization...
              </h2>
              <p className="text-xs text-[#586082] dark:text-[#828bb4] mt-1 leading-relaxed">
                Exchanging cryptographic credentials with your identity provider and issuing session tokens.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                Authorization Successful!
              </h2>
              <p className="text-xs text-[#586082] dark:text-[#828bb4] mt-1">
                Welcome to BharatSign Bridge. Redirecting to your learning workspace...
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                Authorization Failed
              </h2>
              <p className="text-xs text-[#586082] dark:text-[#828bb4] mt-1.5 leading-relaxed bg-rose-500/5 p-3 rounded-xl border border-rose-500/20">
                {errorMessage}
              </p>
            </div>

            <Button
              asChild
              className="mt-2 h-10 px-5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#2f4bff] to-[#1fa2ff] text-white"
            >
              <Link to="/auth">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Return to Sign In
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
