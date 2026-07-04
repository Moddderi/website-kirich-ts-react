import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaPenRuler } from "react-icons/fa6";

export const IndividualTailoringPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="w-full flex flex-col items-center p-2">
      {/* Основная карточка с анимацией появления */}
      <div className="relative w-full max-w-2xl bg-stone-950 text-white rounded-[2rem] border border-stone-800 shadow-2xl flex flex-col p-8 sm:p-12 cursor-default overflow-hidden animate-reveal-up">
        {/* Декоративные элементы */}
        <div className="absolute inset-0 bg-grid-pattern-dark mask-image:linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent) pointer-events-none"></div>
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-gradient-to-bl from-beige-300/10 to-transparent blur-[80px] animate-pulse-glow pointer-events-none"></div>

        <div className="relative z-20 flex flex-col h-full">
          {/* Заголовок с задержкой */}
          <div className="flex items-center gap-3 mb-10 animate-reveal-up [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <FaPenRuler size={16} />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                {t("individualTailoring.howItWorks")}
              </h2>
              <p className="text-xs font-medium text-stone-400 mt-1">
                {t("individualTailoring.processDescription")}
              </p>
            </div>
          </div>

          {/* Контентная часть (Шаги) */}
          <div className="flex-grow flex flex-col justify-center space-y-8 py-2">
            {[
              {
                id: 1,
                title: t("individualTailoring.step1Title"),
                desc: t("individualTailoring.step1Desc"),
              },
              {
                id: 2,
                title: t("individualTailoring.step2Title"),
                desc: t("individualTailoring.step2Desc"),
              },
              {
                id: 3,
                title: t("individualTailoring.step3Title"),
                desc: t("individualTailoring.step3Desc"),
              },
            ].map((step, idx) => (
              <div
                key={step.id}
                className="flex gap-6 items-start group/step animate-reveal-up opacity-0 [animation-fill-mode:forwards]"
                style={{ animationDelay: `${300 + idx * 100}ms` }}
              >
                <div className="flex flex-col items-center mt-1">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs font-semibold text-stone-300">
                    {step.id}
                  </span>
                  {step.id !== 3 && (
                    <div className="h-12 w-px bg-white/10 mt-2"></div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">
                    {step.title}
                  </h4>
                  <p className="text-sm font-medium text-stone-400 leading-relaxed max-w-xl">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Кнопка действия */}
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 animate-reveal-up [animation-delay:600ms] opacity-0 [animation-fill-mode:forwards]">
            <button
              onClick={() => navigate("/individual-tailoring/step-1")}
              className="flex-1 rounded-xl bg-white px-6 py-4 text-sm font-semibold text-stone-900 hover:scale-[1.02] transition-transform duration-300 text-center"
            >
              {t("individualTailoring.bookStudio")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
