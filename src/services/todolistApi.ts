import type { CreateTaskPayload, RequestUpdate, Subtask, Task, TaskColumn } from '@/models/todolist.model'
import { baseApi, type ApiResponse } from './baseApi'
import { waitForSocket } from '@/utils/socket-client'
export const taskApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getStask: builder.query<Task[], { groupId: string }>({
			query: ({ groupId }) => ({
				url: `/tasks?groupId=${groupId}`,
				method: 'GET'
			}),
			async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
				try {
					await cacheDataLoaded

					const socket = await waitForSocket()
					if (!socket) return

					const listener = (newTask: Task) => {
						updateCachedData((draft) => {
							draft.unshift(newTask)
						})
					}
					// 4. Bắt đầu lắng nghe
					socket.on('task:new', listener)
					// 5. Dọn dẹp: Khi user chuyển trang khác, tắt lắng nghe để tránh memory leak
					await cacheEntryRemoved
					socket.off('task:new', listener)
				} catch (err) {
					console.error('Socket error in RTK Query:', err)
				}
			},
			transformResponse: (response: ApiResponse<Task[]>) => response.data
		}),
		createTask: builder.mutation<Task, CreateTaskPayload>({
			query: (payload) => ({
				url: `/tasks`,
				method: 'POST',
				body: payload
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data
		}),
		updateTaskInfo: builder.mutation<Task, { taskId: string; updates: RequestUpdate }>({
			query: ({ taskId, updates }) => ({
				url: `/tasks/updateInfo/${taskId}`,
				method: 'PATCH',
				body: updates
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data
		}),
		deleteTask: builder.mutation<string, string>({
			query: (taskId) => ({
				url: `/tasks/${taskId}`,
				method: 'DELETE'
			}),
			transformResponse: (response: ApiResponse<string>) => response.data
		}),
		createSubtask: builder.mutation<Subtask, { taskId: string; columnId: string; title: string }>({
			query: ({ taskId, columnId, title }) => ({
				url: `/tasks/${taskId}/columns/${columnId}/subtasks`,
				method: 'POST',
				body: { title }
			}),
			transformResponse: (response: ApiResponse<Subtask>) => response.data
		}),
		deleteSubtask: builder.mutation<Task, { taskId: string; columnId: string; subtaskId: string }>({
			query: ({ taskId, columnId, subtaskId }) => ({
				url: `/tasks/${taskId}/columns/${columnId}/subtasks/${subtaskId}`,
				method: 'DELETE'
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data
		}),
		updateTaskColumns: builder.mutation<Task, { taskId: string; columns: TaskColumn[] }>({
			query: ({ taskId, columns }) => ({
				url: `/tasks/${taskId}/columns`,
				method: 'PUT',
				body: columns
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data
		}),
		moveInColumn: builder.mutation<Task, { taskId: string; columnId: string; oldPos: number; newPos: number }>({
			query: ({ taskId, columnId, oldPos, newPos }) => ({
				url: `/tasks/${taskId}/columns/${columnId}/move?oldPos=${oldPos}&newPos=${newPos}`,
				method: 'PATCH'
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data
		}),
		moveToNewColumn: builder.mutation<
			Task,
			{ taskId: string; newColumnId: string; oldColumnId: string; newPos: number; subTaskId: string }
		>({
			query: ({ taskId, newColumnId, oldColumnId, newPos, subTaskId }) => ({
				url: `/tasks/${taskId}/move`,
				method: 'PATCH',
				body: { newColumnId, oldColumnId, newPos, subTaskId }
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data
		})
	})
})

export const {
	useGetStaskQuery,
	useCreateTaskMutation,
	useUpdateTaskInfoMutation,
	useDeleteTaskMutation,
	useCreateSubtaskMutation,
	useDeleteSubtaskMutation,
	useUpdateTaskColumnsMutation,
	useMoveInColumnMutation,
	useMoveToNewColumnMutation
} = taskApi
