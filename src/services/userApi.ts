import type { User } from 'models'
import { baseApi } from './baseApi'

export const userApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getProfile: builder.query<User, void>({
			query: () => '/users/profile',
		})
	}),
	overrideExisting: false
})

export const { useLazyGetProfileQuery  } = userApi
