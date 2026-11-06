import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../../common/store";

export type roomsType = {
    id: number,
    name: string,
    capacity: number,
    floor: number,
    facilities: {id: number, name:string}[], 
    is_active: boolean,
}

export const roomsApiSlice = createApi({
    reducerPath: 'roomsapi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3000',
        prepareHeaders: (headers, {getState}) => {
            const token = (getState() as RootState).auth.usertoken
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    endpoints: (builder) => ({
        getAllRooms: builder.query<{roomData: roomsType[], message: string},void>({
            query: () => '/rooms'
        }),
        getRoomsByAvailability: builder.query<{roomData: {room_id: number, room_name: string, room_is_active: boolean, room_availability: string}[], message: string}, {date: string, start_time: string, end_time: string}>({
            query: (values) => `/rooms/availability?date=${values.date}&start_time=${values.start_time}&end_time=${values.end_time}`
        }),
        getFilteredRooms: builder.query<{roomData: roomsType[], message: string},boolean>({
            query: (values) => `/rooms/${values}` 
        })
    })
})

export const {useGetAllRoomsQuery, useGetFilteredRoomsQuery, useLazyGetRoomsByAvailabilityQuery} = roomsApiSlice