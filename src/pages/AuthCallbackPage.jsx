import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../utils/supabaseClient";
import { useWorkspace } from "../context/WorkspaceContext";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { reloadUserSession, showToast, t } = useWorkspace();
  const [errorMsg, setErrorMsg] = useState("");
  const hasHandledRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate execution during re-renders or StrictMode
    if (hasHandledRef.current) return;

    if (!isSupabaseConfigured() || !supabase) {
      hasHandledRef.current = true;
      navigate("/login", { replace: true });
      return;
    }

    // Intercept OAuth error parameters returned in search (?error=...) or hash (#error=...)
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.startsWith("#") ? window.location.hash.substring(1) : window.location.hash);
    const errorParam =
      searchParams.get("error_description") ||
      hashParams.get("error_description") ||
      searchParams.get("error") ||
      hashParams.get("error");

    if (errorParam) {
      hasHandledRef.current = true;
      setErrorMsg(errorParam || "Autentikasi gagal atau dibatalkan.");
      return;
    }

    let isSubscribed = true;
    let authListenerSubscription = null;
    let timeoutId = null;

    const finalizeLogin = async () => {
      if (!isSubscribed || hasHandledRef.current) return;
      hasHandledRef.current = true;

      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
        authListenerSubscription = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      try {
        await reloadUserSession();
        showToast(t("auth.loginSuccess") || "Berhasil masuk!");
      } catch (err) {
        console.error("Error finalizing auth session:", err);
      } finally {
        navigate("/dashboard", { replace: true });
      }
    };

    // Timeout safety guard (8 seconds): prevents endless spinner if OAuth exchange hangs
    timeoutId = setTimeout(() => {
      if (!isSubscribed || hasHandledRef.current) return;
      hasHandledRef.current = true;
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
        authListenerSubscription = null;
      }
      setErrorMsg("Proses autentikasi membutuhkan waktu terlalu lama. Silakan coba masuk kembali.");
    }, 8000);

    async function handleAuth() {
      try {
        // 1. Check if session was already established or parsed from URL
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          if (!isSubscribed) return;
          hasHandledRef.current = true;
          clearTimeout(timeoutId);
          setErrorMsg(error.message || "Autentikasi gagal.");
          return;
        }

        if (data?.session) {
          await finalizeLogin();
          return;
        }

        // 2. If not yet resolved, listen for SIGNED_IN event from Supabase URL code/token processing
        const { data: listenerData } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isSubscribed) return;
            if (event === "SIGNED_IN" && session) {
              await finalizeLogin();
            }
          }
        );
        authListenerSubscription = listenerData?.subscription;
      } catch (err) {
        if (!isSubscribed) return;
        hasHandledRef.current = true;
        clearTimeout(timeoutId);
        setErrorMsg(err.message || "Terjadi kesalahan saat memproses otentikasi.");
      }
    }

    handleAuth();

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, []); // Run strictly once on mount

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-md text-center">
          <span className="material-symbols-outlined text-[40px] text-error mb-2">error</span>
          <h2 className="text-headline-md font-headline-md text-on-surface mb-2 font-bold">
            Autentikasi Gagal
          </h2>
          <p className="text-body-sm text-on-surface-variant mb-6">{errorMsg}</p>
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold cursor-pointer hover:bg-primary-container transition-colors"
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
