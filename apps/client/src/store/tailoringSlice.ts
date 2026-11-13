import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  toggleTailoringType,
  type MeasurementType,
  type MeasurementUnit,
  type TailoringProgram,
} from "@project/shared";

interface TailoringState {
  /** Garments the client wants to order (suit excludes jacket/pants) */
  types: MeasurementType[];
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
      state.types = toggleTailoringType(state.types, action.payload);
      // Keep programs in sync with the selection (new garments default to ST).
      const next: TailoringState["programs"] = {};
      for (const type of state.types) next[type] = state.programs[type] ?? "ST";
      state.programs = next;
      // The set of required measurements changed → old values may not fit.
      state.measurements = {};
      state.measurementUnit = "cm";
    },
    setGarmentProgram: (
      state,
      action: PayloadAction<{ type: MeasurementType; program: TailoringProgram }>,
    ) => {
      const { type, program } = action.payload;
      if (!state.types.includes(type)) {
        // Picking ST/LAT on a card also selects that garment.
        state.types = toggleTailoringType(state.types, type);
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
  setGarmentProgram,
  setMeasurementUnit,
  setMeasurement,
  setComment,
  setStartDate,
  clearTailoring,
} = tailoringSlice.actions;
export default tailoringSlice.reducer;
