// components/TailoringLayout/TailoringLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "../Breadcrumbs/Breadcrumbs";

export const TailoringLayout = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const isCheckoutPage = location.pathname.includes(
    "/individual-tailoring/checkout",
  );
  const isSuccessPage = location.pathname.includes(
    "/individual-tailoring/order-success",
  );
  const isWidePage = isCheckoutPage || isSuccessPage;
  const showBreadcrumbs = !isWidePage;

  return (
    <div
      className={`w-full flex flex-col items-center min-h-screen ${
        isWidePage ? "" : "p-4 sm:p-6"
      }`}
    >
      {showBreadcrumbs && (
        <div className="w-full max-w-7xl px-4 sm:px-6 mb-4 pt-6">
          <Breadcrumbs />
        </div>
      )}

      <Outlet />

      {!isWidePage && (
        <footer className="w-full max-w-2xl mt-12 mb-6 text-center">
          <div className="border-t border-stone-200 pt-6">
            <p className="text-[10px] sm:text-xs text-stone-400 font-medium leading-relaxed px-4">
              {t("tailoringLayout.disclaimer")}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};
