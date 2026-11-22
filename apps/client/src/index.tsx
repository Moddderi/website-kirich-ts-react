// Self-hosted fonts (no third-party requests; only the needed subsets download)
import "@fontsource-variable/manrope/wght.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "@fontsource/cormorant-garamond/latin-500-italic.css";
import "@fontsource/cormorant-garamond/cyrillic-500.css";
import "@fontsource/cormorant-garamond/cyrillic-600.css";
import "@fontsource/cormorant-garamond/cyrillic-500-italic.css";
import { inject } from "@vercel/analytics";
import { createRoot } from "react-dom/client";
import { Root } from "./root";
import { i18nReady } from "./i18n/i18n";
import "./main.css";

inject({ framework: "vite" });

void i18nReady.then(() => {
  createRoot(document.getElementById("root")!).render(<Root />);
});
