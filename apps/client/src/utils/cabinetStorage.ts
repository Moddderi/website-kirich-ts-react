const KEY = "kirich:cabinet-token";

/** Remember the latest cabinet link on this device so the header icon can open it. */
export const saveCabinetToken = (token: string | undefined | null): void => {
  if (!token) return;
  try {
    localStorage.setItem(KEY, token);
  } catch {
    /* storage may be blocked (private mode) — the icon then leads to the lookup page */
  }
};

export const getCabinetToken = (): string | null => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

const SESSION_KEY = "kirich:cabinet-session";

/** Signed-in session (90 days, issued by the server after the e-mail code). */
export const saveSession = (token: string, email: string): void => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token, email }));
  } catch {
    /* ignore */
  }
};

export const getSession = (): { token: string; email: string } | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
};
