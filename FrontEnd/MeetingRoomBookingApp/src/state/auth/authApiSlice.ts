import { createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'

export const authApiSlice = createApi({
    reducerPath: "authapi",
    baseQuery: fetchBaseQuery({
        baseUrl:"http://localhost:3000/auth",
    }),
    endpoints:(builder) => ({ loginUser: builder.mutation<{ usertoken: string, message: string }, { email: string; password_hash: string }>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginUserMutation } = authApiSlice;