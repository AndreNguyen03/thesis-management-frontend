import type { GroupSidebar } from '@/models/groups.model'
import { createSlice } from '@reduxjs/toolkit'

interface GroupState {
	activeGroup: GroupSidebar | null
}
const initialState: GroupState = {
	activeGroup: null
}
const groupSlice = createSlice({
	name: 'group',
	initialState,
	reducers: {
		setActiveGroup: (state, action: { payload: GroupSidebar | null }) => {
			state.activeGroup = action.payload
		}
	}
})

export const { setActiveGroup } = groupSlice.actions

export default groupSlice
