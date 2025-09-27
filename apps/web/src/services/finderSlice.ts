import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const finderSlice = createSlice({
  name: "finder",
  initialState: { searchString: "", sort: "default", filter: "" },
  reducers: {
    setSearchString: (state, searchString: PayloadAction<string>) => ({
      ...state,
      searchString: searchString.payload ?? "",
    }),
    setSortOption: (state, sortOption: PayloadAction<string>) => ({
      ...state,
      sort: sortOption.payload ?? "default",
    }),
    setFilterOption: (state, filter: PayloadAction<string>) => ({
      ...state,
      filter: filter.payload ?? "",
    }),
  },
});

export const { setSearchString, setSortOption, setFilterOption } =
  finderSlice.actions;
export const finderReducer = finderSlice.reducer;
