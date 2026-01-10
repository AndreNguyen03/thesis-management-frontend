import type { CreateRatingPayload, Rating, RatingDetail } from '@/models/rating.model'
import { baseApi, type ApiResponse } from './baseApi'

export const ratingApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		createOrUpdateRating: builder.mutation<any, { data: CreateRatingPayload }>({
			query: ({ data }) => ({
				url: `/ratings`,
				method: 'POST',
				body: data
			}),
			invalidatesTags: (result, error, { data }) => [{ type: 'TopicRatingStats', id: data.topicId }]
		}),
		getTopicStats: builder.query<Rating, string>({
			query: (topicId: string) => ({
				url: `/ratings/topic/${topicId}/stats`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<Rating>) => response.data,
			providesTags: (result, error, topicId) => [{ type: 'TopicRatingStats', id: topicId }]
		}),
		getMyRating: builder.query<RatingDetail, string>({
			query: (topicId: string) => ({
				url: `/ratings/my-rating/${topicId}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<RatingDetail>) => response.data,
			// Fix: Use providesTags instead of invalidatesTags for queries
			providesTags: (_result, _error, topicId: string) => [{ type: 'TopicRatingStats', id: topicId }]
		})
	}),
	overrideExisting: false
})
export const { useCreateOrUpdateRatingMutation, useGetTopicStatsQuery, useGetMyRatingQuery } = ratingApi
