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
  const isSelectTypeStep = location.pathname.includes(
    "/individual-tailoring/step-1",
  );
  const showBreadcrumbs = !isWidePage;

  return (
    <div
      className={`relative flex w-full flex-col items-stretch ${
        isWidePage ? "" : "p-4 sm:p-6"
      }`}
    >
      {showBreadcrumbs && (
        <div
          className={`mx-auto w-full max-w-7xl px-0 sm:px-6 mb-4 pt-6 ${
            isSelectTypeStep ? "max-sm:mb-2 max-sm:pt-2" : ""
          }`}
        >
          <Breadcrumbs />
        </div>
      )}

      <Outlet />

      {!isWidePage && (
        <footer className="mx-auto mb-2 mt-8 w-full max-w-2xl text-center max-sm:mt-6">
          <div className="border-t border-stone-200 pt-6 max-sm:pt-4">
            <p className="text-[10px] sm:text-xs text-stone-400 font-medium leading-relaxed px-4">
              {t("tailoringLayout.disclaimer")}
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};
