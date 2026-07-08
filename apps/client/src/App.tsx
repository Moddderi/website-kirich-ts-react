import { Outlet } from "react-router-dom";
import { Header } from "./components/Header/Header";
import "./main.css";
import { Footer } from "./components/Footer/Footer";

export function App() {
  return (
    <div
      className="notranslate bg-beige-50 text-stone-900 font-sans antialiased selection:bg-stone-900 selection:text-beige-50 flex flex-col min-h-screen relative overflow-x-hidden"
      translate="no"
    >
      <Header />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
