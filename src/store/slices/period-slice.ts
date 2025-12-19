import type { GetCurrentPeriod, Period } from '@/models/period.model'
import { createSlice } from '@reduxjs/toolkit'

interface PeriodState {
	isLoading: boolean
	currentPeriods: GetCurrentPeriod[] | []
}
const initialState: PeriodState = {
	isLoading: false,
	currentPeriods: []
}
const periodSlice = createSlice({
	name: 'period',
	initialState,
	reducers: {
		setCurrentPeriods: (state, action: { payload: GetCurrentPeriod[] }) => {
			state.currentPeriods = action.payload
		},
		setCurrPeriodLoading: (state, action: { payload: boolean }) => {
			state.isLoading = action.payload
		},
        
	}
})

export const { setCurrentPeriods, setCurrPeriodLoading } = periodSlice.actions

export default periodSlice
