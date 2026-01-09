import { baseApi, type ApiResponse } from './baseApi'
import type { RecommendationResultData } from '@/models/recommend.model'

export const recommendApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		recommendTopicInPeriod: builder.query<RecommendationResultData, string>({
			query: (periodId) => {
				return {
					url: `/recommend/period/${periodId}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<RecommendationResultData>) => response.data
		})
	}),
	overrideExisting: false
})
export const { useRecommendTopicInPeriodQuery } = recommendApi
