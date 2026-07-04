// components/TailoringLayout/TailoringLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "../Breadcrumbs/Breadcrumbs";

export const TailoringLayout = () => {
  const location = useLocation();
  const { t } = useTranslation();

  // Перевіряємо, чи знаходимося ми зараз на сторінці чекауту або успіху індивідуального пошиття
  const isCheckoutPage = location.pathname.includes(
    "/individual-tailoring/checkout",
  );
  const isSuccessPage = location.pathname.includes(
    "/individual-tailoring/order-success",
  );

  // Рендеримо хлібні крихти тільки якщо це НЕ сторінка checkout і НЕ сторінка success
  const showBreadcrumbs = !isCheckoutPage && !isSuccessPage;

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6 min-h-screen">
      {showBreadcrumbs && (
        <div className="w-full max-w-2xl mb-4 pt-6">
          <Breadcrumbs />
        </div>
      )}

      <Outlet />

      <footer className="w-full max-w-2xl mt-12 mb-6 text-center">
        <div className="border-t border-stone-200 pt-6">
          <p className="text-[10px] sm:text-xs text-stone-400 font-medium leading-relaxed px-4">
            {t("tailoringLayout.disclaimer")}
          </p>
        </div>
      </footer>
    </div>
  );
};
