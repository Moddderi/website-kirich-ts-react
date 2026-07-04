import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  cartItemId: string; // id + color + size
  productId: string;
  name: string;
  name_en?: string | null;
  price: number;
  imageUrl: string[];
  productCode?: string;
  quantity: number;
  options: {
    color: string;
    size: string;
  };
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem("cart") || "[]"),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<Omit<CartItem, "quantity" | "cartItemId">>,
    ) => {
      const { productId, options } = action.payload;
      const cartItemId = `${productId}-${options.color}-${options.size}`;

      const existingItem = state.items.find(
        (item) => item.cartItemId === cartItemId,
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, cartItemId, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ cartItemId: string; delta: number }>,
    ) => {
      const { cartItemId, delta } = action.payload;
      const item = state.items.find((item) => item.cartItemId === cartItemId);
      if (item) {
        item.quantity += delta;
        if (item.quantity < 1) item.quantity = 1;
      }
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.cartItemId !== action.payload,
      );
      localStorage.setItem("cart", JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("cart");
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
