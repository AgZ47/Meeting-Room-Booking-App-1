import { configureStore } from "@reduxjs/toolkit";
import { authApiSlice } from "../features/auth/api/authApiSlice";
import authReducer from "../features/auth/api/authSlice"
import { adminApiSlice } from "../features/adminBookings/api/adminApiSlice";
import { roomsApiSlice } from "../features/rooms/api/roomsApiSlice";
import { bookingsApiSlice } from "../features/bookings/api/bookingsApiSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [authApiSlice.reducerPath]: authApiSlice.reducer,
        [adminApiSlice.reducerPath]: adminApiSlice.reducer,
        [roomsApiSlice.reducerPath]: roomsApiSlice.reducer,
        [bookingsApiSlice.reducerPath]: bookingsApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(authApiSlice.middleware).concat(adminApiSlice.middleware).concat(roomsApiSlice.middleware).concat(bookingsApiSlice.middleware);
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;