import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import type { ApiError } from '@/models'
import {
	defenseStatusMap,
	milestoneStatusMap,
	MilestoneType,
	milestoneTypeMap,
	RequestTopicInMilestoneBatchQuery,
	topicInMilestonesMap,
	type PayloadFacultyCreateMilestone,
	type ResponseFacultyMilestone
} from '@/models/milestone.model'
import type { PeriodPhase } from '@/models/period-phase.models'
import { Loader2, XCircle, Plus, Download, Eye, Settings } from 'lucide-react'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { toast } from 'sonner'
import RichTextEditor from '@/components/common/RichTextEditor'
import DOMPurify from 'dompurify'
import {
	useFacultyCreateMilestoneMutation,
	useFacultyDownloadZipByBatchIdMutation,
	useFacultyDownloadZipByMilestoneIdMutation,
	useFacultyGetTopicsInBatchQuery,
	useGetMilestonesCreatedByFacultyBoardQuery
} from '@/services/milestoneApi'
import { CustomPagination } from '@/components/PaginationBar'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import CreateMilestoneForm from './CreateMilestoneForm'

interface Props {
	open: boolean
	onOpenChange: Dispatch<SetStateAction<boolean>>
	periodId: string
	currentPhaseDetail: PeriodPhase
	onSuccess: () => void
}

