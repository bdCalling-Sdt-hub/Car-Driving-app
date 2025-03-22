import { api } from "./baseApi";
import { configureStore } from "@reduxjs/toolkit";
import useTokenReducer from "./features/users/UserTokenSlice";
import userReducer from "./features/users/UserApi";


const store = configureStore({
  reducer: {
    UserAccessToken: useTokenReducer,
    user: userReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export default store;