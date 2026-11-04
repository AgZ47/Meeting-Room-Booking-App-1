import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type AuthState = {
    usertoken: string | null,
    name: string | null,
    role: "admin" | "user" | null,
}

const initialState: AuthState = {
    usertoken: null,
    name: null,
    role: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers:{
        setCredentials: (state, action:PayloadAction<{usertoken: string, name: string, role: "admin" | "user"}>) => {
            state.usertoken = action.payload.usertoken
            state.name = action.payload.name
            state.role = action.payload.role
        },
        logout: (state) => {
            state.usertoken = null
            state.name = null
            state.role = null
        }
    }
})

export const {setCredentials, logout} = authSlice.actions;
export default authSlice.reducer;