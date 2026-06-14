import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { IoIosArrowForward } from "react-icons/io";
import { GoHome } from "react-icons/go";

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

// Регулярное выражение для проверки, является ли строка UUID
const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str,
  );

const fetchProductName = async (productId: string): Promise<string> => {
  const res = await fetch(`http://localhost:5005/api/products/${productId}`);
  if (!res.ok) throw new Error("Product not found");
  const data = await res.json();
  return data.name;
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  // Разбираем путь на сегменты
  const pathnames = location.pathname.split("/").filter((x) => x);
  const lastSegment = pathnames[pathnames.length - 1] || "";

  // Проверяем контекст страницы
  const isOrderSuccessPage = pathnames.includes("order-success");

  // Параметр является товаром, если это не статичный роут и не страница успешного заказа
  const isDynamicProductParam =
    !!lastSegment && !routeLabels[lastSegment] && !isOrderSuccessPage;

  // React Query для получения имени товара
  const { data: productName, isLoading } = useQuery<string, Error>({
    queryKey: ["productName", lastSegment],
    queryFn: () => fetchProductName(lastSegment),
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

        // 1. Если это UUID в успешном заказе — мы его вообще не рендерим как отдельную крошку
        if (isOrderSuccessPage && isUUID(value)) {
          return null;
        }

        // 2. Определяем базовый текст для крошки
        let label: string = routeLabels[value] || decodeURIComponent(value);

        // 3. Если это страница успешного заказа, за которой идет UUID
        if (value === "order-success" && pathnames[index + 1]) {
          label = "Замовлення оформлено";
        }

        // 4. Если это динамический ID товара
        if (isLast && isDynamicProductParam) {
          label = isLoading ? "Завантаження..." : productName || label;
        }

        // Вычисляем, является ли текущий UI-элемент последним видимым
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
