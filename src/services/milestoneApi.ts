import type { FileInfo, PayloadCreateMilestone, ResponseMilestone } from '@/models/milestone.model'
import { baseApi, type ApiResponse } from './baseApi'
import type { CreateTaskPayload, Task } from '@/models/todolist.model'
export const milestoneApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getMilestonesOfGroup: builder.query<ResponseMilestone[], { groupId: string }>({
			query: ({ groupId }) => `/milestones/in-group/${groupId}`,
			transformResponse: (response: ApiResponse<ResponseMilestone[]>) => response.data,
			providesTags: (_result, _error, { groupId }) => [{ type: 'Milestones', id: groupId }]
		}),
		createMilestone: builder.mutation<ResponseMilestone, PayloadCreateMilestone>({
			query: (body) => ({
				url: `/milestones`,
				method: 'POST',
				body
			}),
			transformResponse: (response: ApiResponse<ResponseMilestone>) => response.data,
			invalidatesTags: (_result, _error, arg) => [{ type: 'Milestones', id: arg.groupId }]
		}),
		updateMilestone: builder.mutation<any, { milestoneId: string; groupId: string; body: any; files?: File[] }>({
			query: ({ milestoneId, body, files }) => {
				const formData = new FormData()
				if (files && files.length > 0) {
					files.forEach((file) => formData.append('files', file))
				}
				Object.keys(body).forEach((key) => {
					const value = body[key]
					if (value !== undefined && value !== null) {
						formData.append(key, value)
					}
				})
				return {
					url: `/milestones/${milestoneId}`,
					method: 'PUT',
					body: formData
				}
			},
			invalidatesTags: (_result, _error, { groupId }) => [{ type: 'Milestones', id: groupId }]
		}),
		submitReport: builder.mutation<FileInfo, { milestoneId: string; groupId: string; files: File[] }>({
			query: ({ milestoneId, files }) => {
				const formData = new FormData()
				files.forEach((file) => formData.append('files', file))
				return {
					url: `/milestones/${milestoneId}/submit`,
					method: 'POST',
					body: formData
				}
			},
			transformResponse: (response: ApiResponse<FileInfo>) => response.data,
			invalidatesTags: (_result, _error, { groupId }) => [{ type: 'Milestones', id: groupId }]
		}),
		createTaskInMilestone: builder.mutation<Task, CreateTaskPayload>({
			query: (body) => ({
				url: `/milestones/create-task`,
				method: 'POST',
				body
			}),
			invalidatesTags: (_result, _error, arg) => [{ type: 'Milestones', id: arg.groupId }]
		})
	}),
	overrideExisting: false
})
export const {
	useGetMilestonesOfGroupQuery,
	useCreateMilestoneMutation,
	useUpdateMilestoneMutation,
	useSubmitReportMutation,
	useCreateTaskInMilestoneMutation
} = milestoneApi
