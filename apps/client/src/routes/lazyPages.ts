import { lazy } from "react";

/**
 * Route-level code splitting: every page except the landing page is loaded
 * on demand, so the first visit downloads a much smaller JS bundle.
 * The `load*` functions are also used to warm the chunks up in the background.
 */
export const loadCatalogPage = () =>
  import("../pages/CatalogPage/CatalogPage");
export const loadProductPage = () =>
  import("../pages/ProductPage/ProductPage");
export const loadCartPage = () => import("../pages/CartPage/CartPage");
export const loadCheckoutPage = () =>
  import("../pages/CheckoutPage/CheckoutPage");
export const loadOrderSuccessPage = () =>
  import("../pages/OrderSuccessPage/OrderSuccessPage");
export const loadFavoritesPage = () =>
  import("../pages/FavoritesPage/FavoritesPage");
export const loadIndividualTailoringPage = () =>
  import("../pages/IndividualTailoringPage/IndividualTailoringPage");
export const loadSelectTypePage = () =>
  import("../pages/SelectTypePage/SelectTypePage");
export const loadAvailabilityPage = () =>
  import("../pages/AvailabilityPage/AvailabilityPage");
export const loadPrepaymentPage = () =>
  import("../pages/PrepaymentPage/PrepaymentPage");
export const loadMeasurementsPage = () =>
  import("../pages/MeasurementsPage/MeasurementsPage");
export const loadDeliveryAndPaymentPage = () =>
  import("../pages/DeliveryAndPaymentPage/DeliveryAndPaymentPage");
export const loadPrivacyPolicyPage = () =>
  import("../pages/PrivacyPolicyPage/PrivacyPolicyPage");
export const loadOrderCabinetPage = () =>
  import("../pages/OrderCabinetPage/OrderCabinetPage");
export const loadFindOrderPage = () =>
  import("../pages/FindOrderPage/FindOrderPage");

export const CatalogPage = lazy(() =>
  loadCatalogPage().then((m) => ({ default: m.CatalogPage })),
);
export const ProductPage = lazy(() =>
  loadProductPage().then((m) => ({ default: m.ProductPage })),
);
export const CartPage = lazy(() =>
  loadCartPage().then((m) => ({ default: m.CartPage })),
);
export const CheckoutPage = lazy(() =>
  loadCheckoutPage().then((m) => ({ default: m.CheckoutPage })),
);
export const OrderSuccessPage = lazy(() =>
  loadOrderSuccessPage().then((m) => ({ default: m.OrderSuccessPage })),
);
export const FavoritesPage = lazy(() =>
  loadFavoritesPage().then((m) => ({ default: m.FavoritesPage })),
);
export const IndividualTailoringPage = lazy(() =>
  loadIndividualTailoringPage().then((m) => ({
    default: m.IndividualTailoringPage,
  })),
);
export const SelectTypePage = lazy(() =>
  loadSelectTypePage().then((m) => ({ default: m.SelectTypePage })),
);
export const AvailabilityPage = lazy(() =>
  loadAvailabilityPage().then((m) => ({ default: m.AvailabilityPage })),
);
export const PrepaymentPage = lazy(() =>
  loadPrepaymentPage().then((m) => ({ default: m.PrepaymentPage })),
);
export const MeasurementsPage = lazy(() =>
  loadMeasurementsPage().then((m) => ({ default: m.MeasurementsPage })),
);
export const DeliveryAndPaymentPage = lazy(() =>
  loadDeliveryAndPaymentPage().then((m) => ({
    default: m.DeliveryAndPaymentPage,
  })),
);
export const PrivacyPolicyPage = lazy(() =>
  loadPrivacyPolicyPage().then((m) => ({ default: m.PrivacyPolicyPage })),
);

export const OrderCabinetPage = lazy(() =>
  loadOrderCabinetPage().then((m) => ({ default: m.OrderCabinetPage })),
);
export const FindOrderPage = lazy(() =>
  loadFindOrderPage().then((m) => ({ default: m.FindOrderPage })),
);

/** Warm up the most likely next pages once the browser is idle. */
export const preloadLikelyPages = () => {
  const run = () => {
    void loadCatalogPage();
    void loadProductPage();
    void loadCartPage();
  };

  if (typeof window === "undefined") return;
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 4000 });
  } else {
    setTimeout(run, 2000);
  }
};
