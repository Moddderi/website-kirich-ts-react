export const CatalogLoadingBar = () => (
  <div
    className="mb-8 h-0.5 w-full overflow-hidden rounded-full bg-stone-200"
    role="status"
    aria-label="Завантаження товарів"
  >
    <div className="catalog-loading-bar h-full w-1/3 rounded-full bg-stone-900" />
  </div>
);
