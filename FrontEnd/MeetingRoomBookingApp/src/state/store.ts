import { configureStore } from "@reduxjs/toolkit";
import { authApiSlice } from "./auth/authApiSlice";
import authReducer from "./auth/authSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [authApiSlice.reducerPath]: authApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(authApiSlice.middleware);
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;