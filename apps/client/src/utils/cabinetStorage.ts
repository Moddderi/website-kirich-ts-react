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
