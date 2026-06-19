import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface TailoringState {
  type: "top" | "bottom" | "set" | null;
  measurements: Record<string, string>;
}

const initialState: TailoringState = {
  type: null,
  measurements: {},
};

const tailoringSlice = createSlice({
  name: "tailoring",
  initialState,
  reducers: {
    setType: (state, action: PayloadAction<"top" | "bottom" | "set">) => {
      state.type = action.payload;
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

export const { setType, setMeasurement } = tailoringSlice.actions;
export default tailoringSlice.reducer;
