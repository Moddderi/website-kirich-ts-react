// components/layouts/TailoringLayout.tsx
import { Outlet } from "react-router-dom";
import { Breadcrumbs } from "../Breadcrumbs/Breadcrumbs";

export const TailoringLayout = () => {
  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6 min-h-screen">
      <div className="w-full max-w-2xl mb-4 pt-6">
        <Breadcrumbs />
      </div>
      <Outlet />
      <footer className="w-full max-w-2xl mt-12 mb-6 text-center">
        <div className="border-t border-stone-200 pt-6">
          <p className="text-[10px] sm:text-xs text-stone-400 font-medium leading-relaxed px-4">
            * Студія не несе відповідальності за невідповідність готового виробу
            через некоректно внесені або самостійно виміряні клієнтом мірки.
            Будь ласка, перевіряйте дані перед підтвердженням замовлення.
          </p>
        </div>
      </footer>
    </div>
  );
};
