import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

type Booking = {
  id: number;
  room_id: number;
  user_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: string;
  created_at: string;
};

type GetBookingsResponse = {
  bookingData: Booking[];
  message: string;
};

export const adminApiSlice = createApi({
    reducerPath: 'adminapi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3000/admin',
        prepareHeaders: (headers, {getState}) => {
            const token = (getState() as RootState).auth.usertoken;

            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            return headers;
        }
    }),
    endpoints: (builder) => ({
        getBookings: builder.query<GetBookingsResponse, void>({
            query: () => '/bookings',
        }),
        updateBookings: builder.mutation<Booking, Booking>({
            query: (updatedVals) => ({
                url: '/bookings',
                method: 'PUT',
                body: updatedVals
            })
        })
    })
})

export const {useGetBookingsQuery, useUpdateBookingsMutation} = adminApiSlice