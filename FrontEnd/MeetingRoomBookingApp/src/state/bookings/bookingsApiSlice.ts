import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";


export type bookingsFetchType = {
    id: number,
    room_id: number,
    user_id: number,
    booking_date: string,
    start_time: string,
    end_time: string,
    purpose: string,
    status: string,
    created_at: string,
}

export type bookingsPostType = Omit<bookingsFetchType, 'id'|'created_at'> & {}

export type bookingsCancelType = {
    id: number,
}

const bookingsApiSlice = createApi({
    reducerPath:"bookingsapi",
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3000',
        prepareHeaders: (headers, {getState}) => {
            const token = (getState() as RootState).auth.usertoken
            if(token){
                headers.set('Authorization',`Bearer ${token}`);
            }
            return headers;
        }
    }),
    endpoints: (builder) => ({
        getAllUserBookings: builder.query<{data: bookingsFetchType[], message: string},void>({
            query: () => '/bookings/me',
        }),
        postUserBooking: builder.mutation<{data: bookingsFetchType, message: string}, bookingsPostType>({
            query: (booking) => ({
                url: '/bookings',
                method:'POST',
                body: booking,
            })
        }),
        cancelUserBooking: builder.mutation<{data: bookingsFetchType, message:string},bookingsCancelType>({
            query:(bookingId) => ({
                url: `/bookings/${bookingId.id}`,
                method:'PUT',
            })
        })
    })
})