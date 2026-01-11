import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/ui'
import { CustomPagination } from '@/components/PaginationBar'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useGetTopicsAwaitingEvaluationInPeriodQuery } from '@/services/topicApi'

const AwaitingTopicTable = () => {
	const { periodId } = useParams()

	const [topicQueries, setTopicQueries] = useState<PaginationQueryParamsDto>({
		limit: 15,
		page: 1,
		query: '',
		search_by: ['titleVN', 'titleEng', 'students.fullName']
	})

	const {
		data: topicData,
		isLoading: isLoadingTopics,
		error
	} = useGetTopicsAwaitingEvaluationInPeriodQuery({ periodId: periodId!, queryParams: topicQueries })

	const [searchTerm, setSearchTerm] = useState('')

	const setQuery = (query: string) => {
		setTopicQueries((prev) => ({ ...prev, query }))
	}

	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })

	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}

	if (isLoadingTopics) {
		return (
			<div className='flex items-center justify-center py-12'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		)
	}

	if (error) {
		return (
			<div className='rounded-lg border border-red-200 bg-red-50 p-4'>
				<p className='text-red-600'>Có lỗi xảy ra khi tải dữ liệu đề tài</p>
			</div>
		)
	}

	return (
		<div className='px-2'>
			<div className='mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
				<h2 className='text-xl font-semibold'>Đề tài chờ đánh giá ({topicData?.data?.length || 0})</h2>
				<Input
					placeholder='Tìm kiếm đề tài, sinh viên...'
					value={searchTerm}
					onChange={(e) => onEdit(e.target.value)}
					className='w-[400px] border-gray-300 bg-white'
				/>
			</div>

			<div className='overflow-x-auto rounded-lg border'>
				<table className='min-w-full table-auto bg-white'>
					<thead>
						<tr className='bg-gray-50 text-gray-700'>
							<th className='px-4 py-3 text-left text-sm font-semibold'>Đề tài</th>
							<th className='px-4 py-3 text-left text-sm font-semibold'>Chuyên ngành</th>
							<th className='px-4 py-3 text-left text-sm font-semibold'>Sinh viên</th>
							<th className='px-4 py-3 text-left text-sm font-semibold'>Giảng viên</th>
						</tr>
					</thead>
					<tbody>
						{topicData?.data && topicData.data.length > 0 ? (
							topicData.data.map((topic) => (
								<tr key={topic._id} className='border-b last:border-b-0 hover:bg-gray-50'>
									<td className='px-4 py-3'>
										<div>
											<p className='font-medium text-gray-900'>{topic.titleVN}</p>
											{topic.titleEng && (
												<p className='text-sm text-gray-500'>{topic.titleEng}</p>
											)}
										</div>
									</td>
									<td className='px-4 py-3'>
										<span className='text-sm text-gray-700'>{topic.majorName || 'N/A'}</span>
									</td>
									<td className='px-4 py-3'>
										<div className='space-y-1'>
											{topic.students && topic.students.length > 0 ? (
												topic.students.map((student, idx) => (
													<p key={idx} className='text-sm text-gray-700'>
														{student.fullName}
													</p>
												))
											) : (
												<span className='text-sm text-gray-400'>Chưa có SV</span>
											)}
										</div>
									</td>
									<td className='px-4 py-3'>
										<div className='space-y-1'>
											{topic.lecturers && topic.lecturers.length > 0 ? (
												topic.lecturers.map((lecturer, idx) => (
													<p key={idx} className='text-sm text-gray-700'>
														{lecturer.title} {lecturer.fullName}
													</p>
												))
											) : (
												<span className='text-sm text-gray-400'>Chưa có GV</span>
											)}
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={4} className='px-4 py-8 text-center text-gray-500'>
									Không có đề tài nào chờ đánh giá
								</td>
							</tr>
						)}
					</tbody>
				</table>

				{topicData?.meta && topicData.meta.totalPages > 1 && (
					<CustomPagination
						meta={topicData.meta}
						onPageChange={(p) => setTopicQueries((prev) => ({ ...prev, page: p }))}
					/>
				)}
			</div>
		</div>
	)
}

export default AwaitingTopicTable
