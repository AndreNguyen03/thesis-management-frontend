import { Badge, Button } from '@/components/ui'
import { topicStatusLabels, type DraftTopic, type PaginatedDraftTopics } from '@/models'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useSubmitTopicMutation } from '@/services/topicApi'
import { Eye, Send, Trash2 } from 'lucide-react'
import React, { type Dispatch } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

const DraftTopicsDatatable = ({
	queries,
	setQueries,
	topicsData,
	onRefetch
}: {
	queries: PaginationQueryParamsDto
	setQueries: Dispatch<React.SetStateAction<PaginationQueryParamsDto>>
	topicsData: PaginatedDraftTopics
	onRefetch?: () => void
}) => {
	const navigate = useNavigate()
	const { periodId } = useParams<{ periodId: string }>()
	const [submitTopic, { isLoading: isSubmitting }] = useSubmitTopicMutation()

	const handleSubmit = async (topic: DraftTopic) => {
		if (!periodId) {
			toast.error('Không tìm thấy ID kỳ học')
			return
		}
		try {
			await submitTopic({ topicId: topic._id, periodId }).unwrap()
			toast.success('Nộp đề tài thành công!')
			onRefetch?.()
		} catch (error: any) {
			toast.error(error?.data?.message || 'Nộp đề tài thất bại')
		}
	}

	const handleViewDetail = (topicId: string) => {
		navigate(`/detail-topic/${topicId}`)
	}

	return (
		<div className='overflow-x-auto rounded-lg border'>
            
			<table className='min-w-full bg-white'>
				<thead>
					<tr className='bg-gray-50 text-gray-700'>
						<th className='px-3 py-2 text-left text-[15px] font-semibold'>STT</th>
						<th className='px-3 py-2 text-left text-[15px] font-semibold'>Đề tài (Việt - Anh)</th>
						<th className='px-3 py-2 text-left text-[15px] font-semibold'>Ngành</th>
						<th className='px-3 py-2 text-left text-[15px] font-semibold'>Loại</th>
						<th className='px-3 py-2 text-left text-[15px] font-semibold'>Cập nhật</th>
						<th className='px-3 py-2 text-left text-[15px] font-semibold'>Trạng thái</th>
						<th className='px-3 py-2 text-center text-[15px] font-semibold'>Hành động</th>
					</tr>
				</thead>
				<tbody>
					{topicsData?.data.map((topic, index) => (
						<tr key={topic._id} className='border-b last:border-b-0 hover:bg-gray-50'>
							<td className='px-3 py-2 text-center'>
								{((queries.page ?? 1) - 1) * (queries.limit ?? 1) + index + 1}
							</td>
							<td className='px-3 py-2'>
								<div className='flex flex-col'>
									<span className='font-semibold text-gray-900'>{topic.titleVN}</span>
									<span className='text-[13px] text-gray-500'>{topic.titleEng || '(Chưa có)'}</span>
								</div>
							</td>
							<td className='px-3 py-2'>{topic.major.name}</td>
							<td className='px-3 py-2'>
								<Badge variant={topic.type === 'thesis' ? 'default' : 'secondary'}>
									{topic.type === 'thesis' ? 'Khóa luận' : 'Nghiên cứu KH'}
								</Badge>
							</td>
							<td className='px-3 py-2 text-sm'>
								{new Date(topic.updatedAt).toLocaleDateString('vi-VN')}
							</td>
							<td className='px-3 py-2'>
								<Badge className='bg-gray-200 text-gray-800'>{topicStatusLabels.draft.name}</Badge>
							</td>
							<td className='px-3 py-2'>
								<div className='flex items-center justify-center gap-1'>
									<button
										className='rounded-full p-2 transition-colors hover:bg-blue-100'
										onClick={() => handleViewDetail(topic._id)}
										title='Xem chi tiết'
									>
										<Eye className='h-5 w-5 text-blue-500' />
									</button>
									<button
										className='rounded-full p-2 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50'
										onClick={() => handleSubmit(topic)}
										disabled={isSubmitting}
										title='Nộp đề tài'
									>
										<Send className='h-5 w-5 text-green-500' />
									</button>
								</div>
							</td>
						</tr>
					))}
					{topicsData?.data.length === 0 && (
						<tr>
							<td colSpan={7} className='py-6 text-center text-gray-400'>
								Không có đề tài nháp nào.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	)
}

export default DraftTopicsDatatable
