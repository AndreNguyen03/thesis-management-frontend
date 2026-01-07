import { baseApi, type ApiResponse } from './baseApi'
import type { RecommendationResponse, RecommendationResult } from '@/models/recommend.model'

export const recommendApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		recommendTopicInPeriod: builder.query<RecommendationResponse, string>({
			query: (periodId) => {
				return {
					url: `/recommend/period/${periodId}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<RecommendationResponse>) => response.data
		})
	}),
	overrideExisting: false
})
export const { useRecommendTopicInPeriodQuery } = recommendApi
