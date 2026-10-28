import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../../common/store";
import type { roomsType } from "../../rooms/api/roomsApiSlice";

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

export type bookingsResponse = Omit<Booking, 'room_id'|'user_id'> & {
    room_id: string,
    user_id: string
}

type GetBookingsResponse = {
  bookingData: bookingsResponse[];
  message: string;
};

type addRooms = Omit<roomsType, 'id' | 'is_active'>

type updateRoomsType = Omit<roomsType, 'is_active'>

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
        }),
        addRoom: builder.mutation<addRooms, Partial<roomsType>>({
            query: (room) => ({
                url: '/rooms',
                method: 'POST',
                body: room
            })
        }),
        updateRoom: builder.mutation<Partial<roomsType>, updateRoomsType>({
            query: (updatedRoom) => ({
                url: '/rooms',
                method: 'PUT',
                body: updatedRoom
            })
        }),
        deactivateRoom: builder.mutation<roomsType, number>({
            query: (id) => ({
                url: `/rooms/${id}`,
                method: 'DELETE'
            })
        }),
        cancelBooking: builder.mutation<Booking[], number>({
            query: (id) => ({
                url: `bookings/${id}/cancel`,
                method:'PUT'
            })
        }),
        deleteBooking: builder.mutation<Booking[], number>({
            query: (id) => ({
                url: `bookings/${id}/delete`,
                method:'DELETE'
            })
        })
    })
})

export const {useGetBookingsQuery, useUpdateBookingsMutation, useAddRoomMutation, useUpdateRoomMutation, useDeactivateRoomMutation, useCancelBookingMutation, useDeleteBookingMutation} = adminApiSlice