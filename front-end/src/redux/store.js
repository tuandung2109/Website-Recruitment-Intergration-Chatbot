import { configureStore } from "@reduxjs/toolkit";
import systemInfoReducer from "../reducers/systemInfoReducer"; // hoặc đúng tên reducer bạn có

const store = configureStore({
  reducer: {
    systemInfoReducer,
  },
});

export default store;
