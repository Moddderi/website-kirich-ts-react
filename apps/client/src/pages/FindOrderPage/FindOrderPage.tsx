import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  getMyOrders,
  requestLoginCode,
  verifyLoginCode,
  type CabinetOrderSummary,
} from "../../api/cabinetApi";
import { useFormatDate } from "../../hooks/useTailoringEstimate";
import {
  clearSession,
  getSession,
  saveCabinetToken,
  saveSession,
} from "../../utils/cabinetStorage";

type Step = "loading" | "email" | "code" | "orders";

const inputClass =
  "w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white";
const buttonClass =
  "mt-5 w-full rounded-2xl bg-stone-900 px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:bg-stone-700 active:scale-95 disabled:opacity-60";
const labelClass =
  "mb-2 block text-[10px] font-semibold uppercase tracking-widest text-stone-400";

/** "My orders": sign in with an e-mail code, then pick an order. */
export const FindOrderPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // ?list=1 → always show the list (the "all my orders" link), even with one order
  const [searchParams] = useSearchParams();
  const listMode = searchParams.get("list") === "1";
  const formatDate = useFormatDate();

  const [step, setStep] = useState<Step>(() => (getSession() ? "loading" : "email"));
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<CabinetOrderSummary[]>([]);

  const showOrders = async (sessionToken: string): Promise<boolean> => {
    try {
      const list = await getMyOrders(sessionToken);
      // A single order opens right away
      if (list.length === 1 && !listMode) {
        saveCabinetToken(list[0].token);
        navigate(`/my-order/${list[0].token}`, { replace: true });
        return true;
      }
      setOrders(list);
      setStep("orders");
      return true;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) clearSession();
      return false;
    }
  };

  // Already signed in on this device → straight to the list
  useEffect(() => {
    const session = getSession();
    if (!session) return;
    let cancelled = false;
    getMyOrders(session.token)
      .then((list) => {
        if (cancelled) return;
        if (list.length === 1 && !listMode) {
          saveCabinetToken(list[0].token);
          navigate(`/my-order/${list[0].token}`, { replace: true });
          return;
        }
        setOrders(list);
        setStep("orders");
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) clearSession();
        if (!cancelled) setStep("email");
      });
    return () => {
      cancelled = true;
    };
  }, [navigate, listMode]);

  const onEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await requestLoginCode(email.trim());
      setCode("");
      setStep("code");
    } catch {
      setError(t("findOrder.error"));
    } finally {
      setBusy(false);
    }
  };

  const onCode = async (event: FormEvent) => {
    event.preventDefault();
    if (code.trim().length < 6) return;
    setBusy(true);
    setError(null);
    try {
      const token = await verifyLoginCode(email.trim(), code.trim());
      saveSession(token, email.trim().toLowerCase());
      if (!(await showOrders(token))) setError(t("findOrder.error"));
    } catch (err) {
      setError(
        axios.isAxiosError(err) && err.response?.status === 429
          ? t("findOrder.tooMany")
          : t("findOrder.wrongCode"),
      );
    } finally {
      setBusy(false);
    }
  };

  const signOut = () => {
    clearSession();
    setOrders([]);
    setEmail("");
    setStep("email");
  };

  return (
    <main className="grow pt-12 pb-28">
      <div className="mx-auto max-w-xl px-6 animate-reveal-up">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-semibold tracking-tighter text-stone-900 sm:text-5xl">
            {t("findOrder.title")}
          </h1>
          <p className="text-base font-medium leading-relaxed text-stone-500">
            {step === "orders"
              ? t("findOrder.pickOrder")
              : step === "code"
                ? t("findOrder.codeDescription", { email })
                : t("findOrder.description")}
          </p>
        </div>

        {step === "loading" && (
          <div className="h-40 animate-pulse rounded-4xl bg-stone-200" aria-busy="true" />
        )}

        {step === "email" && (
          <form
            onSubmit={onEmail}
            className="rounded-4xl border border-stone-200/60 bg-white p-8 shadow-sm"
          >
            <label htmlFor="cabinet-email" className={labelClass}>
              {t("findOrder.emailLabel")}
            </label>
            <input
              id="cabinet-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={inputClass}
            />
            {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className={buttonClass}>
              {busy ? t("findOrder.sending") : t("findOrder.submit")}
            </button>
          </form>
        )}

        {step === "code" && (
          <form
            onSubmit={onCode}
            className="rounded-4xl border border-stone-200/60 bg-white p-8 shadow-sm"
          >
            <label htmlFor="cabinet-code" className={labelClass}>
              {t("findOrder.codeLabel")}
            </label>
            <input
              id="cabinet-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className={`${inputClass} text-center text-2xl tracking-[0.4em]`}
            />
            <p className="mt-3 text-xs font-medium leading-relaxed text-stone-500">
              {t("findOrder.codeHint")}
            </p>
            {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy || code.length < 6}
              className={buttonClass}
            >
              {busy ? t("findOrder.checking") : t("findOrder.signIn")}
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep("email");
              }}
              className="mt-4 w-full text-center text-xs font-semibold text-stone-500 underline underline-offset-4 hover:text-stone-900"
            >
              {t("findOrder.otherEmail")}
            </button>
          </form>
        )}

        {step === "orders" && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-4xl border border-stone-200/60 bg-white p-8 text-center text-sm font-medium text-stone-500 shadow-sm">
                {t("findOrder.noOrders")}
              </div>
            ) : (
              orders.map((order) => (
                <Link
                  key={order.token}
                  to={`/my-order/${order.token}`}
                  className="block rounded-4xl border border-stone-200/60 bg-white p-6 shadow-sm transition-all hover:border-stone-900 hover:shadow-md"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-sm font-semibold text-stone-900">
                      {t("cabinet.label", { number: order.number })}
                    </p>
                    <p className="text-xs font-medium text-stone-400">
                      {formatDate(order.createdAt.slice(0, 10))}
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-stone-600">
                    {order.garments
                      .map((g) => `${t(`selectType.${g.type}`)} · ${g.program}`)
                      .join(", ")}
                  </p>
                  {order.start && (
                    <p className="mt-1 text-xs font-medium text-stone-500">
                      {t("cabinet.startLabel")}: {formatDate(order.start)}
                    </p>
                  )}
                </Link>
              ))
            )}
            <button
              type="button"
              onClick={signOut}
              className="w-full pt-2 text-center text-xs font-semibold text-stone-500 underline underline-offset-4 hover:text-stone-900"
            >
              {t("findOrder.signOut")}
            </button>
          </div>
        )}
      </div>
    </main>
  );
};
