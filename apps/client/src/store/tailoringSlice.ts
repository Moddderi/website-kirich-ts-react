import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  clampGarmentQty,
  toggleTailoringType,
  type MeasurementType,
  type MeasurementUnit,
  type TailoringProgram,
} from "@project/shared";

interface TailoringState {
  /** Garments the client wants to order (suit excludes jacket/pants) */
  types: MeasurementType[];
  /** Units per garment type (defaults to 1 when missing) */
  quantities: Partial<Record<MeasurementType, number>>;
  /** Standard (ST) or Latin (LAT) chosen per garment (pants may be LAT, body ST) */
  programs: Partial<Record<MeasurementType, TailoringProgram>>;
  measurementUnit: MeasurementUnit;
  measurements: Record<string, string>;
  comment: string;
  /** Start date picked in the calendar; null → nearest free start */
  startDate: string | null;
}

const initialState: TailoringState = {
  types: [],
  quantities: {},
  programs: {},
  measurementUnit: "cm",
  measurements: {},
  comment: "",
  startDate: null,
};

const tailoringSlice = createSlice({
  name: "tailoring",
  initialState,
  reducers: {
    toggleType: (state, action: PayloadAction<MeasurementType>) => {
      const type = action.payload;
      const wasSelected = state.types.includes(type);
      state.types = toggleTailoringType(state.types, type);
      if (wasSelected) {
        delete state.quantities[type];
      } else {
        state.quantities[type] = 1;
      }
      // Keep programs in sync with the selection (new garments default to ST).
      const next: TailoringState["programs"] = {};
      for (const t of state.types) next[t] = state.programs[t] ?? "ST";
      state.programs = next;
      const nextQty: TailoringState["quantities"] = {};
      for (const t of state.types) nextQty[t] = state.quantities[t] ?? 1;
      state.quantities = nextQty;
      // The set of required measurements changed → old values may not fit.
      state.measurements = {};
      state.measurementUnit = "cm";
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
        // Picking ST/LAT on a card also selects that garment.
        state.types = toggleTailoringType(state.types, type);
        state.quantities[type] = 1;
        state.measurements = {};
        state.measurementUnit = "cm";
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
