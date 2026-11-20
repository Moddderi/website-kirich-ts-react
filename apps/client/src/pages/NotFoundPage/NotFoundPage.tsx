import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400">
        404
      </p>
      <h1 className="mt-4 font-display text-4xl font-medium tracking-tight text-stone-900 sm:text-5xl">
        {t("notFoundPage.title")}
      </h1>
      <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-stone-500">
        {t("notFoundPage.text")}
      </p>
      <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full border border-stone-900/25 px-8 py-4 text-sm font-semibold text-stone-900 transition-colors hover:border-stone-900"
        >
          {t("notFoundPage.home")}
        </Link>
        <Link
          to="/individual-tailoring/step-1"
          className="btn-ember inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold"
        >
          {t("notFoundPage.tailoring")}
        </Link>
      </div>
    </div>
  );
};
