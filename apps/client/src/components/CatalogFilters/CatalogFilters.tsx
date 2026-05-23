import { SUBTYPE_MAP, SUBTYPE_LABELS, type FilterInput } from "@project/shared";

interface CatalogFiltersProps {
  filters: FilterInput;
  setFilters: React.Dispatch<React.SetStateAction<FilterInput>>;
}

export const CatalogFilters = ({
  filters,
  setFilters,
}: CatalogFiltersProps) => {
  const updateFilter = (fields: Partial<FilterInput>) => {
    setFilters((prev) => ({ ...prev, ...fields }));
  };

  const isActive = <K extends keyof FilterInput>(
    key: K,
    value: FilterInput[K],
  ): boolean => {
    return filters[key] === value;
  };

  const resetFilters = () => {
    setFilters({
      main_category: undefined,
      sub_type: undefined,
      search: "",
      dance_program: undefined,
    });
  };

  const getCurrentSubTypes = () => {
    if (filters.main_category === "accessories") return SUBTYPE_MAP.accessories;
    if (filters.dance_program === "ST") return SUBTYPE_MAP.ST;
    if (filters.dance_program === "LAT") return SUBTYPE_MAP.LAT;
    return [];
  };

  const currentSubTypes = getCurrentSubTypes();

  return (
    <div className="opacity-0 animate-reveal-up delay-300 mt-14 w-full flex flex-col items-center gap-5 z-20 relative">
      {/* ВЕРХНИЙ РЯД: ОСНОВНЫЕ КАТЕГОРИИ */}
      <div className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-1.5 p-1.5 rounded-full bg-stone-200/50 backdrop-blur-md border border-stone-200 overflow-x-auto w-full md:w-auto no-scrollbar px-2 md:px-1.5 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)]">
        <button
          onClick={() =>
            updateFilter({
              dance_program: "ST",
              main_category: "clothing",
              sub_type: undefined,
            })
          }
          className={`px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-colors whitespace-nowrap ${
            isActive("dance_program", "ST")
              ? "bg-white shadow border border-stone-100 text-stone-900"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          Стандарт
        </button>

        <button
          onClick={() =>
            updateFilter({
              dance_program: "LAT",
              main_category: "clothing",
              sub_type: undefined,
            })
          }
          className={`px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-colors whitespace-nowrap ${
            isActive("dance_program", "LAT")
              ? "bg-white shadow border border-stone-100 text-stone-900"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          Латина
        </button>

        <button
          onClick={() =>
            updateFilter({
              main_category: "accessories",
              dance_program: undefined,
              sub_type: undefined,
            })
          }
          className={`px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-colors whitespace-nowrap ${
            isActive("main_category", "accessories")
              ? "bg-white shadow border border-stone-100 text-stone-900"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          Аксесуари
        </button>

        <button
          onClick={() =>
            updateFilter({
              main_category: undefined,
              dance_program: undefined,
              sub_type: undefined,
            })
          }
          className={`px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-colors whitespace-nowrap ${
            filters.main_category === undefined &&
            filters.dance_program === undefined
              ? "bg-white shadow border border-stone-100 text-stone-900"
              : "text-stone-500 hover:text-stone-900"
          }`}
        >
          Все
        </button>
      </div>

      {/* НИЖНИЙ РЯД: ДИНАМИЧЕСКИЕ ПОДТИПЫ И ПОИСК */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-5xl px-4 text-center pb-8">
        {/* Рендерим кнопки только если есть подтипы для текущего выбора */}
        {currentSubTypes.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {currentSubTypes.map((type) => (
              <button
                key={type}
                // Приводим тип к конкретному значению из нашей схемы
                onClick={() =>
                  updateFilter({ sub_type: type as FilterInput["sub_type"] })
                }
                className={`px-4 py-1.5 rounded-xl text-xs font-medium shadow-sm transition-all ${
                  isActive("sub_type", type as FilterInput["sub_type"])
                    ? "bg-stone-900 text-white"
                    : "bg-white border border-stone-200 text-stone-600 hover:border-stone-900"
                }`}
              >
                {SUBTYPE_LABELS[type] || type}
              </button>
            ))}
          </div>
        )}

        {/* Разделитель (показываем только если есть и кнопки, и поиск) */}
        {currentSubTypes.length > 0 && (
          <div className="h-4 w-px bg-stone-300 mx-1 hidden lg:block"></div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <input
            type="text"
            placeholder="Поиск..."
            value={filters.search ?? ""}
            onChange={(e) => updateFilter({ search: e.target.value })}
            className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-xs font-medium focus:border-stone-900 focus:outline-none transition-all w-40"
          />
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-900 transition-colors underline decoration-dotted"
          >
            Сброс
          </button>
        </div>
      </div>
    </div>
  );
};
