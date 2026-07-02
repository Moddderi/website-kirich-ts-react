import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MeasurementType, MeasurementUnit } from "@project/shared";

interface TailoringState {
  type: MeasurementType | null;
  measurementUnit: MeasurementUnit;
  measurements: Record<string, string>;
}

const initialState: TailoringState = {
  type: null,
  measurementUnit: "cm",
  measurements: {},
};

const tailoringSlice = createSlice({
  name: "tailoring",
  initialState,
  reducers: {
    setType: (state, action: PayloadAction<MeasurementType>) => {
      state.type = action.payload;
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
  },
});

export const { setType, setMeasurementUnit, setMeasurement } =
  tailoringSlice.actions;
export default tailoringSlice.reducer;
