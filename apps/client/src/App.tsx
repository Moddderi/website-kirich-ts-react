import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./components/Header/Header";
import "./main.css";
import { Footer } from "./components/Footer/Footer";

const PageFallback = () => (
  <div className="min-h-[60vh] w-full" aria-busy="true">
    <div className="h-0.5 w-full overflow-hidden bg-stone-200/60">
      <div className="h-full w-1/3 animate-pulse bg-stone-900/70" />
    </div>
  </div>
);

export function App() {
  return (
    <div
      className="notranslate bg-beige-50 text-stone-900 font-sans antialiased selection:bg-stone-900 selection:text-beige-50 flex flex-col min-h-screen relative overflow-x-hidden"
      translate="no"
    >
      <Header />

      <main>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
