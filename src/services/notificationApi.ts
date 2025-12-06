import type { SendRemainIssueNoti } from '@/models/period.model'
import { baseApi } from './baseApi'

export const periodApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		sendRemainIssueNoti: builder.mutation<void, SendRemainIssueNoti>({
			query: (data) => ({
				url: 'notification/remain-issue',
				method: 'POST',
				body: data
			})
		})
	})
})

export const { useSendRemainIssueNotiMutation } = periodApi
