import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getOrderById } from "../../api/orderApi";
import { useFormattedPrice } from "../../hooks/useFormattedPrice";

interface OrderItem {
  id?: string;
  productId: string;
  name: string;
  quantity: number;
  price: number | string;
  color: string | null;
  size: string | null;
}

interface OrderData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  deliveryMethod: string;
  city: string;
  warehouse: string;
  totalAmount: number | string;
  createdAt: string;
  items: OrderItem[];
}

export const OrderSuccessPage = () => {
  const { t } = useTranslation();
  const formatPrice = useFormattedPrice();
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Перевіряємо, чи ми знаходимось на сторінці успіху пошиття
  const isCustomTailoring = location.pathname.includes(
    "/individual-tailoring/order-success",
  );

  // Запитуємо деталі з бекенду тільки якщо є orderId (для готових товарів)
  const {
    data: order,
    isLoading,
    error,
  } = useQuery<{ data: OrderData }, Error>({
    queryKey: ["orderDetails", orderId],
    queryFn: () => getOrderById(orderId || ""),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5,
  });

  // Рендер для завантаження даних (тільки для замовлень з кошика)
  if (orderId && isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-stone-500 font-medium text-sm">
        {t("orderSuccess.loading")}
      </div>
    );
  }

  // Якщо це замовлення з кошика, але сталася помилка
  if (orderId && (error || !order || !order.data)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-stone-900 font-semibold text-lg">
          {t("orderSuccess.notFound")}
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-sm font-semibold underline text-stone-500 hover:text-stone-900"
        >
          {t("orderSuccess.goHome")}
        </button>
      </div>
    );
  }

  // Стан для індивідуального пошиття (статичний успішний екран)
  if (isCustomTailoring) {
    return (
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-24 animate-reveal-up">
        <div className="flex flex-col items-center justify-center text-center py-10 lg:py-20 relative min-h-[50vh]">
          <div className="relative mb-10">
            <div className="absolute inset-0 animate-pulse-glow rounded-full bg-stone-200/50 blur-xl"></div>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-900 text-white relative z-10 shadow-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-stone-900 mb-6">
            {t("orderSuccess.customTitle")}
          </h1>

          <p className="text-lg font-medium text-stone-500 max-w-lg mb-8 leading-relaxed">
            {t("orderSuccess.customMessage")}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-2xl border border-stone-200 bg-transparent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-stone-900 hover:bg-stone-50 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {t("orderSuccess.goHome")}
          </button>
        </div>
      </div>
    );
  }

  // Рендер для звичайного замовлення з кошика (якщо є orderId)
  const orderData = order?.data;
  if (!orderData) return null;

  const itemsTotal =
    orderData.items?.reduce(
      (acc: number, item: OrderItem) =>
        acc + Number(item.price) * item.quantity,
      0,
    ) || 0;

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-24 animate-reveal-up">
      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
        {/* ЛЕВА КОЛОНКА: СТАТУС */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center text-center py-10 lg:py-20 relative">
          <div className="relative mb-10">
            <div className="absolute inset-0 animate-pulse-glow rounded-full bg-stone-200/50 blur-xl"></div>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone-900 text-white relative z-10 shadow-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-stone-900 mb-6">
            {t("orderSuccess.title")}
          </h1>

          <p className="text-lg font-medium text-stone-500 max-w-lg mb-8 leading-relaxed">
            {t("orderSuccess.message", { name: orderData.firstName })}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-12 rounded-2xl border border-stone-200 bg-transparent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-stone-900 hover:bg-stone-50 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {t("orderSuccess.backToCatalog")}
          </button>
        </div>

        {/* ПРАВА КОЛОНКА: ДЕТАЛІ */}
        <div className="mt-10 px-2 sm:px-0 lg:mt-0 lg:col-span-5 relative">
          <div className="sticky top-32">
            <div className="mb-8 p-6 sm:p-8 rounded-4xl bg-white border border-stone-200/60 shadow-sm">
              <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-6 flex items-center justify-between">
                <span>{t("orderSuccess.orderDetails")}</span>
                <span className="text-xs font-medium text-stone-400 normal-case tracking-normal">
                  {new Date(orderData.createdAt).toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </h2>

              <div className="space-y-6 pb-6 border-b border-stone-100 max-h-87.5 overflow-y-auto pr-1">
                {orderData.items?.map((item: OrderItem, idx: number) => (
                  <div key={item.id || idx} className="flex gap-5">
                    <div className="flex flex-col justify-center gap-1">
                      <h3 className="text-sm font-semibold text-stone-900 leading-tight">
                        {item.name}{" "}
                        <span className="text-stone-400 font-normal">
                          x{item.quantity}
                        </span>
                      </h3>
                      {item.color && (
                        <p className="text-xs font-medium text-stone-500">
                          {t("orderSuccess.color")}:{" "}
                          <span className="text-stone-900">{item.color}</span>
                        </p>
                      )}
                      {item.size && (
                        <p className="text-xs font-medium text-stone-500">
                          {t("orderSuccess.size")}:{" "}
                          <span className="text-stone-900">{item.size}</span>
                        </p>
                      )}
                      <p className="text-xs font-semibold text-stone-900 mt-0.5">
                        {formatPrice(Number(item.price))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 mb-6">
                <div className="flex justify-between text-sm font-medium text-stone-500">
                  <span>{t("orderSuccess.products")}</span>
                  <span className="text-stone-900">
                    {formatPrice(itemsTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium text-stone-500">
                  <span>{t("orderSuccess.delivery")}</span>
                  <span className="text-stone-900">
                    {orderData.deliveryMethod === "pickup"
                      ? t("orderSuccess.selfPickup")
                      : t("orderSuccess.byNPTariffs")}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-stone-100">
                <span className="text-sm font-semibold uppercase tracking-widest text-stone-900">
                  {t("orderSuccess.total")}
                </span>
                <span className="text-2xl font-semibold text-stone-900">
                  {formatPrice(Number(orderData.totalAmount))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
