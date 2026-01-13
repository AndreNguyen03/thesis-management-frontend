import { useParams } from 'react-router-dom'
import EditTopicRow from './components/EditTopicRow'
import { useGetDetailAssignedDefenseCouncilsQuery } from '@/services/defenseCouncilApi'

const LecturerDetailConcilsPage = () => {
	const { councilId } = useParams<{ councilId: string }>()
	const { data: councilDetail } = useGetDetailAssignedDefenseCouncilsQuery(councilId!)
	return (
		<div className='container flex flex-col gap-4 p-4'>
			{/* Header */}
			<div className='rounded-lg border border-gray-300 bg-white p-6 shadow-sm'>
				<div className='flex w-full gap-4 space-y-4'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight text-gray-900'>
							{councilDetail?.name || 'Hội đồng'}
						</h1>
						<p className='text-sm text-muted-foreground'>Chi tiết hội đồng và danh sách đề tài</p>
					</div>

					{councilDetail && (
						<div className='grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
							{councilDetail.location && (
								<div className='flex flex-col'>
									<span className='text-sm font-semibold text-gray-600'>Địa điểm:</span>
									<span className='text-sm text-gray-900'>{councilDetail.location}</span>
								</div>
							)}
							{councilDetail.scheduledDate && (
								<div className='flex flex-col'>
									<span className='text-sm font-semibold text-gray-600'>Ngày bảo vệ:</span>
									<span className='text-sm text-gray-900'>
										{new Date(councilDetail.scheduledDate).toLocaleDateString('vi-VN')}
									</span>
								</div>
							)}
							{councilDetail.scheduledDate && (
								<div className='flex flex-col'>
									<span className='text-sm font-semibold text-gray-600'>Thời gian:</span>
									<span className='text-sm text-gray-900'>
										{' '}
										{new Date(councilDetail.scheduledDate).toLocaleTimeString('vi-VN')}
									</span>
								</div>
							)}
							<div className='flex flex-col'>
								<span className='text-sm font-semibold text-gray-600'>Số lượng đề tài:</span>
								<span className='text-sm text-gray-900'>{councilDetail.topics?.length || 0}</span>
							</div>
						</div>
					)}
				</div>
			</div>
			<div className='px-2'>
				<div className='overflow-x-auto rounded-lg border border-blue-500'>
					<table className='min-w-full table-auto bg-white'>
						<thead>
							<tr className='bg-gray-50 text-gray-700'>
								<th
									className='px-4 py-3 text-left text-sm font-semibold'
									style={{ minWidth: '30px', maxWidth: '50px', width: '50px' }}
								>
									STT
								</th>
								<th
									className='px-4 py-3 text-left text-sm font-semibold'
									style={{ minWidth: '180px', maxWidth: '220px', width: '200px' }}
								>
									Đề tài
								</th>
								<th className='px-4 py-3 text-left text-sm font-semibold'>Sinh viên</th>
								<th className='px-4 py-3 text-left text-sm font-semibold'>GVHD</th>
								<th className='px-4 py-3 text-left text-sm font-semibold'>Phản biện</th>
								<th className='px-4 py-3 text-left text-sm font-semibold'>Hội đồng chấm</th>
								<th className='px-4 py-3 text-left text-sm font-semibold'>Hành động</th>
							</tr>
						</thead>
						<tbody>
							{councilDetail?.topics.map((topic, index) => (
								<EditTopicRow
									index={index + 1}
									key={topic.topicId}
									topic={topic}
									councilMembers={topic.members}
								/>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

export default LecturerDetailConcilsPage
