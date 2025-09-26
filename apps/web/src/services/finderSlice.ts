import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const finderSlice = createSlice({
  name: "finder",
  initialState: { searchString: "" },
  reducers: {
    setSearchString: (state, searchString: PayloadAction<string>) => ({
      ...state,
      searchString: searchString.payload ?? "",
    }),
  },
});

export const { setSearchString } = finderSlice.actions;
export const finderReducer = finderSlice.reducer;
