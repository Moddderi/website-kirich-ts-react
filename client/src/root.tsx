import { HashRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";
import { MainPage } from "./pages/MainPage/MainPage";
import { CatalogPage } from "./pages/CatalogPage/CatalogPage";

export const Root = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<MainPage />} />
          <Route path="catalog" element={<CatalogPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};
