import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

// Типизация для хуков, чтобы TypeScript всё понимал автоматически
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
