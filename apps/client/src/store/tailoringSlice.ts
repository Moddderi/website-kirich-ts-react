import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  clampGarmentQty,
  clampLineQty,
  deriveLegacyTailoringState,
  getTailoringProduct,
  toggleTailoringLine,
  toggleTailoringType,
  type MeasurementType,
  type MeasurementUnit,
  type TailoringCategory,
  type TailoringLine,
  type TailoringProgram,
} from "@project/shared";

export interface ReadyAccessoryLine {
  productId: string;
  quantity: number;
  size?: string | null;
}

interface TailoringState {
  /** UI filter only — does not limit items already in the cart. */
  browseCategory: TailoringCategory | null;
  browseProgram: TailoringProgram | null;
  lines: TailoringLine[];
  /** In-stock accessories attached to this tailoring order. */
  readyAccessories: ReadyAccessoryLine[];
  types: MeasurementType[];
  quantities: Partial<Record<MeasurementType, number>>;
  programs: Partial<Record<MeasurementType, TailoringProgram>>;
  measurementUnit: MeasurementUnit;
  measurements: Record<string, string>;
  comment: string;
  startDate: string | null;
}

const initialState: TailoringState = {
  browseCategory: null,
  browseProgram: null,
  lines: [],
  readyAccessories: [],
  types: [],
  quantities: {},
  programs: {},
  measurementUnit: "cm",
  measurements: {},
  comment: "",
  startDate: null,
};

const syncLegacy = (state: TailoringState) => {
  if (state.lines.length > 0) {
    const legacy = deriveLegacyTailoringState(state.lines);
    state.types = legacy.types;
    state.quantities = legacy.quantities;
    state.programs = legacy.programs;
  } else {
    state.types = [];
    state.quantities = {};
    state.programs = {};
  }
};

const clearMeasurements = (state: TailoringState) => {
  state.measurements = {};
  state.measurementUnit = "cm";
};

const tailoringSlice = createSlice({
  name: "tailoring",
  initialState,
  reducers: {
    setTailoringCategory: (
      state,
      action: PayloadAction<TailoringCategory>,
    ) => {
      state.browseCategory = action.payload;
    },
    setOrderProgram: (state, action: PayloadAction<TailoringProgram>) => {
      state.browseProgram = action.payload;
    },
    toggleCatalogLine: (state, action: PayloadAction<string>) => {
      state.lines = toggleTailoringLine(state.lines, action.payload);
      syncLegacy(state);
      clearMeasurements(state);
    },
    setReadyAccessoryQuantity: (
      state,
      action: PayloadAction<{
        productId: string;
        quantity: number;
        size?: string | null;
      }>,
    ) => {
      const productId = action.payload.productId;
      const size = action.payload.size?.trim() || null;
      const quantity = Math.min(
        5,
        Math.max(0, Math.floor(action.payload.quantity) || 0),
      );
      const idx = state.readyAccessories.findIndex(
        (line) => line.productId === productId && (line.size ?? null) === size,
      );
      if (quantity < 1) {
        if (idx >= 0) state.readyAccessories.splice(idx, 1);
        return;
      }
      if (idx >= 0) state.readyAccessories[idx].quantity = quantity;
      else state.readyAccessories.push({ productId, quantity, size });
    },
    setCatalogLineQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const { productId, quantity } = action.payload;
      const idx = state.lines.findIndex((l) => l.productId === productId);
      if (idx < 0) return;
      const catalogProduct = getTailoringProduct(productId);
      state.lines[idx].quantity =
        catalogProduct?.isKit ? 1 : clampLineQty(quantity);
      syncLegacy(state);
    },
    toggleType: (state, action: PayloadAction<MeasurementType>) => {
      const type = action.payload;
      const wasSelected = state.types.includes(type);
      state.types = toggleTailoringType(state.types, type);
      if (wasSelected) {
        delete state.quantities[type];
      } else {
        state.quantities[type] = 1;
      }
      const next: TailoringState["programs"] = {};
      for (const t of state.types) next[t] = state.programs[t] ?? "ST";
      state.programs = next;
      const nextQty: TailoringState["quantities"] = {};
      for (const t of state.types) nextQty[t] = state.quantities[t] ?? 1;
      state.quantities = nextQty;
      clearMeasurements(state);
    },
    setGarmentQuantity: (
      state,
      action: PayloadAction<{ type: MeasurementType; quantity: number }>,
    ) => {
      const { type, quantity } = action.payload;
      if (!state.types.includes(type) || type === "suit") return;
      state.quantities[type] = clampGarmentQty(quantity);
    },
    setGarmentProgram: (
      state,
      action: PayloadAction<{ type: MeasurementType; program: TailoringProgram }>,
    ) => {
      const { type, program } = action.payload;
      if (!state.types.includes(type)) {
        state.types = toggleTailoringType(state.types, type);
        state.quantities[type] = 1;
        clearMeasurements(state);
        const next: TailoringState["programs"] = {};
        for (const t of state.types) next[t] = state.programs[t] ?? "ST";
        state.programs = next;
      }
      state.programs[type] = program;
    },
    setMeasurementUnit: (state, action: PayloadAction<MeasurementUnit>) => {
      state.measurementUnit = action.payload;
      state.measurements = {};
    },
    setMeasurement: (
      state,
      action: PayloadAction<{ field: string; value: string }>,
    ) => {
      state.measurements[action.payload.field] = action.payload.value;
    },
    setStartDate: (state, action: PayloadAction<string | null>) => {
      state.startDate = action.payload;
    },
    setComment: (state, action: PayloadAction<string>) => {
      state.comment = action.payload;
    },
    clearTailoring: () => initialState,
  },
});

export const {
  setTailoringCategory,
  setOrderProgram,
  toggleCatalogLine,
  setReadyAccessoryQuantity,
  setCatalogLineQuantity,
  toggleType,
  setGarmentQuantity,
  setGarmentProgram,
  setMeasurementUnit,
  setMeasurement,
  setComment,
  setStartDate,
  clearTailoring,
} = tailoringSlice.actions;
export default tailoringSlice.reducer;