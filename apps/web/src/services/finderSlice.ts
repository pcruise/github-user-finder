import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const finderSlice = createSlice({
  name: "finder",
  initialState: { searchString: "", sort: "default", filter: "" },
  // immer 적용되어있는 부분
  reducers: {
    setSearchString: (state, action: PayloadAction<string>) => {
      state.searchString = action.payload ?? "";
    },
    setSortOption: (state, action: PayloadAction<string>) => {
      state.sort = action.payload ?? "default";
    },
    setFilterOption: (state, action: PayloadAction<string>) => {
      state.filter = action.payload ?? "";
    },
  },
});

export const { setSearchString, setSortOption, setFilterOption } =
  finderSlice.actions;
export const finderReducer = finderSlice.reducer;