const ManageMilestone = ({ open, onOpenChange, periodId, currentPhaseDetail, onSuccess }: Props) => {
	const [isMilestoneScreen, setIsMilestoneScreen] = useState(true)
	const {
		data: milestoneData,
		isLoading: isLoadingData,
		isError: isErrorData,
		error: milestoneError
	} = useGetMilestonesCreatedByFacultyBoardQuery(periodId, {
		skip: !isMilestoneScreen,
		refetchOnMountOrArgChange: true
	})
	const navigate = useNavigate()

	const [downloadZipByBatchId, { isLoading: isDownloading }] = useFacultyDownloadZipByBatchIdMutation()
	const [downloadZipByMilestoneId, { isLoading: isDownloadingMilestone }] =
		useFacultyDownloadZipByMilestoneIdMutation()

	const handleDownloadZip = async (id: string, nameTopic?: string) => {
		try {
			let blob
			let minestoneInfo
			let nameZip
			if (isMilestoneScreen) {
				minestoneInfo = milestoneData?.find((m) => m._id === id)
				blob = await downloadZipByBatchId({ parentId: id }).unwrap()
				nameZip = `${minestoneInfo?.title}(${minestoneInfo?.count}) report.zip`
			} else {
				nameZip = `${nameTopic} report.zip`
				blob = await downloadZipByMilestoneId({ milestoneId: id }).unwrap()
			}

			if (blob) {
				const url = window.URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = nameZip
				document.body.appendChild(a)
				a.click()
				a.remove()
				window.URL.revokeObjectURL(url)
			} else {
				toast.error('Không nhận được file từ server', { richColors: true })
			}
		} catch (error) {
			console.error('Error downloading zip:', error)
			toast.error('Xảy ra lỗi khi tải xuống', { richColors: true })
		}
	}

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const [queriesTopics, setQueriesTopics] = useState<RequestTopicInMilestoneBatchQuery>({
		page: 1,
		limit: 7,
		search_by: ['titleVN', 'titleEng', 'lecturers.fullName'],
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc'
	})
	const [selectedParent, setSelectedParent] = useState<ResponseFacultyMilestone>({} as ResponseFacultyMilestone)

	const {
		data: topicsInBatch,
		isLoading: isLoadingTopics,
		error: topicsError
	} = useFacultyGetTopicsInBatchQuery(
		{
			parentId: selectedParent._id,
			queries: queriesTopics
		},
		{
			skip: isMilestoneScreen
		}
	)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='flex max-h-[90vh] max-w-7xl flex-col bg-white'>
				{!isMilestoneScreen ? (
					// --- MÀN HÌNH CHI TIẾT ĐỀ TÀI TRONG CỘT MỐC ---
					<>
						<DialogHeader>
							<DialogTitle className='flex items-center gap-2 text-lg font-semibold'>
								<Button
									onClick={() => {
										setIsMilestoneScreen(true)
										setQueriesTopics({ ...queriesTopics, page: 1 })
									}}
								>
									Quay lại
								</Button>
								Trạng thái các đề tài theo cột mốc
								<div>
									{(() => {
										const minestoneInfo = milestoneData?.find((m) => m._id === selectedParent._id)
										return minestoneInfo ? (
											<span className='ml-2 text-sm text-gray-500'>
												{minestoneInfo.title} ({minestoneInfo.count} nhóm)
											</span>
										) : null
									})()}
								</div>
							</DialogTitle>
						</DialogHeader>
						<div className='space-y-6 overflow-y-auto pr-1'>
							<table className='border-1 min-w-full bg-white'>
								<thead>
									<tr className='bg-gray-100 text-gray-700'>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>STT</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Tiêu đề</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Giảng viên</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Ngành</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>SV</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Trạng thái</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Hành động</th>
									</tr>
								</thead>
								<tbody>
									{isLoadingTopics ? (
										<tr>
											<td colSpan={7} className='py-12 text-center'>
												<div className='flex flex-col items-center justify-center gap-2'>
													<Loader2 className='h-8 w-8 animate-spin text-blue-500' />
													<span className='text-gray-500'>Đang tải dữ liệu...</span>
												</div>
											</td>
										</tr>
									) : (
										<>
											{topicsInBatch?.data.map((t, index) => (
												<tr key={index} className='border-b last:border-b-0 hover:bg-gray-50'>
													<td className='max-w-[100px] px-3 py-2'>
														<span className='font-semibold text-gray-900'>
															{(queriesTopics.page! - 1) * queriesTopics.limit! +
																index +
																1}
														</span>
													</td>
													<td className='max-w-450 flex min-w-[150px] flex-col px-3 py-2'>
														<span className='font-semibold text-gray-900'>{t.titleVN}</span>
														<span className='font-sm text-[13px] text-gray-500'>{`(${t.titleEng})`}</span>
													</td>
													<td className='px-3 py-2'>
														<div className='flex flex-col text-sm'>
															{t.lecturers.length > 0 ? (
																t.lecturers.map((lecturer) => (
																	<span key={lecturer._id}>
																		{`${lecturer.title}. ${lecturer.fullName}`}
																	</span>
																))
															) : (
																<>Không có dữ liệu</>
															)}
														</div>
													</td>
													<td className='px-3 py-2'>
														<span className='font-semibold text-red-500'>
															{t.majorName}
														</span>
													</td>
													<td className='px-3 py-2'>
														<span className='font-semibold text-gray-700'>
															{t.studentNum}
														</span>
													</td>
													<td className='px-3 py-2'>
														{selectedParent.type === MilestoneType.SUBMISSION ? (
															<span className={cn(topicInMilestonesMap[t.status].color)}>
																{topicInMilestonesMap[t.status].label}
															</span>
														) : (
															<span className='rounded-sm bg-green-700 p-1 text-sm text-white'>
																Đã thông báo
															</span>
														)}
													</td>
													<td className='px-3 py-2'>
														<div className='flex items-center gap-2'>
															{t.status === 'submitted' && (
																<span
																	className='flex cursor-pointer items-center justify-center text-sm text-gray-700 hover:underline'
																	onClick={() => handleDownloadZip(t._id, t.titleEng)}
																>
																	<Download className='inline-block h-4 w-4' />
																</span>
															)}
															<button
																className='rounded-full p-2 transition-colors hover:bg-gray-100'
																onClick={() => navigate(`/detail-topic/${t.topicId}`)}
															>
																<Eye className='h-5 w-5 text-blue-500' />
															</button>
														</div>
													</td>
												</tr>
											))}
										</>
									)}
									{/* Handle Errors and Empty States for Topics here if needed */}
								</tbody>
							</table>
						</div>
						{topicsInBatch?.meta && topicsInBatch?.meta.totalPages > 1 && (
							<CustomPagination
								meta={topicsInBatch?.meta}
								onPageChange={(p) => setQueriesTopics((prev) => ({ ...prev, page: p }))}
							/>
						)}
					</>
				) : (
					// --- MÀN HÌNH QUẢN LÝ CỘT MỐC (MAIN) ---
					<>
						<DialogHeader>
							<DialogTitle className='flex items-center gap-2 text-lg font-semibold'>
								Quản lý các cột mốc của khoa
							</DialogTitle>
						</DialogHeader>

						<div className='h-[600px] space-y-6 overflow-y-auto pr-1'>
							<CreateMilestoneForm periodId={periodId} />

							{/* Bảng danh sách Cột mốc */}
							<table className='border-1 min-w-full bg-white'>
								<thead>
									<tr className='bg-gray-100 text-gray-700'>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>STT</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Tiêu đề</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Nội dung</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Hạn nộp</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Loại</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Trạng thái</th>
										<th className='px-3 py-2 text-center text-[15px] font-semibold'>Số nhóm</th>
										<th className='px-3 py-2 text-center text-[15px] font-semibold'>Chưa nộp</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Hành động</th>
									</tr>
								</thead>
								<tbody>
									{isLoadingData ? (
										<tr>
											<td colSpan={9} className='py-12 text-center'>
												<div className='flex flex-col items-center justify-center gap-2'>
													<Loader2 className='h-8 w-8 animate-spin text-blue-500' />
													<span className='text-gray-500'>Đang tải dữ liệu...</span>
												</div>
											</td>
										</tr>
									) : (
										<>
											{milestoneData?.map((m, index) => (
												<tr
													key={index}
													className={cn(
														m.type !== MilestoneType.DEFENSE && 'cursor-pointer',
														'border-b last:border-b-0 hover:bg-gray-50'
													)}
													onClick={() => {
														{
															if (m.type !== MilestoneType.DEFENSE) {
																setIsMilestoneScreen(false)
																setSelectedParent(m)
															}
														}
													}}
												>
													<td className='px-3 py-2'>
														<span className='font-semibold text-gray-900'>{index + 1}</span>
													</td>
													<td className='max-w-[200px] px-3 py-2'>
														<span className='font-semibold text-gray-900'>{m.title}</span>
													</td>
													<td className='max-w-[300px] px-3 py-2'>
														{/* Dùng DOMPurify để hiển thị HTML từ editor an toàn */}
														<div
															className='line-clamp-2 text-sm text-gray-500'
															dangerouslySetInnerHTML={{
																__html: DOMPurify.sanitize(m.description)
															}}
														/>
													</td>
													<td className='whitespace-nowrap px-3 py-2'>
														<span className='text-sm font-medium text-gray-700'>
															{formatDateTime(m.dueDate)}
														</span>
													</td>
													<td className='whitespace-nowrap px-3 py-2'>
														<span className='rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800'>
															{milestoneTypeMap[m.type as string].label || m.type}
														</span>
													</td>
													<td className='whitespace-nowrap px-3 py-2'>
														<span className={cn(milestoneStatusMap[m.status]?.color)}>
															{milestoneStatusMap[m.status]?.label}
														</span>
													</td>
													<td className='px-3 py-2 text-center'>
														<span className='font-semibold text-gray-700'>{m.count}</span>
													</td>
													<td className='px-3 py-2 text-center'>
														<span className='font-semibold text-red-500'></span>
													</td>
													<td className='px-3 py-2'>
														<div className='flex items-center gap-1'>
															<Button
																variant='ghost'
																size='icon'
																className='h-8 w-8 text-gray-500 hover:text-blue-600'
																onClick={(e) => {
																	e.stopPropagation()
																	handleDownloadZip(m._id)
																}}
																disabled={
																	isDownloadingMilestone ||
																	m.count === m.uncompleteNum
																}
															>
																{isDownloadingMilestone ? (
																	<Loader2 className='h-4 w-4 animate-spin' />
																) : (
																	<Download className='h-4 w-4' />
																)}
															</Button>
															{m.type !== MilestoneType.DEFENSE && (
																<Button
																	variant='ghost'
																	size='icon'
																	className='h-8 w-8 text-gray-500 hover:text-blue-600'
																	onClick={(e) => {
																		e.stopPropagation()
																		setIsMilestoneScreen(false)
																		setSelectedParent(m)
																	}}
																>
																	<Eye className='h-4 w-4' />
																</Button>
															)}
															{m.type === MilestoneType.DEFENSE && (
																<button
																	className='rounded-full p-2 transition-colors hover:bg-gray-100'
																	onClick={(e) => {
																		e.stopPropagation()
																		navigate(
																			`/period/${periodId}/defense-milestones-in-period/${m._id}`,
																			{
																				state: {
																					milestoneId: m._id
																				}
																			}
																		)
																	}}
																>
																	<Settings className='h-5 w-5 text-gray-700' />
																</button>
															)}
														</div>
													</td>
												</tr>
											))}
										</>
									)}
									{isErrorData && (
										<tr>
											<td colSpan={9} className='py-12 text-center'>
												<div className='flex flex-col items-center justify-center gap-2'>
													<XCircle className='h-8 w-8 text-red-500' />
													<span className='text-gray-500'>
														{(milestoneError as ApiError)?.data?.message ||
															'Đã có lỗi xảy ra khi tải dữ liệu'}
													</span>
												</div>
											</td>
										</tr>
									)}
									{!isLoadingData && !isErrorData && milestoneData?.length === 0 && (
										<tr>
											<td colSpan={9} className='py-12 text-center'>
												<EmptyState title='Chưa có cột mốc nào được tạo' />
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}

export default ManageMilestone
