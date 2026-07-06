import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import "./i18n/i18n";

import { App } from "./App";
import { MainPage } from "./pages/MainPage/MainPage";
import { CatalogPage } from "./pages/CatalogPage/CatalogPage";
import { IndividualTailoringPage } from "./pages/IndividualTailoringPage/IndividualTailoringPage";
import { ScrollToTop } from "./components/shared/ScrollToTop";
import { UmamiAnalytics } from "./components/shared/UmamiAnalytics/UmamiAnalytics";
import { ProductPage } from "./pages/ProductPage/ProductPage";
import { CartPage } from "./pages/CartPage/CartPage";
import { store } from "./store/store";
import { CheckoutPage } from "./pages/CheckoutPage/CheckoutPage";
import { OrderSuccessPage } from "./pages/OrderSuccessPage/OrderSuccessPage";
import { SelectTypePage } from "./pages/SelectTypePage/SelectTypePage";
import { TailoringLayout } from "./components/TailoringLayout/TailoringLayout";
import { MeasurementsPage } from "./pages/MeasurementsPage/MeasurementsPage";
import { FavoritesPage } from "./pages/FavoritesPage/FavoritesPage";
import { DeliveryAndPaymentPage } from "./pages/DeliveryAndPaymentPage/DeliveryAndPaymentPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage/PrivacyPolicyPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export const Root = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <UmamiAnalytics />
          <ScrollToTop />

          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<MainPage />} />
              <Route path="catalog" element={<CatalogPage />} />

              <Route path="catalog/:id" element={<ProductPage />} />

              <Route path="individual-tailoring" element={<TailoringLayout />}>
                {/* Основная страница "Как это работает" */}
                <Route index element={<IndividualTailoringPage />} />

                {/* Отдельные страницы шагов */}
                <Route path="step-1" element={<SelectTypePage />} />
                <Route path="step-2" element={<MeasurementsPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-success" element={<OrderSuccessPage />} />
              </Route>

              <Route path="cart" element={<CartPage />} />
              <Route path="favorite" element={<FavoritesPage />} />

              <Route path="checkout" element={<CheckoutPage />} />

              {/* ИСПРАВЛЕНО: убрали слэш в начале */}
              <Route
                path="order-success/:orderId"
                element={<OrderSuccessPage />}
              />

              <Route
                path="delivery-and-payment"
                element={<DeliveryAndPaymentPage />}
              />
              <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};
