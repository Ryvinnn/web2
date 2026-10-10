import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../utils/supabaseClient";
import { useWorkspace } from "../context/WorkspaceContext";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { reloadUserSession, showToast, t } = useWorkspace();
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function handleAuthCallback() {
      if (!isSupabaseConfigured() || !supabase) {
        navigate("/login");
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setErrorMsg(error.message || "Autentikasi gagal atau dibatalkan.");
          return;
        }

        if (data?.session) {
          await reloadUserSession();
          showToast(t("auth.loginSuccess") || "Berhasil masuk!");
          navigate("/dashboard", { replace: true });
        } else {
          // Listen once for auth state change
          const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (session) {
                await reloadUserSession();
                showToast(t("auth.loginSuccess") || "Berhasil masuk!");
                navigate("/dashboard", { replace: true });
              }
            }
          );

          return () => {
            authListener.subscription.unsubscribe();
          };
        }
      } catch (err) {
        setErrorMsg(err.message || "Terjadi kesalahan saat memproses otentikasi.");
      }
    }

    handleAuthCallback();
  }, [navigate, reloadUserSession, showToast, t]);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-md text-center">
          <span className="material-symbols-outlined text-[40px] text-error mb-2">error</span>
          <h2 className="text-headline-md font-headline-md text-on-surface mb-2">
            Autentikasi Gagal
          </h2>
          <p className="text-body-sm text-on-surface-variant mb-6">{errorMsg}</p>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold"
          >
            Kembali ke Halaman Masuk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[28px] animate-spin">progress_activity</span>
      </div>
      <h2 className="text-headline-md font-headline-md text-on-surface font-semibold mb-1">
        Menghubungkan Akun...
      </h2>
      <p className="text-body-sm text-on-surface-variant">
        Mohon tunggu sebentar, kami sedang menyiapkan sesi workspace Anda.
      </p>
    </div>
  );
}
