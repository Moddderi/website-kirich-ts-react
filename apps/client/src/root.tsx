import { HashRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux"; // Импортируем провайдер

import { App } from "./App";
import { MainPage } from "./pages/MainPage/MainPage";
import { CatalogPage } from "./pages/CatalogPage/CatalogPage";
import { IndividualTailoringPage } from "./pages/IndividualTailoringPage/IndividualTailoringPage";
import { ScrollToTop } from "./components/shared/ScrollToTop"; // 1. Импортируем наш компонент
import { ProductPage } from "./pages/ProductPage/ProductPage";
import { CartPage } from "./pages/CartPage/CartPage";
import { store } from "./store/store";
import { CheckoutPage } from "./pages/CheckoutPage/CheckoutPage";

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
        <HashRouter>
          {/* 2. Вставляем строго сюда — внутри роутера, перед путями */}
          <ScrollToTop />

          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<MainPage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="/catalog/:id" element={<ProductPage />} />
              <Route
                path="individual-tailoring"
                element={<IndividualTailoringPage />}
              />

              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
            </Route>
          </Routes>
        </HashRouter>
      </QueryClientProvider>
    </Provider>
  );
};
