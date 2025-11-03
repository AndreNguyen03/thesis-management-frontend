import { baseApi, type ApiResponse } from './baseApi'
import type { Faculty } from '@/features/admin/manage_lecturer/types'

export const facultyApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFaculties: builder.query<Faculty[], void>({
            query: () => '/faculties/all',
            transformResponse: (response: ApiResponse<Faculty[]>) => response.data
        })
    }),
    overrideExisting: false
})
export const { useGetFacultiesQuery } = facultyApi
