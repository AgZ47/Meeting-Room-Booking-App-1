import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../../common/store";
import type { bookingsResponse } from "../../adminBookings/api/adminApiSlice";

export type bookingsReturnType = {
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

export type bookingsFetchType = {
    bookingId: number,
    bookingDate: string,
    startTime: string,
    endTime: string,
    status: string,
    purpose: string,
    userName: string,
    roomName: string
}

type bookingsPostType = Omit<bookingsReturnType, 'id'|'created_at'|'status'|'user_id'> & {}

type bookingsCancelType = {
    id: number,
}

export const bookingsApiSlice = createApi({
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
        getAllUserBookings: builder.query<{data: bookingsResponse[], message: string},void>({
            query: () => '/bookings/me',
        }),
        postUserBooking: builder.mutation<{data: bookingsReturnType, message: string}, bookingsPostType>({
            query: (booking) => ({
                url: '/bookings',
                method:'POST',
                body: booking,
            })
        }),
        cancelUserBooking: builder.mutation<{data: bookingsReturnType, message:string},bookingsCancelType>({
            query:(bookingId) => ({
                url: `/bookings/${bookingId.id}/cancel`,
                method:'PUT',
            })
        })
    })
})

export const { useGetAllUserBookingsQuery, usePostUserBookingMutation, useCancelUserBookingMutation } = bookingsApiSlice