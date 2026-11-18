import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuCopy, LuShare2 } from "react-icons/lu";
import { Link } from "react-router-dom";

export const giftPageUrl = (shareToken: string) =>
  `${window.location.origin}/gift/${shareToken}`;

export const GiftCertificateShare = ({
  shareToken,
}: {
  shareToken: string;
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const url = giftPageUrl(shareToken);
  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const share = async () => {
    try {
      await navigator.share({
        title: t("giftShare.shareTitle"),
        text: t("giftShare.shareText"),
        url,
      });
    } catch {
      await copy();
    }
  };

  return (
    <div className="rounded-4xl border border-accent/25 bg-accent/5 p-6 text-left">
      <p className="text-sm font-semibold text-stone-900">
        {t("giftShare.ctaTitle")}
      </p>
      <p className="mt-1 text-xs font-medium leading-relaxed text-stone-600">
        {t("giftShare.ctaDesc")}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {canShare && (
          <button
            type="button"
            onClick={() => void share()}
            className="btn-ember inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-semibold uppercase tracking-widest"
          >
            <LuShare2 size={16} />
            {t("giftShare.share")}
          </button>
        )}
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-widest text-stone-800"
        >
          {copied ? <LuCheck size={16} /> : <LuCopy size={16} />}
          {copied ? t("giftShare.copied") : t("giftShare.copy")}
        </button>
        <Link
          to={`/gift/${shareToken}`}
          className="inline-flex items-center justify-center rounded-2xl border border-stone-200 px-5 py-3 text-center text-xs font-semibold uppercase tracking-widest text-stone-800"
        >
          {t("giftShare.preview")}
        </Link>
      </div>
    </div>
  );
};
