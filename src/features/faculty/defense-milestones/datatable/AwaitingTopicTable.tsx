import { Loader2 } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Input } from '@/components/ui'
import { CustomPagination } from '@/components/PaginationBar'
import type { GetTopicsInBatchMilestoneDto, PaginatedTopicInBatchMilestone } from '@/models/milestone.model'

import { useMemo, type Dispatch, type SetStateAction } from 'react'
import type { PaginationQueryParamsDto } from '@/models/query-params'
interface AwaitingTopicTableProps {
	isChosingMode?: boolean
	isLoadingTopics: boolean
	error: any
	paginationTopicData?: PaginatedTopicInBatchMilestone
	setQuery: Dispatch<SetStateAction<PaginationQueryParamsDto>>
	selectedTopics: GetTopicsInBatchMilestoneDto[]
	setSelectedTopics: (id: string) => void
}
const AwaitingTopicTable = ({
	isChosingMode = false,
	selectedTopics,
	isLoadingTopics,
	error,
	paginationTopicData,
	setSelectedTopics,
	setQuery
}: AwaitingTopicTableProps) => {
	if (isLoadingTopics) {
		return (
			<div className='flex items-center justify-center py-12'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		)
	}
	const location = useLocation()
	const navigate = useNavigate()
	if (error) {
		return (
			<div className='rounded-lg border border-red-200 bg-red-50 p-4'>
				<p className='text-red-600'>Có lỗi xảy ra khi tải dữ liệu đề tài</p>
			</div>
		)
	}
	const selectedTopicIds = useMemo(() => selectedTopics.map((topic) => topic._id), [selectedTopics])
	return (
		<div className='px-2'>
			<div className='overflow-x-auto rounded-lg border'>
				<table className='min-w-full table-auto bg-white'>
					<thead>
						<tr className='bg-gray-50 text-gray-700'>
							<th className='px-4 py-3 text-left text-sm font-semibold'>Đề tài</th>
							<th className='px-4 py-3 text-left text-sm font-semibold'>Chuyên ngành</th>
							<th className='px-4 py-3 text-left text-sm font-semibold'>Sinh viên</th>
							<th className='px-4 py-3 text-left text-sm font-semibold'>Giảng viên</th>
							<th className='px-4 py-3 text-left text-sm font-semibold'></th>
						</tr>
					</thead>
					<tbody>
						{paginationTopicData && paginationTopicData.data.length > 0 ? (
							paginationTopicData.data.map((topic) => (
								<tr key={topic._id} className='border-b last:border-b-0 hover:bg-gray-50'>
									<td
										className='group cursor-pointer px-4 py-3'
										onClick={() => navigate(`/detail-topic/${topic._id}?from=${encodeURIComponent(location.pathname + location.search)}`)}
									>
										<div>
											<p className='font-medium text-gray-900 group-hover:text-blue-600 group-hover:underline'>
												{topic.titleVN}
											</p>
											{topic.titleEng && (
												<p className='text-sm text-gray-500 group-hover:text-blue-600 group-hover:underline'>
													{topic.titleEng}
												</p>
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

									{isChosingMode && (
										<td className='px-4 py-3'>
											<input
												type='checkbox'
												className='h-4 w-4'
												checked={selectedTopicIds && selectedTopicIds.includes(topic._id)}
												value={topic._id}
												onChange={(e) => {
													e.stopPropagation()
													setSelectedTopics(e.target.value)
												}}
											/>
										</td>
									)}
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
			</div>
		</div>
	)
}

export default AwaitingTopicTable
