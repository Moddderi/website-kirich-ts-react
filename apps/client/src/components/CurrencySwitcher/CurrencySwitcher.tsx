import { CURRENCIES, type Currency } from "../../utils/currency";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { setCurrency } from "../../store/currencySlice";

export const CurrencySwitcher = () => {
  const dispatch = useAppDispatch();
  const activeCurrency = useAppSelector((state) => state.currency.code);

  const handleChange = (currency: Currency) => {
    if (currency !== activeCurrency) {
      dispatch(setCurrency(currency));
    }
  };

  return (
    <div
      className="flex items-center h-7 rounded-full border border-stone-200 bg-white/60 p-0.5 transition-colors duration-300 hover:border-stone-300"
      role="group"
      aria-label="Currency"
    >
      {CURRENCIES.map((currency) => (
        <button
          key={currency}
          type="button"
          onClick={() => handleChange(currency)}
          className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 ${
            activeCurrency === currency
              ? "bg-stone-900 text-white shadow-sm"
              : "text-stone-400 hover:text-stone-600"
          }`}
        >
          {currency}
        </button>
      ))}
    </div>
  );
};
