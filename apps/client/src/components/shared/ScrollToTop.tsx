import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackUmamiPageview } from "../../utils/umami";

export const ScrollToTop = (): null => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    const track = () => trackUmamiPageview(pathname);

    if (window.umami) {
      track();
      return;
    }

    const onUmamiReady = () => track();
    window.addEventListener("umami:ready", onUmamiReady);

    return () => {
      window.removeEventListener("umami:ready", onUmamiReady);
    };
  }, [pathname]);

  return null;
};
