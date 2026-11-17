import { useTranslation } from "react-i18next";
import { LuBadgeCheck } from "react-icons/lu";
import { useFormattedPrice } from "../../hooks/useFormattedPrice";

type Props = {
  code: string;
  discountUah: number;
  className?: string;
};

export const CertificateAppliedBanner = ({
  code,
  discountUah,
  className = "",
}: Props) => {
  const { t } = useTranslation();
  const formatPrice = useFormattedPrice();
  const displayCode = /^KIR-/.test(code) ? code : `№${code}`;

  return (
    <div
      className={`flex gap-4 rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-5 text-left shadow-sm ${className}`}
      role="status"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
        <LuBadgeCheck size={22} strokeWidth={2.2} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
          {t("certificateBanner.title")}
        </p>
        <p className="mt-1 text-sm font-semibold leading-snug text-emerald-950">
          {t("certificateBanner.applied", {
            amount: formatPrice(discountUah),
          })}
        </p>
        <p className="mt-1 text-xs font-medium text-emerald-800/80">
          {t("certificateBanner.code", { code: displayCode })}
        </p>
      </div>
    </div>
  );
};