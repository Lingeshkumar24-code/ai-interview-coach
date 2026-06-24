import { useCallback, useState } from "react";

const STORAGE_KEY = "aic_session";

function readSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(data) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage may be unavailable (e.g. private browsing) — fail silently
  }
}

/**
 * Lightweight session hook to persist candidate + interview data across page
 * navigations (Role Selection -> Interview -> Results) without a global store.
 */
export function useInterviewSession() {
  const [session, setSession] = useState(() => readSession() || {});

  const updateSession = useCallback((patch) => {
    setSession((prev) => {
      const next = { ...prev, ...patch };
      writeSession(next);
      return next;
    });
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession({});
  }, []);

  return { session, updateSession, clearSession };
}
