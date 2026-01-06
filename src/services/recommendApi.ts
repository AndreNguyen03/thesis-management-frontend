import { baseApi, type ApiResponse } from './baseApi'
import type { RecommendationResult } from '@/models/recommend.model'

export const recommendApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		recommendTopicInPeriod: builder.query<RecommendationResult[], string>({
			query: (periodId) => {
				return {
					url: `/recommend/period/${periodId}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<RecommendationResult[]>) => response.data
		})
	}),
	overrideExisting: false
})
export const { useRecommendTopicInPeriodQuery } = recommendApi
