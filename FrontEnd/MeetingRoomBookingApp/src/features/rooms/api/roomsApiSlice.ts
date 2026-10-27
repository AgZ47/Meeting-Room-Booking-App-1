import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../../common/store";

export type roomsType = {
    id: number,
    name: string,
    capacity: number,
    floor: number,
    facilities: string[], 
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
        getFilteredRooms: builder.query<{roomData: roomsType[], message: string},boolean>({
            query: (values) => `/rooms/${values}` 
        })
    })
})

export const {useGetAllRoomsQuery, useGetFilteredRoomsQuery} = roomsApiSlice