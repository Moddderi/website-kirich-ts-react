import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice, type GiftCertificateStatus } from "@project/shared";
import { LuCheck, LuCopy } from "react-icons/lu";
import { useState } from "react";
import { usePublicGiftCertificate } from "../../api/certificateApi";
import { useFormatDate } from "../../hooks/useTailoringEstimate";
const statusTone: Record<GiftCertificateStatus, string> = {
  inactive: "border-stone-200 bg-stone-100 text-stone-600",
  active: "border-emerald-500/50 bg-emerald-500/15 text-emerald-700",
  used: "border-red-500/50 bg-red-500/15 text-red-700",
  expired: "border-red-200 bg-red-50 text-red-700",
};

export const GiftReceivePage = () => {
  const { t } = useTranslation();
  const { shareToken } = useParams<{ shareToken: string }>();
  const formatDate = useFormatDate();
  const { data: cert, isLoading, isError } = usePublicGiftCertificate(shareToken);
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm font-medium text-stone-500">
        {t("giftReceive.loading")}
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-stone-900">
          {t("giftReceive.notFoundTitle")}
        </p>
        <p className="text-sm font-medium leading-relaxed text-stone-500">
          {t("giftReceive.notFoundText")}
        </p>
        <Link
          to="/"
          className="btn-ember rounded-2xl px-6 py-3 text-xs font-semibold uppercase tracking-widest"
        >
          {t("giftCertificate.successHomeCta")}
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
      <div className="mx-auto max-w-lg px-6 text-center">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
          {t("giftReceive.kicker")}
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl">
          {t("giftReceive.title")}
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-stone-500">
          {t("giftReceive.subtitle", { name: cert.fromName })}
        </p>

        <div className="mt-10 rounded-4xl border border-accent/25 bg-white p-8 shadow-sm">
          <p
            className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusTone[cert.status]}`}
          >
            {t(`certCabinet.status.${cert.status}`)}
          </p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-stone-400">
            {t("giftCertificate.electronicCodeLabel")}
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <p className="font-mono text-2xl font-semibold tracking-wider text-stone-900 sm:text-3xl">
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
          <p className="mt-6 text-lg font-semibold text-stone-900">
            {formatPrice(cert.amountUah, "UAH")}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {t("giftCertificate.successValidUntil", {
              date: formatDate(cert.validUntil),
            })}
          </p>
          <p className="mt-4 text-xs font-medium leading-relaxed text-stone-500">
            {t(`certCabinet.statusHint.${cert.status}`)}
          </p>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-stone-500">
          {t("giftReceive.howToUse")}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/individual-tailoring"
            className="btn-ember rounded-2xl px-8 py-3.5 text-xs font-semibold uppercase tracking-widest"
          >
            {t("giftCertificate.successTailoringCta")}
          </Link>
          <Link
            to="/"
            className="rounded-2xl border border-stone-200 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-stone-800"
          >
            {t("giftCertificate.successHomeCta")}
          </Link>
        </div>
      </div>
    </main>
  );
};
