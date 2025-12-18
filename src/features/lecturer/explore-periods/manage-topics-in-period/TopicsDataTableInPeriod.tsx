import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui'
import { Eye, Loader2, XCircle } from 'lucide-react'
import { topicStatusLabels, type ApiError, type GeneralTopic } from '@/models'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import type { is } from 'date-fns/locale'

interface TopicsDataTableProps {
	isLoading: boolean
	error: ApiError | null
	data?: GeneralTopic[]
}

const TopicsDataTable: React.FC<TopicsDataTableProps> = ({ data, isLoading, error }) => {
	const navigate = useNavigate()

	const handleGoDetail = (topicId: string) => {
		navigate(`/detail-topic/${topicId}`, {
			state: {
				focusTab: 'students'
			}
		})
	}

	return (
		<div className='w-full'>
			<div className='overflow-x-auto rounded-lg border'>
				<table className='min-w-full bg-white'>
					<thead>
						<tr className='bg-gray-50 text-gray-700'>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Đề tài (Việt - Anh)</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Giảng viên</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Ngành</th>
							<th className='line-clamp-2 px-3 py-2 text-left text-[15px] font-semibold'>
								Số lượng đăng ký
							</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Yêu cầu cần duyệt</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Ngày nộp</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Trạng thái</th>
							<th className='px-3 py-2 text-center text-[15px] font-semibold'>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{isLoading && (
							<tr>
								<td colSpan={7} className='py-12 text-center'>
									<div className='flex flex-col items-center justify-center gap-2'>
										<Loader2 className='h-8 w-8 animate-spin text-blue-500' />
										<span className='text-gray-500'>Đang tải dữ liệu...</span>
									</div>
								</td>
							</tr>
						)}
						{error && (
							<tr>
								<td colSpan={7} className='py-12 text-center'>
									<div className='flex flex-col items-center justify-center gap-2'>
										<XCircle className='h-8 w-8 text-red-500' />
										<span className='text-gray-500'>
											{(error as ApiError).data?.message || 'Đã có lỗi xảy ra khi tải dữ liệu'}
										</span>
									</div>
								</td>
							</tr>
						)}
						{!isLoading && !error && data?.length === 0 && (
							<tr>
								<td colSpan={7} className='py-12 text-center'>
									<EmptyState title='Không có dữ liệu' />
								</td>
							</tr>
						)}
						{!isLoading &&
							!error &&
							data &&
							data.length > 0 &&
							data.map((topic) => {
								const statusInfo =
									topicStatusLabels[topic.currentStatus as keyof typeof topicStatusLabels]
								const pendingStudentsCount = topic.students?.pendingStudents?.length || 0

								return (
									<tr key={topic._id} className='border-b last:border-b-0 hover:bg-gray-50'>
										<td className='flex flex-col px-3 py-2 min-w-[250px]'>
											<span className='font-semibold text-gray-900'>{topic.titleVN}</span>
											<span className='font-sm text-[13px] text-gray-500'>{`(${topic.titleEng})`}</span>
										</td>
										<td className='px-3 py-2'>
											<div className='flex flex-col text-sm'>
												{topic.lecturers.map((lecturer) => (
													<span>{`${lecturer.title}. ${lecturer.fullName}`}</span>
												))}
											</div>
										</td>
										<td className='px-3 py-2'>{topic.major.name}</td>
										<td className='px-3 py-2'>
											<span className='font-medium'>
												{topic.studentsNum}/{topic.maxStudents}
											</span>
										</td>
										<td className='px-3 py-2'>
											<span
												className='cursor-pointer px-5 font-medium text-yellow-500 hover:underline'
												onClick={() => {
													handleGoDetail(topic._id)
												}}
											>
												{pendingStudentsCount}
											</span>
										</td>
										<td className='px-3 py-2'>
											{topic.submittedAt
												? new Date(topic.submittedAt).toLocaleString('vi-VN')
												: new Date(topic.createdAt).toLocaleString('vi-VN')}
										</td>
										<td className='px-3 py-2'>
											<Badge className={cn('text-xs font-semibold', statusInfo.css)}>
												{statusInfo.name}
											</Badge>
										</td>
										<td className='px-3 py-2 text-center'>
											<button
												className='rounded-full p-2 transition-colors hover:bg-gray-100'
												onClick={() => handleGoDetail(topic._id)}
											>
												<Eye className='h-5 w-5 text-blue-500' />
											</button>
										</td>
									</tr>
								)
							})}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default TopicsDataTable
