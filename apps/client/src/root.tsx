import { HashRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Добавили

import { App } from "./App";
import { MainPage } from "./pages/MainPage/MainPage";
import { CatalogPage } from "./pages/CatalogPage/CatalogPage";

// 1. Создаем клиент вне компонента (чтобы он не пересоздавался при ререндере)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Данные считаются свежими 5 минут
      refetchOnWindowFocus: false, // Не спамить запросами при переключении вкладок
    },
  },
});

export const Root = () => {
  return (
    // 2. Оборачиваем все приложение в QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<MainPage />} />
            <Route path="catalog" element={<CatalogPage />} />
          </Route>
        </Routes>
      </HashRouter>

      {/* 3. Панель разработчика (поможет видеть статус запросов в углу экрана) */}
    </QueryClientProvider>
  );
};
