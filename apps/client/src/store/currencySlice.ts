import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Currency } from "@project/shared";

const getInitialCurrency = (): Currency => {
  const saved = localStorage.getItem("currency");
  if (saved === "UAH" || saved === "USD" || saved === "EUR") {
    return saved;
  }
  return "UAH";
};

interface CurrencyState {
  code: Currency;
}

const initialState: CurrencyState = {
  code: getInitialCurrency(),
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<Currency>) => {
      state.code = action.payload;
      localStorage.setItem("currency", action.payload);
    },
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
