import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { requestCabinetLink } from "../../api/cabinetApi";

export const FindOrderPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    try {
      await requestCabinetLink(email.trim());
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="grow pt-12 pb-28">
      <div className="mx-auto max-w-xl px-6 animate-reveal-up">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-semibold tracking-tighter text-stone-900 sm:text-5xl">
            {t("findOrder.title")}
          </h1>
          <p className="text-base font-medium leading-relaxed text-stone-500">
            {t("findOrder.description")}
          </p>
        </div>

        {status === "sent" ? (
          <div className="rounded-4xl border border-stone-200/60 bg-white p-8 text-center shadow-sm">
            <p className="text-base font-semibold text-stone-900">
              {t("findOrder.sentTitle")}
            </p>
            <p className="mt-3 text-sm font-medium leading-relaxed text-stone-500">
              {t("findOrder.sentText")}
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-4xl border border-stone-200/60 bg-white p-8 shadow-sm"
          >
            <label
              htmlFor="cabinet-email"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-stone-400"
            >
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
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-900 outline-none transition focus:border-stone-900 focus:bg-white"
            />
            {status === "error" && (
              <p className="mt-3 text-xs font-medium text-red-600">
                {t("findOrder.error")}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-5 w-full rounded-2xl bg-stone-900 px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-all hover:bg-stone-700 active:scale-95 disabled:opacity-60"
            >
              {status === "sending" ? t("findOrder.sending") : t("findOrder.submit")}
            </button>
          </form>
        )}
      </div>
    </main>
  );
};
