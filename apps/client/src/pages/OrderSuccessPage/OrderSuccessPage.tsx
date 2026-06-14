import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";

// 1. Описываем строгие интерфейсы вместо explicit any
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

const fetchOrderDetails = async (orderId: string): Promise<OrderData> => {
  const res = await fetch(`http://localhost:5005/api/orders/${orderId}`);
  if (!res.ok) throw new Error("Заказ не найден");
  const result = await res.json();
  return result.data;
};

export const OrderSuccessPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<OrderData, Error>({
    queryKey: ["orderDetails", orderId],
    queryFn: () => fetchOrderDetails(orderId || ""),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-stone-500 font-medium text-sm">
        Загрузка деталей заказа...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-stone-900 font-semibold text-lg">
          Заказ не найден или произошла ошибка.
        </p>
        <button
          onClick={() => navigate("/")}
          className="text-sm font-semibold underline text-stone-500 hover:text-stone-900"
        >
          Вернуться на главную
        </button>
      </div>
    );
  }

  // Избавляемся от 'any' при расчете суммы
  const itemsTotal =
    order.items?.reduce(
      (acc: number, item: OrderItem) =>
        acc + Number(item.price) * item.quantity,
      0,
    ) || 0;

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-24 animate-reveal-up">
      <Breadcrumbs />

      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
        {/* ЛЕВАЯ КОЛОНКА: СТАТУС */}
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
            Заказ успешно передан
          </h1>

          <p className="text-lg font-medium text-stone-500 max-w-lg mb-8 leading-relaxed">
            Рады сообщить, {order.firstName}, что ваши мерки и детали заказа
            успешно переданы в наше ателье. Наш менеджер свяжется с вами в
            ближайшее время.
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-12 rounded-2xl border border-stone-200 bg-transparent px-8 py-4 text-sm font-semibold uppercase tracking-widest text-stone-900 hover:bg-stone-50 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            Вернуться в каталог
          </button>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ДЕТАЛИ И ШАГИ */}
        <div className="mt-10 px-2 sm:px-0 lg:mt-0 lg:col-span-5 relative">
          <div className="sticky top-32">
            <div className="mb-8 p-6 sm:p-8 rounded-4xl bg-white border border-stone-200/60 shadow-sm">
              <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-6 flex items-center justify-between">
                <span>Детали заказа</span>
                <span className="text-xs font-medium text-stone-400 normal-case tracking-normal">
                  {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </h2>

              {/* ИСПРАВЛЕНО И КЛАССЫ ОБНОВЛЕНЫ: max-h-87.5 и OrderItem тип */}
              <div className="space-y-6 pb-6 border-b border-stone-100 max-h-87.5 overflow-y-auto pr-1">
                {order.items?.map((item: OrderItem, idx: number) => (
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
                          Цвет:{" "}
                          <span className="text-stone-900">{item.color}</span>
                        </p>
                      )}
                      {item.size && (
                        <p className="text-xs font-medium text-stone-500">
                          Размер / Пошив:{" "}
                          <span className="text-stone-900">{item.size}</span>
                        </p>
                      )}
                      <p className="text-xs font-semibold text-stone-900 mt-0.5">
                        {Number(item.price).toLocaleString()} ₴
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* СТОИМОСТЬ СУММАРНО */}
              <div className="space-y-4 pt-6 mb-6">
                <div className="flex justify-between text-sm font-medium text-stone-500">
                  <span>Стоимость товаров</span>
                  <span className="text-stone-900">
                    {itemsTotal.toLocaleString()} ₴
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium text-stone-500">
                  <span>Доставка</span>
                  <span className="text-stone-900">
                    {order.deliveryMethod === "pickup"
                      ? "Самовывоз"
                      : "По тарифам НП"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-stone-100">
                <span className="text-sm font-semibold uppercase tracking-widest text-stone-900">
                  Итого
                </span>
                <span className="text-2xl font-semibold text-stone-900">
                  {Number(order.totalAmount).toLocaleString()} ₴
                </span>
              </div>
            </div>

            {/* СПОЙЛЕРЫ С ИНСТРУКЦИЯМИ */}
            <div className="border-t border-stone-200/60 divide-y divide-stone-200/60">
              <details className="group py-5" open>
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold tracking-tight text-stone-900 marker:content-none select-none">
                  Следующие шаги
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-stone-400 group-open:rotate-180 transition-transform duration-200"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </summary>
                <div className="mt-4 text-sm font-medium text-stone-500 leading-relaxed pr-8 animate-fade-in">
                  Менеджер свяжется с вами для подтверждения заказа. После
                  внесения предоплаты 50% мы приступаем к пошиву. Срок
                  изготовления — 10-14 дней.
                </div>
              </details>

              <details className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold tracking-tight text-stone-900 marker:content-none select-none">
                  Поддержка
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-stone-400 group-open:rotate-180 transition-transform duration-200"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </summary>
                <div className="mt-4 text-sm font-medium text-stone-500 leading-relaxed pr-8 animate-fade-in">
                  Если у вас остались вопросы, вы можете связаться с нами в
                  Telegram или по телефону, указанному внизу страницы.
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
