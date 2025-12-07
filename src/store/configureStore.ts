import { authSlice } from '@/features/shared/auth'
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import { baseApi } from '@/services/baseApi'
import periodSlice from './slices/periodSlice'
import { uploadApi } from '@/services/uploadAvatarApi'

export const store = configureStore({
	reducer: {
		[baseApi.reducerPath]: baseApi.reducer,
		[uploadApi.reducerPath]: uploadApi.reducer,
		period: periodSlice.reducer,
		auth: authSlice.reducer
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware).concat(uploadApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
