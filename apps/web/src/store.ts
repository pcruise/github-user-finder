import { githubUserFindApi } from "@/services/githubUserFindApi";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { finderReducer } from "./services/finderSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      finder: finderReducer,
      [githubUserFindApi.reducerPath]: githubUserFindApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(githubUserFindApi.middleware),
    // preloadedState: {}
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type RootState = ReturnType<ReturnType<typeof makeStore>["getState"]>;
