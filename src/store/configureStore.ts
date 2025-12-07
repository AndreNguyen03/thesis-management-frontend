import { authSlice } from '@/features/shared/auth'
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import { baseApi } from '@/services/baseApi'
import periodSlice from './slices/period-slice'
import { socketMiddleware } from './middleware/socketMiddleware'
import socketSlice from './slices/socket-slice'
import notificationSlice from './slices/notification-slice'

export const store = configureStore({
	reducer: {
		[baseApi.reducerPath]: baseApi.reducer,
		socket: socketSlice.reducer,
		period: periodSlice.reducer,
		auth: authSlice.reducer,
		notification: notificationSlice.reducer
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware, socketMiddleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
