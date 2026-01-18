import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Download, X, Loader2 } from 'lucide-react'
import type { DefenseMilestoneDto, TopicAssignment } from '@/models/defenseCouncil.model'
import type { MiniPeriod } from '@/models/period.model'
import {
	useGetEvaluationTemplateQuery,
	useSubmitDetailedScoresMutation,
	useGetMyScoreForTopicQuery,
	useLazyExportEvaluationFormPdfQuery
} from '@/services/defenseCouncilApi'
import { useToast } from '@/hooks/use-toast'
import type { ScoreState } from '@/models/criterion.models'
import { useAppSelector } from '@/store'
import { getUserIdFromAppUser } from '@/utils/utils'

interface ContextData {
	defenseMilestone: DefenseMilestoneDto
	periodInfo: MiniPeriod
	name: string
	location: string
	scheduledDate: Date
	topic: TopicAssignment
	councilId: string
	evaluationTemplateId?: string
}

interface EvaluationFormModalProps {
	isOpen: boolean
	onClose: () => void
	context?: ContextData
}

export function EvaluationFormModal({ isOpen, onClose, context }: EvaluationFormModalProps) {
	const [selectedStudent, setSelectedStudent] = useState<number>(0)
	const [scores, setScores] = useState<ScoreState>({})
	const { toast } = useToast()

	// Fetch evaluation template
	const {
		data: templateData,
		isLoading: isLoadingTemplate,
		error: templateError
	} = useGetEvaluationTemplateQuery(context?.evaluationTemplateId || '', {
		skip: !context?.evaluationTemplateId
	})

	// Add state to track current user's role
	const user = useAppSelector((state) => state.auth.user)
	const userId = getUserIdFromAppUser(user)

	// Submit mutation
	const [submitScores, { isLoading: isSubmitting }] = useSubmitDetailedScoresMutation()

	// Export PDF mutation
	const [triggerExportPdf, { isLoading: isDownloadingPdf }] = useLazyExportEvaluationFormPdfQuery()

	// Fetch existing scores for all students in topic
	const { data: existingScoresData } = useGetMyScoreForTopicQuery(
		{
			councilId: context?.councilId || '',
			topicId: context?.topic.topicId || ''
		},
		{
			skip: !context?.councilId || !context?.topic.topicId
		}
	)
	// Track initial scores for change detection
	const [initialScores, setInitialScores] = useState<ScoreState>({})
	// Load existing score for selected student when data arrives or student changes
	useEffect(() => {
		if (!context?.topic.students?.[selectedStudent]) {
			setScores({})
			return
		}

		const currentStudentId = context.topic.students[selectedStudent].userId

		// First check existingScoresData from API
		if (existingScoresData?.data) {
			const studentScore = existingScoresData.data.find((item) => item.studentId === currentStudentId)

			if (studentScore?.scoreState) {
				// Deep clone to avoid mutation of frozen RTK Query object
				const clonedScoreState: ScoreState = {}
				Object.keys(studentScore.scoreState).forEach((criterionId) => {
					clonedScoreState[criterionId] = {
						mainScore: studentScore.scoreState[criterionId].mainScore,
						subScores: { ...studentScore.scoreState[criterionId].subScores }
					}
				})

				setScores(clonedScoreState)
				setInitialScores(clonedScoreState)
				return
			}
		}

		// Fallback: check context scores (from defense council data)
		const contextScore = context?.topic.scores?.find(
			(s) => s.scorerId === userId && s.studentId === currentStudentId
		)

		if (contextScore?.detailedScores) {
			const loadedScores: ScoreState = {}

			contextScore.detailedScores.forEach((detailedScore) => {
				// Skip entries that have subcriterionId - we'll handle them next
				if (detailedScore.subcriterionId) {
					if (!loadedScores[detailedScore.criterionId]) {
						loadedScores[detailedScore.criterionId] = {
							mainScore: null,
							subScores: {}
						}
					}
					loadedScores[detailedScore.criterionId].subScores[detailedScore.subcriterionId] =
						detailedScore.score
				} else {
					// This is a main criterion score
					if (!loadedScores[detailedScore.criterionId]) {
						loadedScores[detailedScore.criterionId] = {
							mainScore: detailedScore.score,
							subScores: {}
						}
					} else {
						loadedScores[detailedScore.criterionId].mainScore = detailedScore.score
					}
				}
			})

			setScores(loadedScores)
			setInitialScores(loadedScores)
			return
		}

		// No score found for this student, reset form
		setScores({})
		setInitialScores({})
	}, [existingScoresData?.data, selectedStudent, context?.topic.students, userId])
	// // localStorage auto-save hook
	// const { draftData, saveDraft, clearDraft, lastSaved, isExpired } = useEvaluationDraft({
	// 	councilId: context?.councilId || '',
	// 	topicId: context?.topic.topicId || '',
	// 	userId,
	// 	studentIndex: selectedStudent,
	// 	autoSaveDelay: 3000
	// })

	// // Load draft from localStorage on mount
	// useEffect(() => {
	// 	if (draftData && !isExpired) {
	// 		const loadedScores: ScoreState = {}
	// 		draftData.detailedScores.forEach((detailedScore) => {
	// 			loadedScores[detailedScore.criterionId] = {
	// 				mainScore: detailedScore.score,
	// 				subScores:
	// 					detailedScore.subScores?.reduce(
	// 						(acc, sub) => {
	// 							acc[sub.subCriterionId] = sub.score
	// 							return acc
	// 						},
	// 						{} as { [key: string]: number | null }
	// 					) || {}
	// 			}
	// 		})
	// 		setScores(loadedScores)
	// 	}
	// }, [draftData, isExpired])

	// // Auto-save to localStorage when scores change
	// useEffect(() => {
	// 	if (Object.keys(scores).length > 0 && context?.topic.students?.[selectedStudent]) {
	// 		const detailedScores = Object.entries(scores).map(([criterionId, data]) => ({
	// 			criterionId,
	// 			score: data.mainScore || 0,
	// 			subScores: Object.entries(data.subScores).map(([subCriterionId, score]) => ({
	// 				subCriterionId,
	// 				score: score || 0
	// 			}))
	// 		}))

	// 		const totalScore = calculateTotalScore()

	// 		saveDraft({
	// 			studentId: context.topic.students[selectedStudent].userId,
	// 			detailedScores,
	// 			totalScore
	// 		})
	// 	}
	// }, [scores, selectedStudent, context, saveDraft])

	// Calculate total score
	const calculateTotalScore = (): number => {
		return Object.values(scores).reduce((sum, criterion) => sum + (criterion.mainScore || 0), 0)
	}

	// Calculate category sum from subcriteria (accepts scoreState object)
	const calculateCategorySum = (criterionId: string, scoreState: ScoreState = scores): number => {
		const criterion = scoreState[criterionId]
		if (!criterion?.subScores) return 0
		return Object.values(criterion.subScores).reduce((sum, score) => (sum ?? 0) + (score ?? 0), 0) ?? 0
	}

	const isScoresChanged = useMemo(() => {
		const keys = new Set([...Object.keys(initialScores), ...Object.keys(scores)])
		for (const key of keys) {
			const a = initialScores[key]
			const b = scores[key]
			if (!a && !b) continue
			if (!a || !b) return true
			if (a.mainScore !== b.mainScore) return true
			const subKeys = new Set([
				...(a.subScores ? Object.keys(a.subScores) : []),
				...(b.subScores ? Object.keys(b.subScores) : [])
			])
			for (const subKey of subKeys) {
				if ((a.subScores?.[subKey] ?? null) !== (b.subScores?.[subKey] ?? null)) return true
			}
		}
		return false
	}, [initialScores, scores])

	// Handle score input change
	const handleScoreChange = (
		criterionId: string,
		value: string,
		isSubCriterion: boolean = false,
		subCriterionId?: string
	) => {
		const numValue = value === '' ? null : parseFloat(value)
		setScores((prev) => {
			if (!isSubCriterion || !subCriterionId) {
				// Update mainScore immutably
				return {
					...prev,
					[criterionId]: {
						...prev[criterionId],
						mainScore: numValue,
						subScores: { ...(prev[criterionId]?.subScores || {}) }
					}
				}
			} else {
				// Update subScore immutably, then recalculate mainScore
				const newSubScores = {
					...(prev[criterionId]?.subScores || {}),
					[subCriterionId]: numValue
				}
				const newMainScore = calculateCategorySum(criterionId, {
					...prev,
					[criterionId]: {
						...prev[criterionId],
						subScores: newSubScores
					}
				})
				return {
					...prev,
					[criterionId]: {
						...prev[criterionId],
						subScores: newSubScores,
						mainScore: newMainScore
					}
				}
			}
		})
	}

	// Get current student score for UI display
	const currentStudentScore = context?.topic.scores?.find(
		(s) => s.scorerId === userId && s.studentId === context?.topic.students?.[selectedStudent]?.userId
	)

	// Submit final scores
	const handleSubmit = async () => {
		if (!context?.councilId || !context?.topic.topicId || !context?.topic.students?.[selectedStudent]) {
			toast({ title: 'Lỗi', description: 'Thiếu thông tin cần thiết', variant: 'destructive' })
			return
		}

		// Build flat array matching database structure
		const detailedScores: any[] = []

		templateData?.criteria.forEach((criterion) => {
			const criterionScore = scores[criterion.id]

			// Add each subcriterion first (if exists)
			if (criterion.subcriteria && criterion.subcriteria.length > 0) {
				criterion.subcriteria.forEach((sub) => {
					detailedScores.push({
						criterionId: criterion.id,
						subcriterionId: sub.id,
						score: criterionScore?.subScores?.[sub.id] ?? 0,
						maxScore: sub.maxScore,
						elo: sub.elos
					})
				})
			}

			// Add main criterion score last
			detailedScores.push({
				criterionId: criterion.id,
				score: criterionScore?.mainScore ?? 0,
				maxScore: criterion.maxScore,
				elo: criterion.elos
			})
		})

		const totalScore = calculateTotalScore()

		try {
			await submitScores({
				councilId: context.councilId,
				topicId: context.topic.topicId,
				payload: {
					studentId: context.topic.students[selectedStudent].userId,
					detailedScores,
					totalScore
				}
			}).unwrap()

			toast({ title: 'Thành công', description: 'Đã lưu điểm đánh giá' })
			onClose()
		} catch (error: any) {
			toast({
				title: 'Lỗi',
				description: error?.data?.message || 'Không thể lưu điểm',
				variant: 'destructive'
			})
		}
	}

	// Handle download PDF - xuất phiếu cho tất cả sinh viên
	const handleDownload = async () => {
		if (!context?.councilId || !context?.topic.topicId) {
			toast({ title: 'Lỗi', description: 'Thiếu thông tin cần thiết', variant: 'destructive' })
			return
		}

		// Check if user has submitted scores for at least one student
		const hasAnyScore = existingScoresData?.data && existingScoresData.data.length > 0

		if (!hasAnyScore) {
			toast({
				title: 'Chưa có điểm',
				description: 'Vui lòng chấm điểm và lưu trước khi tải xuống',
				variant: 'destructive'
			})
			return
		}

		try {
			const blob = await triggerExportPdf({
				councilId: context.councilId,
				topicId: context.topic.topicId
			}).unwrap()

			// Create download link
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url

			// Generate filename
			const topicId = context.topic.topicId.substring(0, 8)
			a.download = `PhieuDanhGia_${topicId}.pdf`

			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			window.URL.revokeObjectURL(url)

			toast({ title: 'Thành công', description: 'Đã tải xuống phiếu đánh giá' })
		} catch (error: any) {
			toast({
				title: 'Lỗi',
				description: error?.data?.message || 'Không thể tải xuống phiếu đánh giá',
				variant: 'destructive'
			})
		}
	}

	// Show loading state
	if (isLoadingTemplate) {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className='max-w-md'>
					<div className='py-8 text-center'>Đang tải mẫu đánh giá...</div>
				</DialogContent>
			</Dialog>
		)
	}

	// Show error state
	if (templateError || !templateData) {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className='max-w-md'>
					<DialogTitle>Phiếu đánh giá tốt nghiệp</DialogTitle>
					<div className='space-y-4 py-8 text-center'>
						<p className='text-destructive'>Không thể tải mẫu đánh giá</p>
						{!context?.evaluationTemplateId && (
							<p className='text-sm text-muted-foreground'>
								Hội đồng này chưa được gán mẫu đánh giá. Vui lòng liên hệ ban chủ nhiệm để cập nhật.
							</p>
						)}
						{templateError && (
							<p className='text-sm text-muted-foreground'>
								{(templateError as any)?.data?.message || 'Lỗi kết nối'}
							</p>
						)}
					</div>
				</DialogContent>
			</Dialog>
		)
	}

	const evaluationData = {
		decisionNumber: 'Quyết định số XYZ-2024/QĐ-KLTN',
		decisionDate: '___/___/2024',
		councilMeetingDate: context?.scheduledDate?.toLocaleString('vi-VN'),
		thesisTitle: context?.topic.titleVN,
		students:
			context?.topic.students?.map((student) => ({
				userId: student.userId,
				name: student.fullName,
				code: student.studentCode
			})) || []
	}

	const handleChangeStudentScoring = (index: number) => {
		// Show confirm dialog before switching student if there are unsaved changes
		if (isScoresChanged) {
			const confirmSwitch = window.confirm(
				'Bạn có thay đổi chưa lưu. Bạn có chắc muốn chuyển sang sinh viên khác?'
			)
			if (!confirmSwitch) return
		}
		setSelectedStudent(index)
	}
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				className='max-h-[90vh] w-full max-w-3xl overflow-y-auto border-border bg-card pb-6 pl-6 pr-6 pt-0'
				hideClose
			>
				<DialogHeader className='sticky top-0 z-10 bg-card pb-4 pt-6'>
					<DialogTitle className='text-2xl font-bold text-foreground'>
						Phiếu Đánh giá Khóa luận Tốt nghiệp
					</DialogTitle>
					<div className='mt-2 flex items-start justify-between gap-4'>
						<p className='text-sm text-muted-foreground'>{templateData.name} | Khoa Công nghệ Thông tin</p>
						<button onClick={onClose}>
							<X />
						</button>
					</div>
				</DialogHeader>

				<Separator className='bg-border' />

				{/* Decision Info */}
				<div className='space-y-3'>
					<div className='grid gap-3 sm:grid-cols-2'>
						<div className='rounded-lg bg-secondary/30 p-3'>
							<p className='text-xs font-semibold text-muted-foreground'>QUYẾT ĐỊNH THÀNH LẬP HỘI ĐỒNG</p>
							<p className='mt-1 font-medium text-foreground'>{evaluationData.decisionNumber}</p>
						</div>
						<div className='rounded-lg bg-secondary/30 p-3'>
							<p className='text-xs font-semibold text-muted-foreground'>NGÀY HỌP HỘI ĐỒNG</p>
							<p className='mt-1 font-medium text-foreground'>
								{new Date(evaluationData.councilMeetingDate!).toLocaleString('vi-VN')}
							</p>
						</div>
					</div>
				</div>

				{/* Thesis Info */}
				<div className='rounded-lg border border-border bg-secondary/10 p-4'>
					<p className='text-xs font-semibold text-muted-foreground'>ĐỀ TÀI KHÓA LUẬN</p>
					<p className='mt-2 font-medium text-foreground'>{evaluationData.thesisTitle}</p>
				</div>

				{/* Student Selection */}
				<div className='flex flex-col gap-1'>
					<p className='mb-3 text-sm font-semibold text-muted-foreground'>
						SINH VIÊN/NHÓM SINH VIÊN THỰC HIỆN
					</p>
					<div className='flex flex-wrap gap-2'>
						{evaluationData.students?.map((student, index) => (
							<Button
								key={index}
								onClick={() => handleChangeStudentScoring(index)}
								variant={selectedStudent === index ? 'default' : 'outline'}
								className={
									selectedStudent === index
										? 'bg-primary text-primary-foreground'
										: 'border-border text-foreground'
								}
							>
								<span className='font-medium'>{student.code}.</span>
								<span className='font-medium'>{student.name}</span>
								<span className='ml-2 text-xs opacity-70'>
									(
									{existingScoresData?.data?.some((c) => c.scoreState !== null)
										? 'Đã chấm'
										: 'Chưa chấm'}
									)
								</span>
							</Button>
						))}
					</div>
					<Button
						variant='outline'
						className='w-fit border-border bg-transparent text-foreground hover:bg-secondary'
						onClick={handleDownload}
						disabled={isDownloadingPdf || !existingScoresData?.data || existingScoresData.data.length === 0}
					>
						{isDownloadingPdf ? (
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
						) : (
							<Download className='mr-2 h-4 w-4' />
						)}
						{isDownloadingPdf ? 'Đang tải...' : 'Tải xuống'}
					</Button>
				</div>

				{/* Evaluation Criteria - Table */}
				<div className='space-y-4'>
					<p className='text-sm font-semibold text-muted-foreground'>
						PHẦN CHẤM ĐIỂM DÀNH CHO THÀNH VIÊN HỘI ĐỒNG
					</p>

					<div className='overflow-x-auto rounded-lg border border-border'>
						<Table>
							<TableHeader>
								<TableRow className='bg-secondary/30'>
									<TableHead className='w-16 text-center font-bold'>STT</TableHead>
									<TableHead className='min-w-[300px] font-bold'>Tiêu chí</TableHead>
									<TableHead className='w-32 text-center font-bold'>
										Điểm SV{selectedStudent + 1}
									</TableHead>
									<TableHead className='w-32 text-center font-bold'>ELOs</TableHead>
								</TableRow>
							</TableHeader>
							{isLoadingTemplate ? (
								<Loader2 className='m-4 h-6 w-6 animate-spin text-muted-foreground' />
							) : (
								<TableBody>
									{templateData.criteria.map((criterion, criterionIdx) => {
										const criterionScore = scores[criterion.id]
										const categorySum = calculateCategorySum(criterion.id)
										const categoryError =
											criterionScore?.mainScore !== null &&
											categorySum !== criterionScore?.mainScore

										return (
											<>
												{/* Main Category Row */}
												<TableRow
													key={`cat-${criterionIdx}`}
													className='bg-secondary/10 font-semibold'
												>
													<TableCell className='text-center'>{criterionIdx + 1}.</TableCell>
													<TableCell>
														<div className='font-bold'>{criterion.category}</div>
													</TableCell>
													<TableCell className='text-center'>
														<Input
															type='number'
															min={0}
															disabled={true}
															max={criterion.maxScore}
															step={0.1}
															value={criterionScore?.mainScore ?? ''}
															onChange={(e) =>
																handleScoreChange(criterion.id, e.target.value, false)
															}
															className={`w-20 text-center ${categoryError ? 'border-red-500' : ''}`}
															placeholder='0.0'
														/>
														<span className='ml-1'>/ {criterion.maxScore.toFixed(1)}</span>
														{categoryError && (
															<div className='text-xs text-red-500'>
																Tổng tiêu chí con: {categorySum.toFixed(1)}
															</div>
														)}
													</TableCell>
													<TableCell className='text-center text-sm'>
														{criterion.elos}
													</TableCell>
												</TableRow>

												{/* Subcriteria Rows */}
												{criterion.subcriteria?.map((sub, subIdx) => (
													<TableRow
														key={`sub-${criterionIdx}-${subIdx}`}
														className='hover:bg-secondary/5'
													>
														<TableCell className='text-center text-sm text-muted-foreground'>
															{criterionIdx + 1}.{subIdx + 1}
														</TableCell>
														<TableCell className='pl-6 text-sm'>{sub.name}</TableCell>
														<TableCell className='text-center text-sm'>
															<Input
																type='number'
																min={0}
																max={sub.maxScore}
																step={0.1}
																value={criterionScore?.subScores?.[sub.id] ?? ''}
																onChange={(e) =>
																	handleScoreChange(
																		criterion.id,
																		Number(e.target.value) <= sub.maxScore
																			? e.target.value
																			: sub.maxScore.toString(),
																		true,
																		sub.id
																	)
																}
																className='w-20 text-center'
																placeholder='0.0'
															/>
															<span className='ml-1'>/ {sub.maxScore.toFixed(1)}</span>
														</TableCell>
														<TableCell className='text-center text-sm'>
															{sub.elos}
														</TableCell>
													</TableRow>
												))}
											</>
										)
									})}
								</TableBody>
							)}
						</Table>
					</div>
				</div>

				{/* Total Score */}
				<Card className='p-0'>
					<CardHeader className='pb-2'>
						<div className='flex items-center justify-between'>
							<CardTitle className='text-[16px] text-foreground'>
								Điểm tổng kết ({evaluationData.students?.[selectedStudent]?.name})
							</CardTitle>
							<Badge
								className={`px-2 py-1 text-lg ${calculateTotalScore() > 10 ? 'bg-red-500' : 'bg-primary'}`}
							>
								{calculateTotalScore().toFixed(2)} / 10.00
							</Badge>
						</div>
					</CardHeader>
				</Card>
				{/* Show total score info */}
				<Card className='bg-muted p-0'>
					<CardContent className='p-4'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-muted-foreground'>Điểm của sinh viên</p>
								<p className='text-2xl font-bold'>{calculateTotalScore().toFixed(2)} / 10.00</p>
							</div>
							<div className='text-right'>
								<p className='text-sm text-muted-foreground'>Trạng thái</p>
								<Badge variant={currentStudentScore ? 'default' : 'outline'}>
									{currentStudentScore ? 'Đã chấm' : 'Chưa chấm'}
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>
				{/* Actions */}
				<div className='flex gap-2'>
					<Button
						className='flex-1 bg-primary text-primary-foreground hover:bg-primary/90'
						onClick={handleSubmit}
						disabled={
							isSubmitting || calculateTotalScore() > 10 || !isScoresChanged || context?.topic.isLocked
						}
					>
						<CheckCircle2 className='mr-2 h-4 w-4' />
						{context?.topic.isLocked ? 'Không thể chỉnh sửa' : isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
