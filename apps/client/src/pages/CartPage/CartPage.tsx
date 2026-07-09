import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateQuantity, removeFromCart } from "../../store/cartSlice";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs";
import type { CartItem } from "../../store/cartSlice";

import { IoTrashOutline } from "react-icons/io5";
import { HiMinus, HiPlus, HiArrowRight } from "react-icons/hi";
import { useProductName } from "../../utils/useLocalizedProduct";
import { useFormattedPrice } from "../../hooks/useFormattedPrice";

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const getProductName = useProductName();
  const formatPrice = useFormattedPrice();

  // 1. Селектор вытаскивает данные только из cart
  const cartItems = useAppSelector(
    (state: { cart: { items: CartItem[] } }) => state.cart.items,
  );

  // 2. Считаем суммы динамически на основе твоего CartItem
  const totalItems = cartItems.reduce(
    (acc: number, item: CartItem) => acc + item.quantity,
    0,
  );
  const totalPrice = cartItems.reduce(
    (acc: number, item: CartItem) => acc + item.price * item.quantity,
    0,
  );

  const handleIncrement = (cartItemId: string) => {
    dispatch(updateQuantity({ cartItemId, delta: 1 }));
  };

  const handleDecrement = (cartItemId: string) => {
    dispatch(updateQuantity({ cartItemId, delta: -1 }));
  };

  const handleRemove = (cartItemId: string) => {
    dispatch(removeFromCart(cartItemId));
  };

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    navigate("/checkout", { state: { items: cartItems, totalPrice } });
  };

  // Вспомогательная функция, чтобы безопасно достать картинку для отображения
  const getDisplayImage = (imageUrl: string | string[]) => {
    return Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-24 animate-reveal-up">
      <Breadcrumbs />

      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16 mt-4">
        {/* ЛЕВАЯ ЧАСТЬ */}
        <div className="lg:col-span-7 xl:col-span-8">
          {/* ТАБ (Пока только заголовок Корзины, без ссылки на Избранное) */}
          <div className="flex items-baseline gap-6 sm:gap-10 mb-8 border-b border-stone-200/60 pb-6 overflow-x-auto no-scrollbar">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-stone-900 relative whitespace-nowrap">
              {t("cart.title")}
              <span className="text-stone-400 font-medium normal-case ml-1 text-xl sm:text-2xl">
                ({totalItems})
              </span>
              <div className="absolute -bottom-6.25 left-0 right-0 h-0.5 bg-stone-900"></div>
            </h1>
          </div>

          {/* СПИСОК ТОВАРОВ */}
          {cartItems.length === 0 ? (
            <div className="py-12 text-stone-500 text-sm font-medium">
              {t("cart.empty")}
            </div>
          ) : (
            <div className="space-y-8">
              {cartItems.map((item: CartItem) => (
                <div
                  key={item.cartItemId}
                  className="flex flex-col sm:flex-row gap-6 pb-8 border-b border-stone-100 relative group animate-reveal-up"
                >
                  {/* Изображение */}
                  <div className="h-40 w-32 shrink-0 overflow-hidden rounded-2xl bg-stone-200 border border-stone-200/60 relative">
                    <img
                      src={getDisplayImage(item.imageUrl)}
                      alt={getProductName(item)}
                      className="w-full h-full object-cover"
                    />
                    <div className="w-full h-full absolute bg-linear-to-tr from-stone-400/20 via-beige-100 to-white/60 mix-blend-overlay"></div>
                    <div className="w-full h-full absolute mix-blend-multiply opacity-50"></div>
                  </div>

                  {/* Описание */}
                  <div className="flex flex-col grow py-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-stone-900">
                          {getProductName(item)}
                        </h3>
                        <p className="text-xs font-medium uppercase tracking-widest text-stone-500 mt-1">
                          {t("cart.article")}: {item.productCode || t("cart.bespoke")}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemove(item.cartItemId)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-2 -mr-2"
                        type="button"
                      >
                        <IoTrashOutline size={20} />
                      </button>
                    </div>

                    <div className="space-y-1.5 mb-6">
                      <p className="text-sm font-medium text-stone-500">
                        {t("cart.color")}:{" "}
                        <span className="text-stone-900 ml-1">
                          {item.options.color}
                        </span>
                      </p>
                      <p className="text-sm font-medium text-stone-500">
                        {t("cart.size")}:{" "}
                        <span className="text-stone-900 ml-1">
                          {item.options.size}
                        </span>
                      </p>
                    </div>

                    {/* Счетчик и Цена */}
                    <div className="mt-auto flex justify-between items-center">
                      <div className="flex items-center gap-4 rounded-xl border border-stone-200/80 px-3 py-1.5 bg-white shadow-sm">
                        <button
                          onClick={() => handleDecrement(item.cartItemId)}
                          className="text-stone-400 hover:text-stone-900 transition-colors"
                          type="button"
                        >
                          <HiMinus size={14} />
                        </button>
                        <span className="text-sm font-semibold text-stone-900 w-4 text-center select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(item.cartItemId)}
                          className="text-stone-400 hover:text-stone-900 transition-colors"
                          type="button"
                        >
                          <HiPlus size={14} />
                        </button>
                      </div>

                      <span className="text-xl font-semibold text-stone-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ПРАВАЯ ЧАСТЬ */}
        <div className="mt-12 lg:mt-0 lg:col-span-5 xl:col-span-4 relative">
          <div className="sticky top-32 space-y-6">
            <div className="p-6 sm:p-8 rounded-4xl bg-white border border-stone-200/60 shadow-sm">
              <h2 className="text-sm font-semibold tracking-widest uppercase text-stone-900 mb-6">
                {t("cart.yourOrder")}
              </h2>

              <div className="space-y-4 pb-6 border-b border-stone-100">
                <div className="flex justify-between text-sm font-medium text-stone-500">
                  <span>{t("cart.products", { count: totalItems })}</span>
                  <span className="text-stone-900">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium text-stone-500">
                  <span>{t("cart.discount")}</span>
                  <span className="text-stone-900">{formatPrice(0)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-stone-500">
                  <span>{t("cart.delivery")}</span>
                  <span className="text-stone-900">{t("cart.deliveryNP")}</span>
                </div>
              </div>

              <div className="flex justify-between items-end py-6">
                <span className="text-sm font-semibold uppercase tracking-widest text-stone-900">
                  {t("cart.total")}
                </span>
                <span className="text-2xl font-semibold text-stone-900 leading-none">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className="w-full rounded-2xl bg-stone-900 px-8 py-4 text-sm font-semibold uppercase tracking-widest text-white hover:bg-stone-800 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
              >
                {t("cart.checkout")}
                <HiArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
