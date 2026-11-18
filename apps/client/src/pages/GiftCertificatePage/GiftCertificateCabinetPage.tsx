import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice, type GiftCertificateStatus } from "@project/shared";
import { LuCheck, LuCopy } from "react-icons/lu";
import { useState } from "react";
import { useCabinetCertificate } from "../../api/certificateApi";
import { GiftCertificateShare } from "../../components/GiftCertificateShare/GiftCertificateShare";
import { useFormatDate } from "../../hooks/useTailoringEstimate";
const statusTone: Record<GiftCertificateStatus, string> = {
  inactive: "border-stone-200 bg-stone-100 text-stone-600",
  active: "border-emerald-500/50 bg-emerald-500/15 text-emerald-700",
  used: "border-red-500/50 bg-red-500/15 text-red-700",
  expired: "border-red-200 bg-red-50 text-red-700",
};

export const GiftCertificateCabinetPage = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const formatDate = useFormatDate();
  const { data: cert, isLoading, isError } = useCabinetCertificate(token);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm font-medium text-stone-500">
        {t("certCabinet.loading")}
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-stone-900">
          {t("certCabinet.notFoundTitle")}
        </p>
        <p className="text-sm font-medium leading-relaxed text-stone-500">
          {t("certCabinet.notFoundText")}
        </p>
        <Link
          to="/my-orders"
          className="btn-ember rounded-2xl px-6 py-3 text-xs font-semibold uppercase tracking-widest"
        >
          {t("cabinet.findOrder")}
        </Link>
      </div>
    );
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(cert.electronicCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <main className="grow pt-12 pb-28">
      <div className="mx-auto max-w-xl px-6">
        <div className="mb-10 text-center">
          <span className="mb-6 inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent">
            {t("certCabinet.label", { number: cert.number })}
          </span>
          <h1 className="mb-3 text-4xl font-semibold tracking-tighter text-stone-900 sm:text-5xl">
            {t("certCabinet.title")}
          </h1>
          <Link
            to="/my-orders?list=1"
            className="mt-5 inline-block text-xs font-semibold text-stone-500 underline underline-offset-4 hover:text-stone-900"
          >
            {t("cabinet.allOrders")}
          </Link>
        </div>

        <div className="space-y-4">
          <div className="rounded-4xl border border-stone-200/70 bg-white p-7 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              {t("giftCertificate.electronicCodeLabel")}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="font-mono text-xl font-semibold tracking-wider text-stone-900 sm:text-2xl">
                {cert.electronicCode}
              </p>
              <button
                type="button"
                onClick={() => void copyCode()}
                className="rounded-xl border border-stone-200 p-3 text-stone-600"
                aria-label={t("giftCertificate.copyElectronicCode")}
              >
                {copied ? <LuCheck size={18} /> : <LuCopy size={18} />}
              </button>
            </div>
            <p className="mt-2 text-xs font-medium text-stone-500">
              {t("giftCertificate.electronicCodeHint")}
            </p>
          </div>

          <div className="rounded-4xl border border-stone-200/70 bg-white p-7 shadow-sm">
            <p
              className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusTone[cert.status]}`}
            >
              {t(`certCabinet.status.${cert.status}`)}
            </p>
            <p className="mt-4 text-sm text-stone-700">
              {t("giftCertificate.successAmount", {
                amount: formatPrice(cert.amountUah, "UAH"),
              })}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {t("giftCertificate.successValidUntil", {
                date: formatDate(cert.validUntil),
              })}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {t("certCabinet.purchased", { date: formatDate(cert.purchasedAt) })}
            </p>
            <p className="mt-4 text-xs font-medium leading-relaxed text-stone-500">
              {t(`certCabinet.statusHint.${cert.status}`)}
            </p>
          </div>

          {cert.giftShareToken && (
            <GiftCertificateShare shareToken={cert.giftShareToken} />
          )}
        </div>
      </div>
    </main>
  );
};
