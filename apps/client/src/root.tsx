import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { CATALOG_ENABLED } from "./constants/features";
import { Analytics } from "@vercel/analytics/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import "./i18n/i18n";

import { App } from "./App";
import { MainPage } from "./pages/MainPage/MainPage";
import { ScrollToTop } from "./components/shared/ScrollToTop";
import { store } from "./store/store";
import { cloudinaryCloudQueryOptions } from "./hooks/useCloudinaryCloud";
import { TailoringLayout } from "./components/TailoringLayout/TailoringLayout";
import {
  CatalogPage,
  ProductPage,
  CartPage,
  CheckoutPage,
  OrderSuccessPage,
  FavoritesPage,
  IndividualTailoringPage,
  SelectTypePage,
  MeasurementsPage,
  AvailabilityPage,
  PrepaymentPage,
  DeliveryAndPaymentPage,
  PrivacyPolicyPage,
  OrderCabinetPage,
  FindOrderPage,
  GiftCertificatePage,
  GiftCertificateSuccessPage,
  GiftCertificateCabinetPage,
  GiftReceivePage,
  preloadLikelyPages,
} from "./routes/lazyPages";

preloadLikelyPages();

/** Ready-made shop pages are frozen (see constants/features.ts) → back to the landing page. */
const shop = (element: ReactElement) =>
  CATALOG_ENABLED ? element : <Navigate to="/" replace />;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

void queryClient.prefetchQuery(cloudinaryCloudQueryOptions);

export const Root = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />

          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<MainPage />} />
              <Route path="catalog" element={shop(<CatalogPage />)} />

              <Route path="catalog/:id" element={<ProductPage />} />

              <Route path="individual-tailoring" element={<TailoringLayout />}>
                {/* Основная страница "Как это работает" */}
                <Route index element={<IndividualTailoringPage />} />

                {/* Отдельные страницы шагов */}
                <Route path="step-1" element={<SelectTypePage />} />
                <Route path="step-2" element={<AvailabilityPage />} />
                <Route path="step-3" element={<MeasurementsPage />} />
                <Route path="step-4" element={<PrepaymentPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-success" element={<OrderSuccessPage />} />
              </Route>

              <Route path="cart" element={<CartPage />} />
              <Route path="favorite" element={<FavoritesPage />} />

              <Route path="checkout" element={<CheckoutPage />} />

              <Route
                path="order-success/:orderId"
                element={<OrderSuccessPage />}
              />

              <Route
                path="delivery-and-payment"
                element={<DeliveryAndPaymentPage />}
              />
              <Route path="privacy-policy" element={<PrivacyPolicyPage />} />

              {/* Client cabinet: personal link from the e-mail */}
              <Route path="my-order/:token" element={<OrderCabinetPage />} />
              <Route
                path="my-certificate/:token"
                element={<GiftCertificateCabinetPage />}
              />
              <Route path="my-orders" element={<FindOrderPage />} />
              <Route path="gift/:shareToken" element={<GiftReceivePage />} />
              <Route path="gift-certificate" element={<GiftCertificatePage />} />
              <Route
                path="gift-certificate/success"
                element={<GiftCertificateSuccessPage />}
              />
            </Route>
          </Routes>
          <Analytics />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};
