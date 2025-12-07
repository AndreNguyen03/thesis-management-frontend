import type { GetCustomMiniPeriodInfoRequestDto } from '@/models/period.model'
import { createSlice } from '@reduxjs/toolkit'
import { set } from 'zod'

interface PeriodState {
	isLoading: boolean
	currentPeriod: GetCustomMiniPeriodInfoRequestDto | null
}
const initialState: PeriodState = {
	isLoading: false,
	currentPeriod: null
}
const periodSlice = createSlice({
	name: 'period',
	initialState,
	reducers: {
		setCurrentPeriod: (state, action: { payload: GetCustomMiniPeriodInfoRequestDto }) => {
			state.currentPeriod = action.payload
		},
        setCurrPeriodLoading: (state, action: { payload: boolean }) => {
            state.isLoading = action.payload
        }
	}
})

export const { setCurrentPeriod, setCurrPeriodLoading } = periodSlice.actions

export default periodSlice
