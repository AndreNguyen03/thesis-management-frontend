import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
	useCompleteCouncilWithValidationMutation,
	usePublishCouncilScoresMutation,
	useLockTopicScoresMutation,
	useUnlockTopicScoresMutation,
	useLazyExportScoresTemplateQuery,
	useLazyExportPdfReportQuery,
	useGetDetailScoringDefenseCouncilQuery
} from '@/services/defenseCouncilApi'
import { ExcelImportDialog } from './ExcelImportDialog'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Lock, Unlock, Eye, Edit, Upload, Download, FileDown } from 'lucide-react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROLES } from '@/models'
import {
	CouncilMember,
	councilMemberRoleMap,
	type DefenseMilestoneDto,
	type TopicAssignment,
	type CouncilMemberDto
} from '@/models/defenseCouncil.model'
import { EvaluationFormModal } from './EvaluationFormModal'
import { CouncilMinutesModal } from './CouncilMinutesModal'
import type { MiniPeriod } from '@/models/period.model'
import { ScoreViewModal } from './ScoreViewModal'

interface AggregatedCouncilMember {
	memberId: string
	fullName: string
	title?: string
	roles: string[]
}

interface CouncilScoringTabProps {
	councilId: string
	isFacultyBoard?: boolean
}
interface ContextData {
	defenseMilestone: DefenseMilestoneDto // Đợt bảo vệ
	periodInfo: MiniPeriod
	name: string // VD: "Hội đồng 1 - Phòng E03.2"
	location: string // Phòng bảo vệ
	scheduledDate: Date // Thời gian bảo vệ
	topic: TopicAssignment
	councilId: string
	evaluationTemplateId?: string
	allCouncilMembers?: AggregatedCouncilMember[]
	allTopics?: TopicAssignment[] // Tất cả đề tài trong hội đồng
	councilComments?: string // Ý kiến hội đồng
}
export function CouncilScoringTab({ councilId, isFacultyBoard = false }: CouncilScoringTabProps) {
	const { toast } = useToast()
	const {
		data: council,
		isLoading: loadingCouncil,
		error,
		refetch
	} = useGetDetailScoringDefenseCouncilQuery(councilId)
	console.log(council)
	const [completeCouncil, { isLoading: completing }] = useCompleteCouncilWithValidationMutation()
	const [publishScores, { isLoading: publishing }] = usePublishCouncilScoresMutation()
	const [lockTopic] = useLockTopicScoresMutation()
	const [unlockTopic] = useUnlockTopicScoresMutation()
	const [exportTemplate] = useLazyExportScoresTemplateQuery()
	const [exportPdf] = useLazyExportPdfReportQuery()
	const location = useLocation()
	const [selectedContext, setSelectedContext] = useState<ContextData | undefined>(undefined)
	const [openEvaluationModal, setOpenEvaluationModal] = useState(false)
	const [openCouncilModal, setOpenCouncilModal] = useState(false)
	const [showImportDialog, setShowImportDialog] = useState(false)
	const [showCompleteDialog, setShowCompleteDialog] = useState(false)
	const [showPublishDialog, setShowPublishDialog] = useState(false)
	const [selectedTopicForView, setSelectedTopicForView] = useState<TopicAssignment | null>(null)
	const [showScoreViewModal, setShowScoreViewModal] = useState(false)
	const [showCouncilMinutesForAll, setShowCouncilMinutesForAll] = useState(false)
	const navigate = useNavigate()
	const isSecretary = council?.topics.some((topic) =>
		topic.members.some(
			(member) => member.memberId === location.state?.userId && member.role === councilMemberRoleMap.secretary
		)
	)
	// Aggregate all unique council members across all topics with their roles
	const aggregateCouncilMembers = (council: any) => {
		const memberMap = new Map<
			string,
			{
				memberId: string
				fullName: string
				title?: string
				roles: Set<string>
			}
		>()

		council.topics.forEach((topic: TopicAssignment) => {
			topic.members.forEach((member: CouncilMemberDto) => {
				if (!memberMap.has(member.memberId)) {
					memberMap.set(member.memberId, {
						memberId: member.memberId,
						fullName: member.fullName,
						title: member.title || '',
						roles: new Set([member.role])
					})
				} else {
					memberMap.get(member.memberId)!.roles.add(member.role)
				}
			})
		})

		return Array.from(memberMap.values()).map((member) => ({
			memberId: member.memberId,
			fullName: member.fullName,
			title: member.title,
			roles: Array.from(member.roles)
		}))
	}

	const handleOpenEvaluationModal = (topic: TopicAssignment) => {
		if (!council) return
		setSelectedContext({
			defenseMilestone: council.defenseMilestone,
			periodInfo: council.periodInfo,
			name: council.name,
			location: council.location,
			scheduledDate: council.scheduledDate,
			topic: topic,
			councilId: councilId,
			evaluationTemplateId: council?.evaluationTemplateId
		})
		setOpenEvaluationModal(true)
	}

	const handleOpenCouncilModal = (topic: TopicAssignment) => {
		if (!council) return
		setSelectedContext({
			defenseMilestone: council.defenseMilestone,
			periodInfo: council.periodInfo,
			name: council.name,
			location: council.location,
			scheduledDate: council.scheduledDate,
			topic: topic,
			councilId: councilId,
			evaluationTemplateId: council?.evaluationTemplateId
		})
		setOpenCouncilModal(true)
	}

	const handleOpenCouncilModalForAll = () => {
		if (!council || !council.topics || council.topics.length === 0) {
			toast({
				title: 'Thông báo',
				description: 'Chưa có đề tài nào trong hội đồng',
				variant: 'default'
			})
			return
		}
		// Use first topic as context for council-level minutes
		const firstTopic = council.topics[0]
		// Aggregate all unique members from all topics
		const aggregatedMembers = aggregateCouncilMembers(council)
		setSelectedContext({
			defenseMilestone: council.defenseMilestone,
			periodInfo: council.periodInfo,
			name: council.name,
			location: council.location,
			scheduledDate: council.scheduledDate,
			topic: firstTopic,
			councilId: councilId,
			evaluationTemplateId: council?.evaluationTemplateId,
			allCouncilMembers: aggregatedMembers,
			allTopics: council.topics, // Tất cả đề tài trong hội đồng
			councilComments: council.councilComments || '' // Ý kiến hội đồng
		})
		setShowCouncilMinutesForAll(true)
	}

	const handleCompleteCouncil = async () => {
		try {
			await completeCouncil(councilId).unwrap()
			toast({
				title: 'Thành công',
				description: 'Khóa hội đồng thành công',
				variant: 'default'
			})
			setShowCompleteDialog(false)
		} catch (error: any) {
			toast({
				title: 'Lỗi',
				description: error?.data?.message || 'Không thể khóa hội đồng',
				variant: 'destructive'
			})
		}
	}

	const handlePublishScores = async () => {
		try {
			await publishScores(councilId).unwrap()
			toast({
				title: 'Thành công',
				description: 'Công bố điểm thành công',
				variant: 'default'
			})
			setShowPublishDialog(false)
		} catch (error: any) {
			toast({
				title: 'Lỗi',
				description: error?.data?.message || 'Không thể công bố điểm',
				variant: 'destructive'
			})
		}
	}

	const handleLockTopic = async (topicId: string) => {
		try {
			await lockTopic({ councilId, topicId }).unwrap()
			toast({
				title: 'Thành công',
				description: 'Khóa điểm đề tài thành công',
				variant: 'default'
			})
		} catch (error: any) {
			toast({
				title: 'Lỗi',
				description: error?.data?.message || 'Không thể khóa điểm',
				variant: 'destructive'
			})
		}
	}

	const handleOpenScoreView = (topic: TopicAssignment) => {
		setSelectedTopicForView(topic)
		setShowScoreViewModal(true)
	}

	const handleEditFromScoreView = () => {
		if (selectedTopicForView) {
			setShowScoreViewModal(false)
			handleOpenEvaluationModal(selectedTopicForView)
		}
	}
	// Check if user is assigned to this topic
	const isUserAssigned = (topic: TopicAssignment, userId: string) => {
		return topic.members?.some((m) => m.memberId === userId)
	}

	const handleUnlockTopic = async (topicId: string) => {
		try {
			await unlockTopic({ councilId, topicId }).unwrap()
			toast({
				title: 'Thành công',
				description: 'Mở khóa điểm đề tài thành công',
				variant: 'default'
			})
		} catch (error: any) {
			toast({
				title: 'Lỗi',
				description: error?.data?.message || 'Không thể mở khóa điểm',
				variant: 'destructive'
			})
		}
	}

	const handleExportTemplate = async () => {
		try {
			const blob = await exportTemplate({ councilId, includeScores: false }).unwrap()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `HoiDong_${council?.name}_Mau.xlsx`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			window.URL.revokeObjectURL(url)
			toast({
				title: 'Thành công',
				description: 'Đã tải xuống file mẫu Excel'
			})
		} catch (error: any) {
			toast({
				title: 'Lỗi',
				description: error?.data?.message || 'Không thể tải file mẫu',
				variant: 'destructive'
			})
		}
	}

	const handleExportPdf = async () => {
		try {
			const blob = await exportPdf(councilId).unwrap()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `HoiDong_${council?.name}_BaoCao.pdf`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			window.URL.revokeObjectURL(url)
			toast({
				title: 'Thành công',
				description: 'Đã tải xuống báo cáo PDF'
			})
		} catch (error: any) {
			toast({
				title: 'Lỗi',
				description: error?.data?.message || 'Không thể tải báo cáo PDF',
				variant: 'destructive'
			})
		}
	}
	const getScoreStatus = (topic: any) => {
		if (topic.isLocked) {
			return <Badge variant='secondary'>Đã khóa</Badge>
		}
		if (!topic.scores || topic.scores.length === 0) {
			return <Badge variant='outline'>Chưa nhập</Badge>
		}
		return <Badge variant='default'>Đã nhập</Badge>
	}

	const calculateProgress = () => {
		if (!council?.topics) return 0
		const totalTopics = council.topics.length
		const scoredTopics = council.topics.filter((t) => t.scores && t.scores.length > 0).length
		return totalTopics > 0 ? Math.round((scoredTopics / totalTopics) * 100) : 0
	}

	if (loadingCouncil) {
		return (
			<div className='flex items-center justify-center p-8'>
				<Loader2 className='h-8 w-8 animate-spin' />
			</div>
		)
	}

	if (error) {
		return (
			<div className='p-8 text-center'>
				<p className='text-destructive'>Không thể tải dữ liệu hội đồng</p>
				<p className='mt-2 text-sm text-muted-foreground'>
					{(error as any)?.data?.message || 'Vui lòng thử lại sau'}
				</p>
			</div>
		)
	}

	if (!council) {
		return <div className='p-8 text-center'>Không tìm thấy hội đồng</div>
	}

	const progress = calculateProgress()
	return (
		<div className='space-y-4'>
			{/* Header Actions */}
			<div className='flex items-center justify-between rounded-lg bg-muted p-4'>
				<div>
					<div className='text-lg font-semibold'>{council.name}</div>
					<div className='text-sm text-muted-foreground'>
						Tiến độ: {progress}% ({council.topics.filter((t) => t.scores?.length > 0).length}/
						{council.topics.length} đề tài đã nhập điểm)
					</div>
				</div>
				<div>
					<Button
						className='disabled:opacity-50'
						onClick={handleOpenCouncilModalForAll}
					//	disabled={!isFacultyBoard && !isSecretary}
						// title={
						// 	!isFacultyBoard && !isSecretary
						// 		? 'Chỉ thư ký và CBHD Khoa mới có thể xem biên bản hội đồng'
						// 		: 'Biển bản hội đồng'
						// }
					>
						Xem Biên bản hội đồng
					</Button>
				</div>
				<div className='flex gap-2'>
					{/* Excel Import/Export */}
					{/* {!council.isCompleted && (
						<>
							<Button variant='outline' onClick={handleExportTemplate}>
								<Download className='mr-2 h-4 w-4' />
								Tải mẫu Excel
							</Button>
							<Button variant='outline' onClick={() => setShowImportDialog(true)}>
								<Upload className='mr-2 h-4 w-4' />
								Import Excel
							</Button>
						</>
					)} */}
					{/* PDF Export */}
					{/* {council.isCompleted && (
						<Button variant='outline' onClick={handleExportPdf}>
							<FileDown className='mr-2 h-4 w-4' />
							Tải báo cáo PDF
						</Button>
					)} */}
					{/* {!council.isCompleted && isFacultyBoard && (
						<Button onClick={() => setShowCompleteDialog(true)} disabled={completing || progress < 100}>
							{completing && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
							<Lock className='mr-2 h-4 w-4' />
							Khóa hội đồng
						</Button>
					)} */}
					{/* {council.isCompleted && !council.isPublished && isFacultyBoard && (
						<Button onClick={() => setShowPublishDialog(true)} disabled={publishing}>
							{publishing && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
							Công bố điểm
						</Button>
					)} */}
					{/* {council.isPublished && (
						<Badge variant='default' className='px-4 py-2 text-base'>
							Đã công bố
						</Badge>
					)} */}
				</div>
			</div>
			{/* Status Badges */}
			<div className='flex gap-2'>
				{council.isCompleted && (
					<Badge variant='secondary'>
						<Lock className='mr-1 h-3 w-3' />
						Đã khóa
					</Badge>
				)}
				{council.isPublished && <Badge variant='default'>Đã công bố</Badge>}
			</div>

			{/* Topics Table */}
			<div className='rounded-lg border'>
				{council?.topics && council?.topics.length > 0 ? (
					<Table className='rounded-lg border border-gray-100'>
						<TableHeader className='rounded-ss bg-gray-100'>
							<TableRow>
								<TableHead className='w-16 border-r border-gray-400'>STT</TableHead>
								<TableHead className='border-r border-gray-400'>Đề tài</TableHead>
								<TableHead className='border-r border-gray-400'>Sinh viên</TableHead>
								<TableHead className='border-r border-gray-400'>CBHD</TableHead>
								<TableHead className='border-r border-gray-400'>CBPB</TableHead>
								<TableHead className='border-r border-gray-400 text-center'>Điểm TB</TableHead>
								<TableHead className='border-r border-gray-400 text-center'>Xếp loại</TableHead>
								<TableHead className='border-r border-gray-400 text-center'>Trạng thái</TableHead>
								<TableHead className='text-center'>Thao tác</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{council.topics
								.sort((a, b) => (a.defenseOrder || 0) - (b.defenseOrder || 0))
								.map((topic, index) => (
									<TableRow key={topic.topicId}>
										<TableCell className='font-medium'>{topic.defenseOrder || index + 1}</TableCell>
										<TableCell>
											<div
												className='group cursor-pointer'
												onClick={() =>
													navigate(
														`/detail-topic/${topic.topicId}?from=${encodeURIComponent(location.pathname + location.search)}`
													)
												}
											>
												<div className='font-medium group-hover:underline'>{topic.titleVN}</div>
												{topic.titleEng && (
													<div className='text-sm text-muted-foreground group-hover:underline'>
														{topic.titleEng}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className='text-sm'>
												{topic.students && topic.students.length > 0
													? topic.students.map((s) => s.fullName).join(', ')
													: 'Chưa có SV'}
											</div>
										</TableCell>
										<TableCell>
											<div className='text-sm'>
												{topic.members.some((m) => m.role === CouncilMember.Supervisor) ? (
													topic.members.map((m) => {
														if (m.role === CouncilMember.Supervisor)
															return `${m.title} ${m.fullName}`
													})
												) : topic.lecturers && topic.lecturers.length > 0 ? (
													<span>
														{topic.lecturers
															.map((l) => `${l.title} ${l.fullName}`)
															.join(', ')}
													</span>
												) : (
													'Chưa có GV'
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className='text-sm'>
												{topic.members.some((m) => m.role === CouncilMember.Reviewer) &&
													topic.members.map((m) => {
														if (m.role === CouncilMember.Reviewer)
															return `${m.title} ${m.fullName}`
													})}
											</div>
										</TableCell>

										<TableCell className='text-center font-semibold'>
											{!topic.isAssigned && !isFacultyBoard ? (
												<span className='text-sm font-normal'>Không thể xem</span>
											) : (
												<span>
													{topic.scores &&
														topic.scores.length > 0 &&
														(topic.finalScore ? topic.finalScore.toFixed(2) : '-')}
												</span>
											)}
										</TableCell>
										<TableCell className='text-center'>
											{topic.gradeText && (
												<Badge
													variant={
														topic.gradeText === 'Xuất sắc' || topic.gradeText === 'Giỏi'
															? 'default'
															: 'secondary'
													}
												>
													{!topic.isAssigned && !isFacultyBoard ? (
														<span className='text-sm font-normal'>Không thể xem</span>
													) : (
														topic.gradeText
													)}
												</Badge>
											)}
										</TableCell>
										<TableCell className='text-center'>{getScoreStatus(topic)}</TableCell>
										<TableCell className='text-right'>
											{topic.isAssigned || isFacultyBoard ? (
												<div className='flex justify-end gap-2'>
													{/* View Comprehensive Score Button - for BCN and Secretary */}
													{/* {(isFacultyBoard ||
														topic.members?.some((m) => m.role === 'secretary')) && (
														<Button
															size='sm'
															variant='outline'
															onClick={() => handleOpenScoreView(topic)}
														>
															<Eye className='mr-1 h-4 w-4' />
															Xem tổng hợp
														</Button>
													)} */}

													{/* Edit/View Own Score Button */}
													<Button
														size='sm'
														variant={topic.isLocked ? 'outline' : 'default'}
														onClick={() => handleOpenEvaluationModal(topic)}
														disabled={council.isCompleted && !isFacultyBoard}
													>
														{topic.isLocked ? (
															<>
																<Eye className='mr-1 h-4 w-4' />
																Xem điểm của tôi
															</>
														) : (
															<>
																<Edit className='mr-1 h-4 w-4' />
																{topic.scores?.length > 0 ? 'Sửa điểm' : 'Nhập điểm'}
															</>
														)}
													</Button>

													{/* Lock/Unlock buttons - existing code */}
													{!council.isCompleted &&
														!topic.isLocked &&
														topic.scores?.length > 0 && (
															<Button
																size='sm'
																variant='secondary'
																onClick={() => handleLockTopic(topic.topicId)}
																title='Khóa điểm đề tài này'
															>
																<Lock className='h-4 w-4' />
															</Button>
														)}
													{isFacultyBoard && topic.isLocked && !council.isPublished && (
														<Button
															size='sm'
															variant='outline'
															onClick={() => handleUnlockTopic(topic.topicId)}
															title='Mở khóa điểm đề tài này'
														>
															<Unlock className='h-4 w-4' />
														</Button>
													)}
												</div>
											) : (
												<span className='text-sm text-gray-500'>Bạn không được phân công</span>
											)}
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				) : (
					<div className='border-t bg-white px-6 py-12 text-center'>
						<p className='p-4 text-sm text-gray-500'>Chưa có đề tài nào được phân công.</p>
					</div>
				)}
			</div>

			{/* Score View Modal - Comprehensive view for BCN/Secretary */}
			{selectedTopicForView && (
				<ScoreViewModal
					isOpen={showScoreViewModal}
					onClose={() => {
						setShowScoreViewModal(false)
						setSelectedTopicForView(null)
					}}
					topic={selectedTopicForView}
					canEdit={!council.isCompleted || isFacultyBoard}
					onEdit={handleEditFromScoreView}
				/>
			)}

			{/* Evaluation Form Modal - Individual scoring */}
			{selectedContext && (
				<EvaluationFormModal
					isOpen={openEvaluationModal}
					onClose={() => setOpenEvaluationModal(false)}
					context={selectedContext}
				/>
			)}

			{/* Council Minutes Modal for specific topic */}
			{selectedContext && (
				<CouncilMinutesModal
					isOpen={openCouncilModal}
					onClose={() => setOpenCouncilModal(false)}
					context={selectedContext}
				/>
			)}

			{/* Council Minutes Modal for all topics/council overview */}
			{selectedContext && (
				<CouncilMinutesModal
					isOpen={showCouncilMinutesForAll}
					onClose={() => setShowCouncilMinutesForAll(false)}
					context={selectedContext}
				/>
			)}

			{/* Excel Import Dialog */}
			<ExcelImportDialog
				councilId={councilId}
				open={showImportDialog}
				onClose={() => setShowImportDialog(false)}
				onSuccess={() => {
					toast({
						title: 'Thành công',
						description: 'Import điểm thành công'
					})
					refetch()
					setShowImportDialog(false)
				}}
			/>
			{selectedContext && (
				<EvaluationFormModal
					isOpen={openEvaluationModal}
					onClose={() => setOpenEvaluationModal(false)}
					context={selectedContext}
				/>
			)}

			{/* Complete Council Dialog */}
			<AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận khóa hội đồng</AlertDialogTitle>
						<AlertDialogDescription>
							Sau khi khóa, bạn sẽ không thể chỉnh sửa điểm. Chỉ BCN mới có thể mở khóa lại. Bạn có chắc
							chắn muốn khóa hội đồng này không?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={handleCompleteCouncil}>Xác nhận khóa</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Publish Scores Dialog */}
			<AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận công bố điểm</AlertDialogTitle>
						<AlertDialogDescription>
							Điểm sẽ được hiển thị công khai cho sinh viên và giảng viên. Hệ thống sẽ gửi email thông báo
							tự động. Bạn có chắc chắn muốn công bố điểm không?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={handlePublishScores}>Xác nhận công bố</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
