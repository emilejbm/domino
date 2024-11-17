import { configureStore } from "@reduxjs/toolkit";
import gameReducers from "./redux/gameSlice";

export const store = configureStore({
  reducer: {
    game: gameReducers,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
