import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type AuthState = {
    usertoken: string | null
}

const initialState: AuthState = {
    usertoken: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{
        setCredentials: (state, action:PayloadAction<{usertoken: string}>) => {
            state.usertoken = action.payload.usertoken
        },
        logout: (state) => {
            state.usertoken = null
        }
    }
})

export const {setCredentials, logout} = authSlice.actions;
export default authSlice.reducer;