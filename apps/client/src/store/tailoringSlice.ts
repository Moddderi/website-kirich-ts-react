import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MeasurementType } from "@project/shared";

interface TailoringState {
  // Разрешаем любой из 4 актуальных типов индивидуального пошива
  type: MeasurementType | null;
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
    // Принимаем MeasurementType вместо устаревших строк
    setType: (state, action: PayloadAction<MeasurementType>) => {
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
