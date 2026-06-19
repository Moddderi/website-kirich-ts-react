import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@project/shared"; // Импортируй свой тип Product из файла со схемами Zod

interface FavoritesState {
  items: Product[];
}

const initialState: FavoritesState = {
  items: [],
};

export const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<Product>) => {
      const exists = state.items.find((item) => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    toggleFavorite: (state, action: PayloadAction<Product>) => {
      const exists = state.items.find((item) => item.id === action.payload.id);
      if (exists) {
        state.items = state.items.filter(
          (item) => item.id !== action.payload.id,
        );
      } else {
        state.items.push(action.payload);
      }
    },
    clearFavorites: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  clearFavorites,
} = favoritesSlice.actions;

// Селектор для получения списка избранного
export const selectFavoriteItems = (state: { favorites: FavoritesState }) =>
  state.favorites.items;

// Селектор для проверки, находится ли товар в избранном по его ID
export const selectIsFavorite =
  (id: number) => (state: { favorites: FavoritesState }) =>
    state.favorites.items.some((item) => item.id === id);

export default favoritesSlice.reducer;
