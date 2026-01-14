import { useLocation, useNavigate, useParams } from 'react-router-dom'
import TopicInConcilsRow from './components/TopicInConcilsRow'
import { useGetCouncilByIdQuery } from '@/services/defenseCouncilApi'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CouncilScoringTab } from '@/features/faculty/defense-milestones/components/CouncilScoringTab'
import { useAppSelector } from '@/store'
import { ROLES } from '@/models/users'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'

const DetailConcilsPage = () => {
	const { councilId } = useParams<{ councilId: string }>()
	const auth = useAppSelector((auth) => auth.auth)
	const { data: councilDetail, isLoading: isLoadingCouncilDetail } = useGetCouncilByIdQuery(councilId!)
	const navigate = useNavigate()
	const location = useLocation()
	const handleGotoAssignmentPage = () => {
		console.log('click')
		navigate(
			`/period/${councilDetail?.periodInfo._id}/defense-milestones-in-period/${councilDetail?.defenseMilestone._id}/manage-council-assignment/${councilDetail?._id}?from=${encodeURIComponent(location.pathname + location.search)}`
		)
	}
	const handleComeBack = () => {
		const params = new URLSearchParams(location.search)
		const from = params.get('from')
		if (from) {
			navigate(from)
		} else {
			navigate(-1)
		}
	}
	if (isLoadingCouncilDetail) {
		return (
			<div className='container flex w-screen flex-col items-center justify-center gap-4 p-4'>
				<Loader2 className='h-12 w-12 animate-spin' />
			</div>
		)
	}
	return (
		<div className='container flex flex-col gap-4 p-4 pt-10'>
			<div className='flex items-center gap-2'>
				<Button
					variant='ghost'
					size='icon'
					className='border border-gray-200 hover:bg-gray-100'
					onClick={handleComeBack}
				>
					<ArrowLeft className='h-5 w-5' />
				</Button>
				{/* Header */}
				<div className='rounded-lg border border-gray-300 bg-white p-6 shadow-sm'>
					<div className='flex w-full gap-4 space-y-4'>
						<div>
							<h1 className='text-3xl font-bold tracking-tight text-gray-900'>
								{councilDetail?.name || 'Hội đồng'}
							</h1>
							<p className='text-[15px] text-muted-foreground'>Chi tiết hội đồng và danh sách đề tài</p>
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
			</div>
			<Tabs defaultValue='topics'>
				<div className='flex items-center gap-5'>
					<TabsList className='flex w-fit justify-start gap-2 px-2 py-2'>
						<TabsTrigger value='topics' variant='standard'>
							Đề tài
						</TabsTrigger>
						<TabsTrigger value='scoring' variant='standard'>
							Quản lý điểm
						</TabsTrigger>{' '}
					</TabsList>
					<div className='px-2 py-2'>
						{auth.user?.role === ROLES.FACULTY_BOARD && (
							<button
								className='rounded bg-blue-500 px-3 py-1 text-white'
								onClick={handleGotoAssignmentPage}
							>
								Tới trang phân công
							</button>
						)}
					</div>
				</div>

				<TabsContent value='topics'>
					<div className='px-2'>
						<div className='overflow-x-auto rounded-lg border border-blue-500'>
							{councilDetail?.topics && councilDetail?.topics.length > 0 ? (
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
											<TopicInConcilsRow
												index={index + 1}
												key={topic.topicId}
												topic={topic}
												councilMembers={topic.members}
											/>
										))}
									</tbody>
								</table>
							) : (
								<div className='border-t bg-white px-6 py-12 text-center'>
									<p className='p-4 text-sm text-gray-500'>Chưa có đề tài nào được phân công.</p>
								</div>
							)}
						</div>
					</div>
				</TabsContent>
				<TabsContent value='scoring'>
					<CouncilScoringTab
						councilId={councilId!}
						isFacultyBoard={auth.user?.role === ROLES.FACULTY_BOARD}
					/>
				</TabsContent>
			</Tabs>
		</div>
	)
}

export default DetailConcilsPage
