import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { OG_IMAGE_URL, SITE_NAME, SITE_URL } from "../../constants/site";

const upsertMeta = (attr: "name" | "property", key: string, content: string) => {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const stripSlash = (path: string) =>
  path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

const isPrivatePath = (path: string) =>
  path === "/cart" ||
  path === "/favorite" ||
  path === "/checkout" ||
  path === "/my-orders" ||
  path === "/gift-certificate/success" ||
  path.startsWith("/order-success") ||
  path.startsWith("/my-order/") ||
  path.startsWith("/my-certificate/") ||
  path.startsWith("/gift/") ||
  path === "/individual-tailoring/step-2" ||
  path === "/individual-tailoring/step-3" ||
  path === "/individual-tailoring/step-4" ||
  path === "/individual-tailoring/checkout" ||
  path === "/individual-tailoring/order-success";

const PUBLIC_META: Record<string, { title: string; description: string }> = {
  "/": { title: "seo.homeTitle", description: "seo.homeDescription" },
  "/individual-tailoring": {
    title: "seo.tailoringTitle",
    description: "seo.tailoringDescription",
  },
  "/individual-tailoring/step-1": {
    title: "seo.tailoringStartTitle",
    description: "seo.tailoringStartDescription",
  },
  "/gift-certificate": {
    title: "seo.giftTitle",
    description: "seo.giftDescription",
  },
  "/delivery-and-payment": {
    title: "seo.deliveryTitle",
    description: "seo.deliveryDescription",
  },
  "/privacy-policy": {
    title: "seo.privacyTitle",
    description: "seo.privacyDescription",
  },
  "/catalog": {
    title: "seo.catalogTitle",
    description: "seo.catalogDescription",
  },
};

export const Seo = () => {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const path = stripSlash(pathname);
    const publicMeta = PUBLIC_META[path];
    const privatePage = isPrivatePath(path);
    const known = Boolean(publicMeta) || privatePage;
    const noindex = privatePage || !known;

    const title = publicMeta
      ? t(publicMeta.title)
      : privatePage
        ? t("seo.privateTitle")
        : t("seo.notFoundTitle");
    const description = publicMeta
      ? t(publicMeta.description)
      : privatePage
        ? t("seo.privateDescription")
        : t("seo.notFoundDescription");

    const canonical = `${SITE_URL}${path === "/" ? "/" : path}`;
    const locale = i18n.language === "en" ? "en_US" : "uk_UA";

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertLink("canonical", canonical);

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", locale);
    upsertMeta("property", "og:image", OG_IMAGE_URL);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", OG_IMAGE_URL);
  }, [pathname, t, i18n.language]);

  return null;
};
