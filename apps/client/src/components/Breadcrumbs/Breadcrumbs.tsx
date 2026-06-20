import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoIosArrowForward } from "react-icons/io";
import { GoHome } from "react-icons/go";
import { getProductById } from "../../api/productApi";

const routeLabels: Record<string, string> = {
  catalog: "Каталог",
  cart: "Кошик",
  favorite: "Вподобання",
  "individual-tailoring": "Індивідуальне пошиття",
  checkout: "Оформлення замовлення",
  "order-success": "Замовлення оформлено",
  studio: "Студія",
  women: "Жінкам",
  latina: "Латина",
  "step-1": "Вибір типу",
  "step-2": "Зняття мірок",
  "step-3": "Завершення",
  "delivery-and-payment": "Доставка та оплата",
  "privacy-policy": "Політика безпеки",
};

const tailoringSteps = [
  { path: "/individual-tailoring", label: "Індивідуальне пошиття" },
  { path: "/individual-tailoring/step-1", label: "Вибір типу" },
  { path: "/individual-tailoring/step-2", label: "Зняття мірок" },
  { path: "/individual-tailoring/step-3", label: "Завершення" },
];

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  // Присікаємо шлях до order-success на етапі розбиття, обрізаючи все, що йде після нього
  const rawPathnames = location.pathname.split("/").filter((x) => x);
  const orderSuccessIndex = rawPathnames.indexOf("order-success");
  const pathnames =
    orderSuccessIndex !== -1
      ? rawPathnames.slice(0, orderSuccessIndex + 1)
      : rawPathnames;

  const isTailoringPath = location.pathname.includes("/individual-tailoring");
  const lastSegment = pathnames[pathnames.length - 1] || "";
  const isDynamicProductParam = !!lastSegment && !routeLabels[lastSegment];

  const { data: product, isLoading } = useQuery({
    queryKey: ["productName", lastSegment],
    queryFn: () => getProductById(lastSegment),
    enabled: isDynamicProductParam && !pathnames.includes("order-success"),
    staleTime: 1000 * 60 * 10,
  });

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 mb-10 text-xs font-medium text-stone-500 select-none flex-wrap">
      <Link to="/" className="flex items-center gap-1 hover:text-stone-900">
        <GoHome size={14} className="text-stone-900" />
        Головна
      </Link>

      {isTailoringPath
        ? tailoringSteps.map((step, index) => {
            const currentIndex = tailoringSteps.findIndex(
              (s) => s.path === location.pathname,
            );

            // Скрываем будущие шаги
            if (index > currentIndex) return null;

            const isActive = index === currentIndex;
            const isCompleted = currentIndex >= index;

            return (
              <React.Fragment key={step.path}>
                <IoIosArrowForward className="text-stone-400 shrink-0" />
                {isActive ? (
                  <span className="font-semibold text-stone-900">
                    {step.label}
                  </span>
                ) : (
                  <Link
                    to={isCompleted ? step.path : "#"}
                    className={`hover:text-stone-900 ${!isCompleted ? "pointer-events-none opacity-50" : ""}`}
                  >
                    {step.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })
        : pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            const label =
              routeLabels[value] ||
              (isDynamicProductParam && isLast
                ? isLoading
                  ? "..."
                  : product?.name
                : decodeURIComponent(value));

            return (
              <React.Fragment key={to}>
                <IoIosArrowForward className="text-stone-400 shrink-0" />
                {isLast ? (
                  <span className="font-semibold text-stone-900">{label}</span>
                ) : (
                  <Link to={to} className="hover:text-stone-900">
                    {label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
    </nav>
  );
};
