import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../store/store";
import { setMeasurement } from "../../store/tailoringSlice";
import {
  MEASUREMENT_CONFIG,
  MEASUREMENTS_CATALOG,
  getMeasurementSchema,
  type MeasurementType,
} from "@project/shared";

export const MeasurementsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { type, measurements } = useSelector(
    (state: RootState) => state.tailoring,
  );

  // Хуки должны вызываться до проверок условий (Rules of Hooks),
  // поэтому используем, а внутри формы делаем редирект, если type не существует.
  const config = type ? MEASUREMENT_CONFIG[type as MeasurementType] : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: type
      ? zodResolver(getMeasurementSchema(type as MeasurementType))
      : undefined,
    defaultValues: {
      height: "",
      ...measurements,
    },
  });

  // Выполняем редирект после вызова хука useForm, чтобы не нарушать порядок рендера
  if (!type || !config) {
    navigate("/individual-tailoring");
    return null;
  }

  const onSubmit = (data: Record<string, string>) => {
    Object.entries(data).forEach(([field, value]) => {
      // Игнорируем сохранение чисто информационных блоков (например, waist_definition)
      if (field === "waist_definition") return;
      dispatch(setMeasurement({ field, value: String(value) }));
    });

    // Перенаправление на страницу оформления индивидуального заказа
    navigate("/individual-tailoring/checkout");
  };

  return (
    <main className="grow pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 animate-reveal-up">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <span className="rounded-full bg-stone-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-sm border border-stone-800 mb-6 inline-block">
            Шаг 2 из 2
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-stone-900 mb-6">
            Зняття мірок: {config.label}
          </h1>
          <p className="text-base font-medium text-stone-500 leading-relaxed">
            Вкажіть ваші точні параметри, дотримуючись фото-інструкцій для
            кожної мірки
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-6xl mx-auto space-y-12 animate-reveal-up delay-100"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.fields.map((field) => {
              const measurementInfo =
                MEASUREMENTS_CATALOG[
                  field as keyof typeof MEASUREMENTS_CATALOG
                ];
              const fieldError = errors[field]?.message as string;

              // Проверяем, является ли текущая карточка информационной (без поля ввода)
              const isInfoBlock = field === "waist_definition";

              return (
                <div
                  key={field}
                  className={`${
                    isInfoBlock
                      ? "bg-stone-800 border-stone-800 text-white"
                      : "bg-white border-stone-200/60 text-stone-900"
                  } rounded-4xl p-5 border shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300 h-full`}
                >
                  <div className="aspect-4/5 w-full rounded-2xl bg-stone-50 border border-stone-100 mb-4 overflow-hidden relative flex items-center justify-center group shrink-0">
                    <img
                      src={measurementInfo.imageUrl}
                      alt={measurementInfo.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3
                    className={`${isInfoBlock ? "text-white" : "text-stone-900"} text-sm font-semibold mb-1 leading-tight`}
                  >
                    {measurementInfo.name}
                  </h3>
                  <p
                    className={`${isInfoBlock ? "text-stone-300" : "text-stone-500"} text-[11px] font-medium mb-4 overflow-y-auto max-h-24 pr-1 leading-relaxed scrollbar-thin`}
                    title={measurementInfo.description}
                  >
                    {measurementInfo.description}
                  </p>

                  {/* Отображаем поле ввода только если это не инфо-блок "линия талии" */}
                  {!isInfoBlock && (
                    <div className="relative mt-auto">
                      <input
                        {...register(field)}
                        type="number"
                        step="0.1"
                        placeholder="0"
                        className={`block w-full rounded-xl border-0 bg-stone-50 py-3 pl-4 pr-10 text-sm font-semibold text-stone-900 shadow-inner ring-1 ring-inset ${
                          fieldError ? "ring-red-500" : "ring-stone-200"
                        } focus:ring-2 focus:ring-stone-900 transition-all`}
                      />
                      <span className="absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-stone-400 pointer-events-none">
                        см
                      </span>
                    </div>
                  )}

                  {/* Информационный блок, если поле без ввода */}
                  {isInfoBlock && (
                    <div className="mt-auto bg-stone-700/50 border border-stone-600/50 rounded-xl py-3 px-4 text-center text-[11px] font-semibold text-stone-100 shadow-inner">
                      Підготовчий етап
                    </div>
                  )}

                  {fieldError && (
                    <p className="mt-1.5 text-[10px] font-medium text-red-500">
                      {fieldError}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="max-w-xl mx-auto bg-white rounded-4xl p-8 md:p-10 border border-stone-200/60 shadow-sm">
            <h2 className="text-xl font-semibold tracking-tighter text-stone-900 mb-6 text-center">
              Финальные данные
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-stone-900 mb-2 uppercase tracking-widest text-center">
                  Рост (см)
                </label>
                <input
                  type="number"
                  placeholder="Например, 170"
                  {...register("height")}
                  className={`block w-full rounded-2xl border-0 bg-stone-50 py-4 pl-5 pr-5 text-center text-base font-semibold text-stone-900 shadow-inner ring-1 ring-inset ${
                    errors.height ? "ring-red-500" : "ring-stone-200"
                  } focus:ring-2 focus:ring-stone-900 transition-all placeholder:text-stone-400`}
                />
                {errors.height && (
                  <p className="mt-1.5 text-xs font-medium text-red-500 text-center">
                    {String(errors.height.message)}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-stone-900 py-4 px-8 text-sm font-semibold text-white hover:bg-stone-800 transition-all active:scale-[0.98] shadow-lg shadow-stone-900/20 group"
              >
                Перейти к оформлению
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};
