import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../store/store";
import { setMeasurement } from "../../store/tailoringSlice";
import {
  MEASUREMENT_CONFIG,
  getMeasurementSchema,
  type MeasurementType,
} from "@project/shared";

export const MeasurementsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { type, measurements } = useSelector(
    (state: RootState) => state.tailoring,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: type
      ? zodResolver(getMeasurementSchema(type as MeasurementType))
      : undefined,
    defaultValues: measurements,
  });

  if (!type) {
    navigate("/individual-tailoring");
    return null;
  }

  const config = MEASUREMENT_CONFIG[type as MeasurementType];

  const onSubmit = (data: Record<string, string>) => {
    Object.entries(data).forEach(([field, value]) => {
      dispatch(setMeasurement({ field, value }));
    });
    navigate("/individual-tailoring/step-3");
  };

  return (
    <main className="flex-grow pb-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 lg: animate-reveal-up">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <span className="rounded-full bg-stone-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white shadow-sm border border-stone-800 mb-6 inline-block">
            Шаг 2 из 3
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-stone-900 mb-6">
            Снятие мерок: {config.label}
          </h1>
          <p className="text-base font-medium text-stone-500 leading-relaxed">
            Укажите ваши точные параметры, следуя фото-инструкциям для каждой
            мерки.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-6xl mx-auto space-y-12 animate-reveal-up delay-100"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.fields.map((field) => (
              <div
                key={field}
                className="bg-white rounded-[2rem] p-5 border border-stone-200/60 shadow-sm flex flex-col hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="aspect-[4/5] w-full rounded-2xl bg-stone-50 border border-stone-100 mb-4 overflow-hidden relative flex items-center justify-center group">
                  <img
                    src={`https://placehold.co/400x500/F7F3EB/1C1917?text=${field}`}
                    alt={field}
                    className="object-cover w-full h-full opacity-60 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-sm font-semibold text-stone-900 mb-1 capitalize">
                  {field}
                </h3>
                <p className="text-[11px] font-medium text-stone-500 mb-4 flex-grow leading-relaxed">
                  Введите точное значение в сантиметрах.
                </p>
                <div className="relative mt-auto">
                  <input
                    {...register(field)}
                    type="number"
                    placeholder="0"
                    className={`block w-full rounded-xl border-0 bg-stone-50 py-3 pl-4 pr-10 text-sm font-semibold text-stone-900 shadow-inner ring-1 ring-inset ${errors[field] ? "ring-red-500" : "ring-stone-200"} focus:ring-2 focus:ring-stone-900 transition-all`}
                  />
                  <span className="absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-stone-400 pointer-events-none">
                    см
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-xl mx-auto bg-white rounded-[2rem] p-8 md:p-10 border border-stone-200/60 shadow-sm">
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
                  className="block w-full rounded-2xl border-0 bg-stone-50 py-4 pl-5 pr-5 text-center text-base font-semibold text-stone-900 shadow-inner ring-1 ring-inset ring-stone-200 focus:ring-2 focus:ring-stone-900 transition-all placeholder:text-stone-400"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-stone-900 py-4 px-8 text-sm font-semibold text-white hover:bg-stone-800 transition-all active:scale-[0.98] shadow-lg shadow-stone-900/20 group"
              >
                Отправить мерки
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};
