import { configureStore } from "@reduxjs/toolkit";
import { authApiSlice } from "./auth/authApiSlice";
import authReducer from "./auth/authSlice"
import { adminApiSlice } from "./admin/adminApiSlice";
import { roomsApiSlice } from "./rooms/roomsApiSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [authApiSlice.reducerPath]: authApiSlice.reducer,
        [adminApiSlice.reducerPath]: adminApiSlice.reducer,
        [roomsApiSlice.reducerPath]: roomsApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(authApiSlice.middleware).concat(adminApiSlice.middleware).concat(roomsApiSlice.middleware);
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;