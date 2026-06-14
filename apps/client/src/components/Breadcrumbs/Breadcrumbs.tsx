import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { IoIosArrowForward } from "react-icons/io";
import { GoHome } from "react-icons/go";

// ИМПОРТИРУЕМ НАШ ЦЕНТРАЛИЗОВАННЫЙ МЕТОД
import { getProductById } from "../../api/productApi";

const routeLabels: Record<string, string> = {
  catalog: "Каталог",
  cart: "Кошик",
  "individual-tailoring": "Індивідуальне пошиття",
  checkout: "Оформлення замовлення",
  "order-success": "Замовлення оформлено",
  studio: "Студія",
  women: "Жінкам",
  latina: "Латина",
};

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str,
  );

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const lastSegment = pathnames[pathnames.length - 1] || "";

  const isOrderSuccessPage = pathnames.includes("order-success");
  const isDynamicProductParam =
    !!lastSegment && !routeLabels[lastSegment] && !isOrderSuccessPage;

  // ИСПОЛЬЗУЕМ getProductById
  const { data: product, isLoading } = useQuery({
    queryKey: ["productName", lastSegment],
    queryFn: () => getProductById(lastSegment),
    enabled: isDynamicProductParam,
    staleTime: 1000 * 60 * 10,
  });

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 mb-10 text-xs font-medium text-stone-500 select-none">
      <Link
        to="/"
        className="flex items-center gap-1 transition-colors hover:text-stone-900"
      >
        <GoHome size={14} className="text-stone-900" />
        Головна
      </Link>
      <IoIosArrowForward className="text-stone-400 shrink-0" />

      {pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;

        if (isOrderSuccessPage && isUUID(value)) return null;

        let label: string = routeLabels[value] || decodeURIComponent(value);

        if (value === "order-success" && pathnames[index + 1]) {
          label = "Замовлення оформлено";
        }

        // Берем имя из полученного объекта товара
        if (isLast && isDynamicProductParam) {
          label = isLoading ? "Завантаження..." : product?.name || label;
        }

        const isVisualLast =
          isLast ||
          (isOrderSuccessPage && index === pathnames.indexOf("order-success"));

        return (
          <React.Fragment key={to}>
            {isVisualLast ? (
              <span className="font-semibold text-stone-900 truncate max-w-[200px]">
                {label}
              </span>
            ) : (
              <>
                <Link
                  to={to}
                  className="transition-colors hover:text-stone-900 whitespace-nowrap"
                >
                  {label}
                </Link>
                <IoIosArrowForward className="text-stone-400 shrink-0" />
              </>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
