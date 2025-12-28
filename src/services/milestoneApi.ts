import type {
	FileInfo,
	LecturerReviewDecision,
	PaginatedTopicInBatchMilestone,
	PayloadCreateMilestone,
	PayloadFacultyCreateMilestone,
	RequestTopicInMilestoneBatchQuery,
	ResponseFacultyMilestone,
	ResponseMilestone,
	ResponseMilestoneWithTemplate,
	TopicSnaps
} from '@/models/milestone.model'
import { baseApi, type ApiResponse } from './baseApi'
import type { CreateTaskPayload, Task } from '@/models/todolist.model'
import { buildQueryString } from '@/models/query-params'
export const milestoneApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getMilestonesOfGroup: builder.query<ResponseMilestone[], { groupId: string; periodId?: string }>({
			query: ({ groupId }) => `/milestones/in-group/${groupId}`,
			transformResponse: (response: ApiResponse<ResponseMilestone[]>) => response.data,
			providesTags: (_result, _error, { groupId, periodId }) => [
				{ type: 'Milestones', id: groupId },
				{ type: 'MilestonePeriods', id: periodId }
			]
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
		facultyCreateMilestone: builder.mutation<ResponseMilestone, PayloadFacultyCreateMilestone>({
			query: (body) => ({
				url: `/milestones/faculty-create`,
				method: 'POST',
				body
			}),
			transformResponse: (response: ApiResponse<ResponseMilestone>) => response.data,
			invalidatesTags: (_result, _error, arg) => [{ type: 'Milestone-Faculty', id: arg.periodId }]
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
			invalidatesTags: (_result, _error, { milestoneId }) => [{ type: 'Milestones', id: milestoneId }]
		}),
		createTaskInMilestone: builder.mutation<Task, CreateTaskPayload>({
			query: (body) => ({
				url: `/milestones/create-task`,
				method: 'POST',
				body
			}),
			invalidatesTags: (_result, _error, arg) => [{ type: 'Milestones', id: arg.groupId }]
		}),
		getMilestonesCreatedByFacultyBoard: builder.query<ResponseFacultyMilestone[], string>({
			query: (periodId) => ({
				url: `/milestones/in-period/${periodId}/faculty-board`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<ResponseFacultyMilestone[]>) => response.data,
			providesTags: (result, error, periodId) => [{ type: 'Milestone-Faculty', id: periodId }]
		}),
		setMilestoneActive: builder.mutation<
			ResponseMilestone,
			{ milestoneId: string; isActive: boolean; groupId: string }
		>({
			query: ({ milestoneId, isActive }) => ({
				url: `/milestones/set-active/${milestoneId}?isActive=${isActive}`,
				method: 'PUT'
			}),
			transformResponse: (response: ApiResponse<ResponseMilestone>) => response.data,
			invalidatesTags: (_result, _error, { groupId }) => [{ type: 'Milestones', id: groupId }]
		}),
		facultyDownloadZipByBatchId: builder.mutation<Blob, { parentId: string }>({
			query: ({ parentId }) => ({
				url: `/milestones/${parentId}/faculty-download-zip`,
				method: 'GET',
				responseHandler: (response) => response.blob()
			})
		}),
		facultyDownloadZipByMilestoneId: builder.mutation<Blob, { milestoneId: string }>({
			query: ({ milestoneId }) => ({
				url: `/milestones/${milestoneId}/milestone-download-zip`,
				method: 'GET',
				responseHandler: (response) => response.blob()
			})
		}),
		facultyGetTopicsInBatch: builder.query<
			PaginatedTopicInBatchMilestone,
			{ parentId: string; queries: RequestTopicInMilestoneBatchQuery }
		>({
			query: ({ parentId, queries }) => {
				const queryString = buildQueryString(queries)
				return {
					url: `/milestones/topics-in-parent-milestone/${parentId}?${queryString}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<PaginatedTopicInBatchMilestone>) => response.data
		}),
		reviewMilestoneByLecturer: builder.mutation<
			{ message: string; isAbleToGotoDefense: boolean },
			{ milestoneId: string; comment: string; decision: LecturerReviewDecision }
		>({
			query: ({ milestoneId, comment, decision }) => ({
				url: `/milestones/${milestoneId}/lecturer-review`,
				method: 'PATCH',
				body: {
					comment,
					decision
				}
			}),
			transformResponse: (response: ApiResponse<{ message: string; isAbleToGotoDefense: boolean }>) =>
				response.data,
			invalidatesTags: (_result, _error, { milestoneId }) => [{ type: 'Milestones', id: milestoneId }]
		}),
		getDefenseAssignmentInPeriod: builder.query<ResponseMilestoneWithTemplate[], string>({
			query: (periodId) => ({
				url: `/milestones/in-period/manage-defense-assignment/${periodId}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<ResponseMilestoneWithTemplate[]>) => response.data,
			providesTags: (result, error, periodId) => [{ type: 'Milestones', id: periodId }]
		}),
		manageTopicsInDefenseMilestone: builder.mutation<
			{ message: string },
			{
				milestoneTemplateId: string
				action: 'add' | 'delete'
				topicSnapshots: TopicSnaps[]
			}
		>({
			query: (body) => {
				return {
					url: `/milestones/defense-milestone/manage-topics`,
					method: 'PATCH',
					body: {
						milestoneTemplateId: body.milestoneTemplateId,
						action: body.action,
						topicSnapshots: body.topicSnapshots,
					}
				}
			},
			transformResponse: (response: ApiResponse<{ message: string }>) => response.data,
			invalidatesTags: (_result, _error, arg) => [{ type: 'Milestones', id: 'defense' }]
		})
	}),
	overrideExisting: false
})
export const {
	useGetMilestonesOfGroupQuery,
	useCreateMilestoneMutation,
	useFacultyCreateMilestoneMutation,
	useUpdateMilestoneMutation,
	useSubmitReportMutation,
	useCreateTaskInMilestoneMutation,
	useGetMilestonesCreatedByFacultyBoardQuery,
	useSetMilestoneActiveMutation,
	useFacultyDownloadZipByBatchIdMutation,
	useFacultyDownloadZipByMilestoneIdMutation,
	useFacultyGetTopicsInBatchQuery,
	useReviewMilestoneByLecturerMutation,
	useGetDefenseAssignmentInPeriodQuery,
	useManageTopicsInDefenseMilestoneMutation
} = milestoneApi
