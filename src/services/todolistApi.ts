import type {
	CreateTaskPayload,
	RequestUpdate,
	Subtask,
	Task,
	TaskColumn,
	UpdatePayload
} from '@/models/todolist.model'

import { baseApi, type ApiResponse } from './baseApi'
import { waitForSocket } from '@/utils/socket-client'
import type {
	AddCommentPayload,
	AssignUsersPayload,
	TaskComment,
	TaskDetail,
	UpdateCommentPayload,
	UpdateDescriptionPayload,
	UpdateTaskDetailPayload
} from '@/models/task-detail.model'
export const taskApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getStask: builder.query<Task[], { groupId: string; milestoneId?: string }>({
			query: ({ groupId, milestoneId }) => ({
				url: `/tasks?groupId=${groupId}&milestoneId=${milestoneId}`,
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
			transformResponse: (response: ApiResponse<Task[]>) => response.data,
			providesTags: (result, _error, { groupId }) =>
				result
					? [
							...result.map((task) => ({ type: 'Task' as const, id: task._id })),
							{ type: 'TaskList', id: groupId }
						]
					: [{ type: 'TaskList', id: groupId }]
		}),
		createTask: builder.mutation<Task, CreateTaskPayload>({
			query: (payload) => ({
				url: `/tasks`,
				method: 'POST',
				body: payload
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data,
			invalidatesTags: (_r, _e, { groupId }) => [
				{ type: 'TaskList', id: groupId },
				{ type: 'Milestones', id: groupId }
			]
		}),
		updateTaskInfo: builder.mutation<Task, { taskId: string; groupId?: string; updates: RequestUpdate }>({
			query: ({ taskId, updates }) => ({
				url: `/tasks/updateInfo/${taskId}`,
				method: 'PATCH',
				body: updates
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data,
			invalidatesTags: (_r, _e, { taskId, groupId }) => [
				{ type: 'Task', id: taskId },
				{ type: 'TaskList', id: groupId }
			]
		}),
		updateTaskStatus: builder.mutation<Task, { taskId: string; groupId?: string; status: string }>({
			query: ({ taskId, status }) => ({
				url: `/tasks/updateStatus/${taskId}?status=${encodeURIComponent(status)}`,
				method: 'PATCH'
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data,
			invalidatesTags: (_r, _e, { taskId, groupId }) => [
				{ type: 'Task', id: taskId },
				{ type: 'TaskList', id: groupId },
				{ type: 'Milestones', id: groupId }
			]
		}),
		deleteTask: builder.mutation<string, { taskId: string; groupId?: string }>({
			query: ({ taskId }) => ({
				url: `/tasks/${taskId}`,
				method: 'DELETE'
			}),
			transformResponse: (response: ApiResponse<string>) => response.data,
			invalidatesTags: (_r, _e, { taskId, groupId }) => [
				{ type: 'Task', id: taskId },
				{ type: 'TaskList', id: groupId }
			]
		}),
		createSubtask: builder.mutation<Subtask, { taskId: string; columnId: string; title: string; groupId?: string }>(
			{
				query: ({ taskId, columnId, title }) => ({
					url: `/tasks/${taskId}/columns/${columnId}/subtasks`,
					method: 'POST',
					body: { title }
				}),
				transformResponse: (response: ApiResponse<Subtask>) => response.data,
				invalidatesTags: (_r, _e, { taskId, groupId }) => [
					{ type: 'Task', id: taskId },
					{ type: 'TaskDetail', id: taskId },
					{ type: 'TaskList', id: groupId },
					{ type: 'Milestones', id: groupId }
				]
			}
		),
		deleteSubtask: builder.mutation<
			Task,
			{ taskId: string; columnId: string; subtaskId: string; groupId?: string }
		>({
			query: ({ taskId, columnId, subtaskId }) => ({
				url: `/tasks/${taskId}/columns/${columnId}/subtasks/${subtaskId}`,
				method: 'DELETE'
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data,
			invalidatesTags: (_r, _e, { taskId, groupId }) => [
				{ type: 'Task', id: taskId },
				{ type: 'TaskDetail', id: taskId },
				{ type: 'TaskList', id: groupId },
				{ type: 'Milestones', id: groupId }
			]
		}),
		updateSubtask: builder.mutation<
			Task,
			{
				taskId: string
				columnId: string
				subtaskId: string
				updates: UpdatePayload
				groupId?: string
			}
		>({
			query: ({ taskId, columnId, subtaskId, updates }) => ({
				url: `/tasks/${taskId}/columns/${columnId}/subtasks/${subtaskId}`,
				method: 'PATCH',
				body: updates
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data,
			invalidatesTags: (_r, _e, { taskId, subtaskId, groupId }) => [
				{ type: 'Task', id: taskId },
				{ type: 'TaskDetail', id: taskId },
				{ type: 'SubtaskDetail', id: subtaskId },
				{ type: 'TaskList', id: groupId },
				{ type: 'Milestones', id: groupId }
			]
		}),
		toggleSubtaskComplete: builder.mutation<
			Task,
			{ taskId: string; columnId: string; subtaskId: string; groupId?: string }
		>({
			query: ({ taskId, columnId, subtaskId }) => ({
				url: `/tasks/${taskId}/columns/${columnId}/subtasks/${subtaskId}/toggle`,
				method: 'PATCH'
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data,
			invalidatesTags: (_r, _e, { taskId, groupId }) => [
				{ type: 'Task', id: taskId },
				{ type: 'TaskDetail', id: taskId },
				{ type: 'TaskList', id: groupId },
				{ type: 'Milestones', id: groupId }
			]
		}),
		updateTaskColumns: builder.mutation<Task, { taskId: string; columns: TaskColumn[] }>({
			query: ({ taskId, columns }) => ({
				url: `/tasks/${taskId}/columns`,
				method: 'PUT',
				body: columns
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data,
			invalidatesTags: (_r, _e, { taskId }) => [{ type: 'TaskDetail', id: taskId }]
		}),
		moveInColumn: builder.mutation<
			Task,
			{ taskId: string; columnId: string; oldPos: number; newPos: number; groupId?: string }
		>({
			query: ({ taskId, columnId, oldPos, newPos }) => ({
				url: `/tasks/${taskId}/columns/${columnId}/move?oldPos=${oldPos}&newPos=${newPos}`,
				method: 'PATCH'
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data,
			invalidatesTags: (_r, _e, { taskId, groupId }) => [
				{ type: 'Task', id: taskId },
				{ type: 'TaskDetail', id: taskId },
				{ type: 'TaskList', id: groupId }
			]
		}),
		moveToNewColumn: builder.mutation<
			Task,
			{
				taskId: string
				newColumnId: string
				oldColumnId: string
				newPos: number
				subTaskId: string
				groupId?: string
			}
		>({
			query: ({ taskId, newColumnId, oldColumnId, newPos, subTaskId }) => ({
				url: `/tasks/${taskId}/move`,
				method: 'PATCH',
				body: { newColumnId, oldColumnId, newPos, subTaskId }
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data,
			invalidatesTags: (_r, _e, { taskId, groupId }) => [
				{ type: 'Task', id: taskId },
				{ type: 'TaskDetail', id: taskId },
				{ type: 'TaskList', id: groupId }
			]
		}),
		updateTaskMilestone: builder.mutation<Task, { taskId: string; groupId?: string; milestoneId?: string }>({
			query: ({ taskId, milestoneId }) => ({
				url: `/tasks/${taskId}/milestone`,
				method: 'PATCH',
				body: { milestoneId: milestoneId || null }
			}),
			transformResponse: (response: ApiResponse<Task>) => response.data,
			invalidatesTags: (_result, _error, { groupId }) => [{ type: 'Milestones', id: groupId }]
		}),

		// ==================== JIRA-LIKE FEATURES ====================

		// Lấy chi tiết task
		getTaskDetail: builder.query<TaskDetail, string>({
			query: (taskId) => ({
				url: `/tasks/${taskId}/detail`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<TaskDetail>) => response.data,
			providesTags: (_result, _error, taskId) => [{ type: 'TaskDetail', id: taskId }]
		}),

		// Lấy chi tiết subtask
		getSubtaskDetail: builder.query<any, { taskId: string; columnId: string; subtaskId: string }>({
			query: ({ taskId, columnId, subtaskId }) => ({
				url: `/tasks/${taskId}/columns/${columnId}/subtasks/${subtaskId}/detail`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<any>) => response.data,
			providesTags: (_result, _error, { taskId, subtaskId }) => [
				{ type: 'TaskDetail', id: taskId },
				{ type: 'SubtaskDetail', id: subtaskId }
			]
		}),

		// Cập nhật thông tin chi tiết task
		updateTaskDetails: builder.mutation<TaskDetail, { taskId: string; updates: UpdateTaskDetailPayload }>({
			query: ({ taskId, updates }) => ({
				url: `/tasks/${taskId}/detail`,
				method: 'PATCH',
				body: updates
			}),
			transformResponse: (response: ApiResponse<TaskDetail>) => response.data,
			invalidatesTags: (_result, _error, { taskId }) => [{ type: 'TaskDetail', id: taskId }]
		}),

		// Thêm comment
		addComment: builder.mutation<TaskComment, { taskId: string; payload: AddCommentPayload }>({
			query: ({ taskId, payload }) => ({
				url: `/tasks/${taskId}/comments`,
				method: 'POST',
				body: payload
			}),
			transformResponse: (response: ApiResponse<TaskComment>) => response.data,
			invalidatesTags: (_result, _error, { taskId }) => [{ type: 'TaskDetail', id: taskId }]
		}),

		// Thêm comment với files
		addCommentWithFiles: builder.mutation<TaskComment, { taskId: string; formData: FormData }>({
			query: ({ taskId, formData }) => ({
				url: `/tasks/${taskId}/comments`,
				method: 'POST',
				body: formData
			}),
			transformResponse: (response: ApiResponse<TaskComment>) => response.data,
			invalidatesTags: (_result, _error, { taskId }) => [{ type: 'TaskDetail', id: taskId }]
		}),

		// Cập nhật comment
		updateComment: builder.mutation<void, { taskId: string; commentId: string; payload: UpdateCommentPayload }>({
			query: ({ taskId, commentId, payload }) => ({
				url: `/tasks/${taskId}/comments/${commentId}`,
				method: 'PATCH',
				body: payload
			}),
			invalidatesTags: (_result, _error, { taskId }) => [{ type: 'TaskDetail', id: taskId }]
		}),

		// Cập nhật comment với files
		updateCommentWithFiles: builder.mutation<void, { taskId: string; commentId: string; formData: FormData }>({
			query: ({ taskId, commentId, formData }) => ({
				url: `/tasks/${taskId}/comments/${commentId}`,
				method: 'PATCH',
				body: formData
			}),
			invalidatesTags: (_result, _error, { taskId }) => [{ type: 'TaskDetail', id: taskId }]
		}),

		// Xóa comment
		deleteComment: builder.mutation<void, { taskId: string; commentId: string }>({
			query: ({ taskId, commentId }) => ({
				url: `/tasks/${taskId}/comments/${commentId}`,
				method: 'DELETE'
			}),
			invalidatesTags: (_result, _error, { taskId }) => [{ type: 'TaskDetail', id: taskId }]
		}),

		// Subtask comments
		addSubtaskComment: builder.mutation<
			TaskComment,
			{ taskId: string; columnId: string; subtaskId: string; payload: AddCommentPayload }
		>({
			query: ({ taskId, columnId, subtaskId, payload }) => ({
				url: `/tasks/${taskId}/columns/${columnId}/subtasks/${subtaskId}/comments`,
				method: 'POST',
				body: payload
			}),
			invalidatesTags: (_result, _error, { taskId, subtaskId }) => [
				{ type: 'TaskDetail', id: taskId },
				{ type: 'SubtaskDetail', id: subtaskId }
			]
		}),

		addSubtaskCommentWithFiles: builder.mutation<
			TaskComment,
			{ taskId: string; columnId: string; subtaskId: string; formData: FormData }
		>({
			query: ({ taskId, columnId, subtaskId, formData }) => ({
				url: `/tasks/${taskId}/columns/${columnId}/subtasks/${subtaskId}/comments`,
				method: 'POST',
				body: formData
			}),
			invalidatesTags: (_result, _error, { taskId, subtaskId }) => [
				{ type: 'TaskDetail', id: taskId },
				{ type: 'SubtaskDetail', id: subtaskId }
			]
		}),

		updateSubtaskComment: builder.mutation<
			void,
			{ taskId: string; columnId: string; subtaskId: string; commentId: string; payload: UpdateCommentPayload }
		>({
			query: ({ taskId, columnId, subtaskId, commentId, payload }) => ({
				url: `/tasks/${taskId}/columns/${columnId}/subtasks/${subtaskId}/comments/${commentId}`,
				method: 'PATCH',
				body: payload
			}),
			invalidatesTags: (_result, _error, { taskId, subtaskId }) => [
				{ type: 'TaskDetail', id: taskId },
				{ type: 'SubtaskDetail', id: subtaskId }
			]
		}),

		updateSubtaskCommentWithFiles: builder.mutation<
			void,
			{ taskId: string; columnId: string; subtaskId: string; commentId: string; formData: FormData }
		>({
			query: ({ taskId, columnId, subtaskId, commentId, formData }) => ({
				url: `/tasks/${taskId}/columns/${columnId}/subtasks/${subtaskId}/comments/${commentId}`,
				method: 'PATCH',
				body: formData
			}),
			invalidatesTags: (_result, _error, { taskId, subtaskId }) => [
				{ type: 'TaskDetail', id: taskId },
				{ type: 'SubtaskDetail', id: subtaskId }
			]
		}),

		deleteSubtaskComment: builder.mutation<
			void,
			{ taskId: string; columnId: string; subtaskId: string; commentId: string }
		>({
			query: ({ taskId, columnId, subtaskId, commentId }) => ({
				url: `/tasks/${taskId}/columns/${columnId}/subtasks/${subtaskId}/comments/${commentId}`,
				method: 'DELETE'
			}),
			invalidatesTags: (_result, _error, { taskId, subtaskId }) => [
				{ type: 'TaskDetail', id: taskId },
				{ type: 'SubtaskDetail', id: subtaskId }
			]
		}),

		// Assign users
		assignUsers: builder.mutation<TaskDetail, { taskId: string; payload: AssignUsersPayload }>({
			query: ({ taskId, payload }) => ({
				url: `/tasks/${taskId}/assignees`,
				method: 'PATCH',
				body: payload
			}),
			transformResponse: (response: ApiResponse<TaskDetail>) => response.data,
			invalidatesTags: (_result, _error, { taskId }) => [{ type: 'TaskDetail', id: taskId }]
		}),

		// Cập nhật description
		updateDescription: builder.mutation<TaskDetail, { taskId: string; payload: UpdateDescriptionPayload }>({
			query: ({ taskId, payload }) => ({
				url: `/tasks/${taskId}/description`,
				method: 'PATCH',
				body: payload
			}),
			transformResponse: (response: ApiResponse<TaskDetail>) => response.data,
			invalidatesTags: (_result, _error, { taskId }) => [{ type: 'TaskDetail', id: taskId }]
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
	useUpdateSubtaskMutation,
	useToggleSubtaskCompleteMutation,
	useUpdateTaskColumnsMutation,
	useMoveInColumnMutation,
	useMoveToNewColumnMutation,
	useUpdateTaskStatusMutation,
	useUpdateTaskMilestoneMutation,
	// Jira-like hooks
	useGetTaskDetailQuery,
	useGetSubtaskDetailQuery,
	useUpdateTaskDetailsMutation,
	useAddCommentMutation,
	useAddCommentWithFilesMutation,
	useUpdateCommentMutation,
	useUpdateCommentWithFilesMutation,
	useDeleteCommentMutation,
	useAssignUsersMutation,
	useUpdateDescriptionMutation,
	// Subtask comment hooks
	useAddSubtaskCommentMutation,
	useAddSubtaskCommentWithFilesMutation,
	useUpdateSubtaskCommentMutation,
	useUpdateSubtaskCommentWithFilesMutation,
	useDeleteSubtaskCommentMutation
} = taskApi
