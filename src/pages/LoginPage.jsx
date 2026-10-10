import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";
import { isSupabaseConfigured } from "../utils/supabaseClient";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, resetPassword, language, setLanguage, t, showToast } = useWorkspace();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Forgot password state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");
  const [resetErrorMsg, setResetErrorMsg] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg(t("auth.emailRequired"));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setErrorMsg(t("auth.emailInvalid"));
      return;
    }
    if (!password) {
      setErrorMsg(t("auth.passwordTooShort"));
      return;
    }

    setLoading(true);
    try {
      const result = await login(trimmedEmail, password);
      if (result.success) {
        showToast(t("auth.loginSuccess"));
        navigate("/dashboard");
      } else {
        setErrorMsg(result.error || t("auth.invalidCredentials"));
      }
    } catch (err) {
      setErrorMsg(err.message || t("auth.invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setErrorMsg(result.error || t("auth.googleOAuthConfigRequired"));
      }
    } catch (err) {
      setErrorMsg(err.message || t("auth.googleOAuthConfigRequired"));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetErrorMsg("");
    setResetSuccessMsg("");

    const trimmed = resetEmail.trim();
    if (!trimmed) {
      setResetErrorMsg(t("auth.emailRequired"));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmed)) {
      setResetErrorMsg(t("auth.emailInvalid"));
      return;
    }

    setResetLoading(true);
    try {
      const result = await resetPassword(trimmed);
      if (result.success) {
        setResetSuccessMsg(t("auth.passwordResetSuccess"));
      } else {
        setResetErrorMsg(result.error || "Gagal mengirim tautan reset.");
      }
    } catch (err) {
      setResetErrorMsg(err.message || "Gagal mengirim tautan reset.");
    } finally {
      setResetLoading(false);
    }
  };

  const hasCloudConfig = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between p-space-md sm:p-space-xl text-on-surface">
      {/* Top Navbar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-space-sm group">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">hub</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold leading-tight">
              Suru
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant leading-none">
              Workspace
            </span>
          </div>
        </Link>

        {/* Language Switcher */}
        <button
          type="button"
          onClick={() => setLanguage(language === "id" ? "en" : "id")}
          className="h-8 px-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container flex items-center gap-1.5 text-on-surface font-label-sm text-label-sm font-semibold shadow-xs transition-colors border border-surface-container"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">translate</span>
          <span>{language === "id" ? "Bahasa (ID)" : "English (EN)"}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-space-xl">
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-space-xl sm:p-8">
          <div className="text-center mb-space-lg">
            <h1 className="text-display font-display text-on-surface text-2xl font-bold tracking-tight">
              {t("auth.loginTitle")}
            </h1>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1.5">
              {t("auth.loginSubtitle")}
            </p>
          </div>

          {!hasCloudConfig && (
            <div className="mb-space-md p-space-md rounded-xl bg-secondary-container/40 border border-secondary-container text-on-surface text-label-sm flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5">info</span>
              <div>
                <span className="font-semibold block text-primary">
                  {language === "id" ? "Pengaturan Akun Mandiri" : "Self-Hosted / Local Mode"}
                </span>
                <span className="text-on-surface-variant text-[11px] leading-tight block mt-0.5">
                  {language === "id"
                    ? "Supabase cloud belum dikonfigurasi di .env. Anda dapat membuat dan menguji akun lokal di browser ini, atau hubungkan Supabase untuk Google OAuth & sinkronisasi cloud."
                    : "Supabase cloud is not configured in .env. You can create and test a local browser account, or connect Supabase for Google OAuth & cloud sync."}
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-space-md p-space-md rounded-xl bg-error/10 border border-error/20 text-error text-label-md flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">error</span>
              <span className="font-medium text-xs leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full h-11 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-2.5 transition-colors border border-surface-container cursor-pointer disabled:opacity-50 shadow-xs mb-space-md"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? "Menghubungkan..." : t("auth.loginWithGoogle")}</span>
          </button>

          <div className="flex items-center gap-space-sm mb-space-md">
            <div className="flex-1 h-px bg-surface-container"></div>
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
              {t("auth.orDivider")}
            </span>
            <div className="flex-1 h-px bg-surface-container"></div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-space-md">
            <div>
              <label className="block text-label-md font-semibold text-on-surface mb-1">
                {t("auth.emailLabel")}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-body-md focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-primary transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-label-md font-semibold text-on-surface">
                  {t("auth.passwordLabel")}
                </label>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="text-[12px] text-primary hover:underline font-medium"
                >
                  {t("auth.forgotPassword")}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.passwordPlaceholder")}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-body-md focus:outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-primary transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-space-lg"
            >
              {loading && <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>}
              <span>{loading ? "Memproses..." : t("auth.submitLogin")}</span>
            </button>
          </form>

          {/* Links */}
          <div className="mt-space-lg pt-space-md border-t border-surface-container flex flex-col gap-2 text-center text-body-sm text-on-surface-variant">
            <div>
              <span>{t("auth.noAccountYet")} </span>
              <Link to="/signup" className="text-primary hover:underline font-semibold">
                {t("auth.signUp")}
              </Link>
            </div>
            <div>
              <Link to="/dashboard" className="text-on-surface-variant hover:text-on-surface text-[12px] font-medium">
                {t("auth.continueAsGuest")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-6 relative">
            <button
              type="button"
              onClick={() => {
                setShowResetModal(false);
                setResetErrorMsg("");
                setResetSuccessMsg("");
              }}
              className="absolute right-4 top-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
              {t("auth.resetPasswordTitle")}
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              {t("auth.resetPasswordDesc")}
            </p>

            {resetSuccessMsg && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-3">
                {resetSuccessMsg}
              </div>
            )}

            {resetErrorMsg && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-medium mb-3">
                {resetErrorMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low text-on-surface text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3 py-1.5 rounded-lg text-body-sm font-medium text-on-surface-variant hover:bg-surface-container"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-body-sm font-semibold hover:bg-primary-container disabled:opacity-50"
                >
                  {resetLoading ? "Mengirim..." : t("auth.sendResetLink")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="w-full text-center text-label-sm text-on-surface-variant">
        <span>© {new Date().getFullYear()} Suru Workspace • Stitch Personal Productivity</span>
      </div>
    </div>
  );
}
