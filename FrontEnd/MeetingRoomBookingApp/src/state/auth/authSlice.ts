import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type AuthState = {
    usertoken: string | null,
    message: string | null
}

const initialState: AuthState = {
    usertoken: null,
    message: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{
        setCredentials: (state, action:PayloadAction<{usertoken: string, message:string}>) => {
            state.usertoken = action.payload.usertoken
            state.message = action.payload.message
        },
        logout: (state) => {
            state.usertoken = null
            state.message = null
        }
    }
})

export const {setCredentials, logout} = authSlice.actions;
export default authSlice.reducer;