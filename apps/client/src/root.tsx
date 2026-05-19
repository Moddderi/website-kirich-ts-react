import { HashRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { App } from "./App";
import { MainPage } from "./pages/MainPage/MainPage";
import { CatalogPage } from "./pages/CatalogPage/CatalogPage";
import { IndividualTailoringPage } from "./pages/IndividualTailoringPage/IndividualTailoringPage";
import { ScrollToTop } from "./components/shared/ScrollToTop"; // 1. Импортируем наш компонент

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
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        {/* 2. Вставляем строго сюда — внутри роутера, перед путями */}
        <ScrollToTop />

        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<MainPage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route
              path="individual-tailoring"
              element={<IndividualTailoringPage />}
            />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
};
