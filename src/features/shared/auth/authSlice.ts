import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from 'models'

type AuthState = {
	user: User | null
	accessToken: string | null
	status: 'idle' | 'loading' | 'succeeded' | 'failed'
	error: string | null
}

const inititalState: AuthState = {
	user: null,
	accessToken: null,
	status: 'idle',
	error: null
}

export const authSlice = createSlice({
	name: 'auth',
	initialState: inititalState,
	reducers: {
		setCredentials: (state, action: PayloadAction<{ accessToken: string }>) => {
			state.accessToken = action.payload.accessToken
			state.status = 'succeeded'
			state.error = null
		},
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload
		},
		logout: (state) => {
			state.user = null
			state.accessToken = null
			state.status = 'idle'
			state.error = null
		},
		setLoading: (state) => {
			state.status = 'loading'
		},
		setError: (state, action: PayloadAction<string>) => {
			state.status = 'failed'
			state.error = action.payload
		}
	}
})

export const { setCredentials, logout, setLoading, setError, setUser } = authSlice.actions
