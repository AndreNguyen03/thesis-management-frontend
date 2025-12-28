import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/Dialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import type { ApiError } from '@/models'
import {
	milestoneStatusMap,
	MilestoneType,
	milestoneTypeMap,
	RequestTopicInMilestoneBatchQuery,
	topicInMilestonesMap,
	type PayloadFacultyCreateMilestone
} from '@/models/milestone.model'
import type { PeriodPhase } from '@/models/period-phase.models'
import { DialogTitle } from '@radix-ui/react-dialog'
import { Loader2, XCircle, Plus, Download, Eye } from 'lucide-react'
import { useState, type Dispatch, type SetStateAction } from 'react'
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

interface Props {
	open: boolean
	onOpenChange: Dispatch<SetStateAction<boolean>>
	periodId: string
	currentPhaseDetail: PeriodPhase
	onSuccess: () => void
}

const ManageMilestone = ({ open, onOpenChange, periodId, currentPhaseDetail, onSuccess }: Props) => {
	const [newMilestone, setNewMilestone] = useState<PayloadFacultyCreateMilestone>({
		periodId: periodId,
		phaseName: currentPhaseDetail.phase,
		title: '',
		description: '',
		dueDate: '',
		type: MilestoneType.SUBMISSION
	})
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
	const [createMilestone, { isLoading: isCreating }] = useFacultyCreateMilestoneMutation()
	//gọi endpoint downloadzipwithBatch
	const [downloadZipByBatchId, { isLoading: isDownloading }] = useFacultyDownloadZipByBatchIdMutation()
	//gọi endpoint downloadzipwithMilestoneId
	const [downloadZipByMilestoneId, { isLoading: isDownloadingMilestone }] =
		useFacultyDownloadZipByMilestoneIdMutation()
	const handleCreateMilestone = async () => {
		if (!newMilestone.title || !newMilestone.dueDate) {
			toast.error('Vui lòng điền đầy đủ tiêu đề và hạn nộp', { richColors: true })
			return
		}
		try {
			await createMilestone({ ...newMilestone }).unwrap()
			toast.success('Tạo cột mốc thành công', { richColors: true })

			// Reset form
			setNewMilestone({
				periodId: periodId,
				phaseName: currentPhaseDetail.phase,
				title: '',
				description: '',
				dueDate: '',
				type: MilestoneType.SUBMISSION
			})
			onSuccess()
		} catch (error) {
			console.error('Error creating milestone:', error)
			toast.error('Xảy ra lỗi khi tạo cột mốc', { richColors: true })
		}
	}
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
	const [isCollapsed, setIsCollapsed] = useState(true)

	const [queriesTopics, setQueriesTopics] = useState<RequestTopicInMilestoneBatchQuery>({
		page: 1,
		limit: 7,
		search_by: ['titleVN', 'titleEng', 'lecturers.fullName'],
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc'
	})
	const [selectedParentId, setSelectedParentId] = useState<string>('')
	const {
		data: topicsInBatch,
		isLoading: isLoadingTopics,
		error: topicsError
	} = useFacultyGetTopicsInBatchQuery(
		{
			parentId: selectedParentId,
			queries: queriesTopics
		},
		{
			skip: isMilestoneScreen
		}
	)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='flex max-h-[70vh] max-w-5xl flex-col border-red-500 bg-white'>
				{!isMilestoneScreen ? (
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
										const minestoneInfo = milestoneData?.find((m) => m._id === selectedParentId)
										return minestoneInfo ? (
											<span className='ml-2 text-sm text-gray-500'>
												{minestoneInfo.title} ({minestoneInfo.count} nhóm)
											</span>
										) : null
									})()}
								</div>
							</DialogTitle>
						</DialogHeader>
						{/* Bảng danh sách */}
						<div className='space-y-6 overflow-y-auto pr-1'>
							<table className='border-1 min-w-full bg-white'>
								<thead>
									<tr className='bg-gray-100 text-gray-700'>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>STT</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Tiêu đề</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Giảng viên</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Ngành</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>
											Số lượng sinh viên
										</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Trạng thái</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Hành động</th>
									</tr>
								</thead>
								<tbody>
									{isLoadingTopics ? (
										<tr>
											<td colSpan={5} className='py-12 text-center'>
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
																<>
																	{t.lecturers.map((lecturer) => (
																		<span
																			key={lecturer._id}
																		>{`${lecturer.title}. ${lecturer.fullName}`}</span>
																	))}
																</>
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
														<span className={cn(topicInMilestonesMap[t.status].color)}>
															{topicInMilestonesMap[t.status].label}
														</span>
													</td>
													<td className='px-3 py-2'>
														<div className='flex flex-col items-center justify-center gap-2'>
															{t.status === 'submitted' && (
																<span
																	className='flex cursor-pointer items-center justify-center text-sm text-gray-700 hover:underline'
																	onClick={() => handleDownloadZip(t._id, t.titleEng)}
																>
																	<Download className='inline-block h-4 w-4' />
																	Tải báo cáo
																</span>
															)}
															<td className='px-3 text-center'>
																<button
																	className='rounded-full p-2 transition-colors hover:bg-gray-100'
																	onClick={() =>
																		navigate(`/detail-topic/${t.topicId}`)
																	}
																>
																	<Eye className='h-5 w-5 text-blue-500' />
																</button>
															</td>
														</div>
													</td>
												</tr>
											))}
										</>
									)}
									{topicsError && (
										<tr>
											<td colSpan={5} className='py-12 text-center'>
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
									{!isLoadingTopics && !topicsError && topicsInBatch?.data.length === 0 && (
										<tr>
											<td colSpan={5} className='py-12 text-center'>
												<EmptyState title='Chưa có cột mốc nào' />
											</td>
										</tr>
									)}{' '}
								</tbody>
							</table>
						</div>
						{topicsInBatch?.meta && topicsInBatch?.meta.totalPages > 1 && (
							<CustomPagination
								meta={topicsInBatch?.meta}
								onPageChange={(p) =>
									setQueriesTopics((prev) => {
										console.log(prev.page)
										return { ...prev, page: p }
									})
								}
							/>
						)}
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle className='flex items-center gap-2 text-lg font-semibold'>
								Quản lý các cột mốc quan trọng
							</DialogTitle>
						</DialogHeader>

						<div className='h-96 space-y-6 overflow-y-auto pr-1'>
							{/* Form tạo mới */}
							<div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
								<h3
									className='mb-3 flex w-fit cursor-pointer items-center gap-2 font-semibold text-blue-900 hover:bg-slate-200'
									onClick={() => setIsCollapsed((prev) => !prev)}
								>
									<Plus className='h-5 w-5' />
									Tạo cột mốc mới
								</h3>
								{!isCollapsed && (
									<div className='grid gap-3'>
										<div>
											<label className='mb-1 block text-sm font-medium'>Tiêu đề *</label>
											<Input
												value={newMilestone.title}
												onChange={(e) =>
													setNewMilestone({ ...newMilestone, title: e.target.value })
												}
												placeholder='Nhập tiêu đề cột mốc'
											/>
										</div>
										<div>
											<label className='mb-1 block text-sm font-medium'>Nội dung</label>
											<RichTextEditor
												value={newMilestone.description}
												onChange={(data) =>
													setNewMilestone({ ...newMilestone, description: data })
												}
												placeholder='Nhập nội dung mô tả'
											/>
										</div>
										<div>
											<label className='mb-1 block text-sm font-medium'>Loại cột mốc *</label>
											<select
												className='w-full rounded border px-3 py-2'
												value={newMilestone.type}
												onChange={(e) =>
													setNewMilestone({
														...newMilestone,
														type: e.target.value as MilestoneType
													})
												}
											>
												<option value={MilestoneType.SUBMISSION}>Nộp bài (Submission)</option>
												<option value={MilestoneType.DEFENSE}>Bảo vệ (Defense)</option>
											</select>
										</div>
										<div className='grid grid-cols-2 gap-3'>
											<div>
												<label className='mb-1 block text-sm font-medium'>Ngày hạn nộp *</label>
												<input
													type='datetime-local'
													min={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
													className='w-full rounded border px-3 py-2'
													value={newMilestone.dueDate}
													onChange={(e) =>
														setNewMilestone({ ...newMilestone, dueDate: e.target.value })
													}
												/>
											</div>
										</div>
										<Button
											onClick={handleCreateMilestone}
											disabled={isCreating}
											className='w-full'
										>
											{isCreating ? (
												<>
													<Loader2 className='mr-2 h-4 w-4 animate-spin' />
													Đang tạo...
												</>
											) : (
												<>
													<Plus className='mr-2 h-4 w-4' />
													Tạo cột mốc
												</>
											)}
										</Button>
									</div>
								)}
							</div>

							{/* Bảng danh sách */}
							<table className='border-1 min-w-full bg-white'>
								<thead>
									<tr className='bg-gray-100 text-gray-700'>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>STT</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Tiêu đề</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Nội dung</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Hạn nộp</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Loại</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Trạng thái</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>
											Số nhóm được giao
										</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>
											Chưa nộp báo cáo
										</th>
										<th className='px-3 py-2 text-left text-[15px] font-semibold'>Hành động</th>
									</tr>
								</thead>
								<tbody>
									{isLoadingData ? (
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
											{milestoneData?.map((m, index) => (
												<tr
													key={index}
													className='cursor-pointer border-b last:border-b-0 hover:bg-gray-50'
													onClick={() => {
														setIsMilestoneScreen(false)
														setSelectedParentId(m._id)
													}}
												>
													<td className='max-w-[200px] px-3 py-2'>
														<span className='font-semibold text-gray-900'>{index + 1}</span>
													</td>
													<td className='max-w-[200px] px-3 py-2'>
														<span className='font-semibold text-gray-900'>{m.title}</span>
													</td>
													<td className='max-w-[300px] px-3 py-2'>
														<div
															className='prose relative max-h-24 max-w-none overflow-hidden rounded-lg bg-gray-50 p-4 text-gray-700'
															style={{
																display: '-webkit-box',
																WebkitLineClamp: 3,
																WebkitBoxOrient: 'vertical',
																overflow: 'hidden'
															}}
															dangerouslySetInnerHTML={{
																__html: DOMPurify.sanitize(
																	m.description || '<p>Chưa có mô tả</p>'
																)
															}}
														/>
													</td>
													<td className='px-3 py-2'>
														<span className='text-gray-700'>
															{formatDateTime(m.dueDate)}
														</span>
													</td>
													<td className='px-3 py-2'>
														<span className='text-gray-700'>
															{milestoneTypeMap[m.type].label}
														</span>
													</td>
													<td className='px-3 py-2'>
														<span className='font-semibold text-gray-700'>
															{milestoneStatusMap[m.status].label}
														</span>
													</td>
													<td className='px-3 py-2'>
														<span className='font-semibold text-gray-700'>{m.count}</span>
													</td>
													<td className='px-3 py-2'>
														<span className='font-semibold text-red-500'>
															{m.uncompleteNum}
														</span>
													</td>
													<td className='px-3 py-2'>
														{m.isDownload ? (
															<span
																className='cursor-pointer text-gray-700 hover:underline'
																onClick={() => handleDownloadZip(m._id)}
															>
																<Download className='inline-block h-4 w-4' />
																Tải báo cáo
															</span>
														) : (
															<span> Chưa có báo cáo</span>
														)}
													</td>
												</tr>
											))}
										</>
									)}

									{isErrorData && (
										<tr>
											<td colSpan={7} className='py-12 text-center'>
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
											<td colSpan={7} className='py-12 text-center'>
												<EmptyState title='Chưa có cột mốc nào' />
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
