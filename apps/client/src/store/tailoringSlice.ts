import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  toggleTailoringType,
  type MeasurementType,
  type MeasurementUnit,
} from "@project/shared";

interface TailoringState {
  /** Garments the client wants to order (suit excludes jacket/pants) */
  types: MeasurementType[];
  measurementUnit: MeasurementUnit;
  measurements: Record<string, string>;
  comment: string;
}

const initialState: TailoringState = {
  types: [],
  measurementUnit: "cm",
  measurements: {},
  comment: "",
};

const tailoringSlice = createSlice({
  name: "tailoring",
  initialState,
  reducers: {
    toggleType: (state, action: PayloadAction<MeasurementType>) => {
      state.types = toggleTailoringType(state.types, action.payload);
      // The set of required measurements changed → old values may not fit.
      state.measurements = {};
      state.measurementUnit = "cm";
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
    setComment: (state, action: PayloadAction<string>) => {
      state.comment = action.payload;
    },
    clearTailoring: () => initialState,
  },
});

export const {
  toggleType,
  setMeasurementUnit,
  setMeasurement,
  setComment,
  clearTailoring,
} = tailoringSlice.actions;
export default tailoringSlice.reducer;
