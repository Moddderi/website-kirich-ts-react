import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import tailoringReducer from "./tailoringSlice";
import favoritesReducer from "./favoriteSlice";
import currencyReducer from "./currencySlice";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    tailoring: tailoringReducer,
    favorites: favoritesReducer,
    currency: currencyReducer,
  },
});

// Типизация для хуков, чтобы TypeScript всё понимал автоматически
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
