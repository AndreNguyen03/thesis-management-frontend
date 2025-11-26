import type { RenameFilesBody } from '@/models/file.model'
import { baseApi, type ApiResponse } from './baseApi'

export const uploadFilesApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		renameFiles: builder.mutation<{ message: string }, RenameFilesBody[]>({
			query: (body: RenameFilesBody[]) => ({
				url: `/upload-files/rename-many-files`,
				method: 'PATCH',
				body: body
			})
		})
	}),
	overrideExisting: false
})
export const { useRenameFilesMutation } = uploadFilesApi
