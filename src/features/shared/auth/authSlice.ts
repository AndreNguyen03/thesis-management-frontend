import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppUser } from 'models'

type AuthState = {
	user: AppUser | null
	status: 'idle' | 'loading' | 'succeeded' | 'failed'
	error: string | null
}

const initialState: AuthState = {
	user: null,
	status: 'idle',
	error: null
}

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setUser: (state, action: PayloadAction<AppUser>) => {
			state.user = action.payload
			state.status = 'succeeded'
			state.error = null
		},
		logout: (state) => {
			state.user = null
			state.status = 'idle'
			state.error = null
			sessionStorage.removeItem('accessToken')
			sessionStorage.removeItem('accessTokenExpiry')
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

export const { setUser, logout, setLoading, setError } = authSlice.actions
