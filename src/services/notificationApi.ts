// import { baseApi, type ApiResponse } from './baseApi'
// import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'
// import type { PaginatedMajor } from '@/models/major.model'

// export const majorApi = baseApi.injectEndpoints({
//     endpoints: (builder) => ({
//         getNotifications: builder.query<PaginatedMajor, PaginationQueryParamsDto>({
//             query: (queries) => {
//                 const queryString = buildQueryString(queries)
//                 return {
//                     url: `/majors?${queryString}`
//                 }
//             },
//             transformResponse: (response: ApiResponse<PaginatedMajor>) => response.data
//         }),
       
//     }),
//     overrideExisting: false
// })
// export const { useGetMajorsQuery, useGetMajorsBySameFacultyIdQuery } = majorApi
