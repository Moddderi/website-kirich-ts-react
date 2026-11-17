import { Link, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@project/shared";
import { LuCheck, LuCopy } from "react-icons/lu";
import { useState, type ReactNode } from "react";

type SuccessState = {
  certificate: {
    number: number;
    electronicCode: string;
    amountUah: number;
    validUntil: string;
    buyerLabel: string;
  };
};

export const GiftCertificateSuccessPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const state = location.state as SuccessState | null;
  const [copied, setCopied] = useState<"number" | "code" | null>(null);

  if (!state?.certificate?.number || !state.certificate.electronicCode) {
    return <Navigate to="/gift-certificate" replace />;
  }

  const { number, electronicCode, amountUah, validUntil, buyerLabel } =
    state.certificate;

  const copy = async (value: string, which: "number" | "code") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:py-24 animate-reveal-up text-center">
      <MotionCheck />
      <h1 className="mt-6 font-display text-3xl font-medium text-stone-900 sm:text-4xl">
        {t("giftCertificate.successTitle")}
      </h1>
      <p className="mt-3 text-sm font-medium text-stone-500">
        {t("giftCertificate.successDesc")}
      </p>

      <div className="mt-10 space-y-6">
        <MotionCard>
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">
            {t("giftCertificate.numberLabel")}
          </p>
          <MotionCodeRow
            value={String(number)}
            copied={copied === "number"}
            onCopy={() => copy(String(number), "number")}
            copyLabel={t("giftCertificate.copyNumber")}
            monospace={false}
            size="lg"
          />
        </MotionCard>

        <MotionCard highlight>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t("giftCertificate.electronicCodeLabel")}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {t("giftCertificate.electronicCodeHint")}
          </p>
          <MotionCodeRow
            value={electronicCode}
            copied={copied === "code"}
            onCopy={() => copy(electronicCode, "code")}
            copyLabel={t("giftCertificate.copyElectronicCode")}
            monospace
            size="md"
          />
        </MotionCard>

        <div className="rounded-4xl border border-stone-200/70 bg-white p-6 text-left shadow-sm">
          <p className="text-sm text-stone-600">
            {t("giftCertificate.successAmount", {
              amount: formatPrice(amountUah, "UAH"),
            })}
          </p>
          <p className="mt-1 text-sm text-stone-600">
            {t("giftCertificate.successBuyer", { name: buyerLabel })}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {t("giftCertificate.successValidUntil", { date: validUntil })}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-accent/25 bg-accent/5 px-5 py-4 text-left">
        <p className="text-sm font-medium leading-relaxed text-stone-800">
          {t("giftCertificate.successActivationNote")}
        </p>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-stone-500">
        {t("giftCertificate.successRedeemHint")}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-stone-500">
        {t("giftCertificate.successEmailNote")}
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
  );
};

function MotionCheck() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
      <LuCheck size={32} strokeWidth={2.5} />
    </div>
  );
}

function MotionCard({
  children,
  highlight,
}: {
  children: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-4xl border p-8 shadow-sm ${
        highlight
          ? "border-accent/30 bg-accent/[0.04]"
          : "border-stone-200/70 bg-white"
      }`}
    >
      {children}
    </div>
  );
}

function MotionCodeRow({
  value,
  copied,
  onCopy,
  copyLabel,
  monospace,
  size,
}: {
  value: string;
  copied: boolean;
  onCopy: () => void;
  copyLabel: string;
  monospace: boolean;
  size: "lg" | "md";
}) {
  return (
    <div className="mt-3 flex items-center justify-center gap-3">
      <span
        className={`font-display font-semibold tracking-tight text-stone-900 ${
          size === "lg" ? "text-5xl" : "text-2xl sm:text-3xl"
        } ${monospace ? "font-mono tracking-wider" : ""}`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onCopy}
        className="rounded-xl border border-stone-200 p-3 text-stone-600 transition hover:border-stone-300"
        aria-label={copyLabel}
      >
        {copied ? <LuCheck size={18} /> : <LuCopy size={18} />}
      </button>
    </div>
  );
}