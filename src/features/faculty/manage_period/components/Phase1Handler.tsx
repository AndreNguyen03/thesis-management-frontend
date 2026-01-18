// Phase1Handler.tsx
import { useEffect, useMemo, useState } from 'react'
import { Button, Badge } from '@/components/ui'
import { Bell, CheckCircle2, Clock } from 'lucide-react'
import type { PeriodPhase, Phase1Response } from '@/models/period-phase.models'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { DeadlineModal } from './modals/DeadlineModal'
import { useSendRemainIssueNotiMutation } from '@/services/notificationApi'

interface ActionDetail {
	id: string
	name: string
	email?: string
	currentCount: number
	requiredCount: number
	missingCount: number
}

interface Action {
	id: string
	label: string
	description: string
	count: number
	totalMissing?: number
	isSent?: boolean
	targetDetails?: ActionDetail[]
	actionType?: 'remind' | 'process' // Để phân biệt loại action
}

const STORAGE_KEY = 'phase1-actions-sent'

export function Phase1Handler({
	data,
	onCompletePhase,
	onProcess,
	phase
}: {
	data: Phase1Response
	onCompletePhase: () => void
	onProcess: () => void
	phase: PeriodPhase
}) {
	const allDone = data.missingTopics.length === 0 && data.pendingTopics.length === 0
	const [loading, setLoading] = useState(false)
	const [confirmNextPhaseOpen, setConfirmNextPhaseOpen] = useState(false)
	const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set())
	const [deadlineModalOpen, setDeadlineModalOpen] = useState(false)
	const [activeActionId, setActiveActionId] = useState<string>('') // Để biết action nào đang xử lý
	const [sentActions, setSentActions] = useState<Set<string>>(new Set())

	const [sendRemainNotification] = useSendRemainIssueNotiMutation()

	// Load trạng thái sent từ localStorage khi mount
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored) {
			try {
				const parsed = JSON.parse(stored) as Set<string>
				setSentActions(new Set(parsed))
			} catch (error) {
				console.error('Lỗi load localStorage:', error)
				localStorage.removeItem(STORAGE_KEY)
			}
		}
	}, [])

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(sentActions)))
	}, [sentActions])
	const { isEnough, totalNeededTopics, currentTopicsNumber } = useMemo(() => {
		const totalNeededTopics = phase.minTopicsPerLecturer! * (phase.requiredLecturers?.length || 0)
		const currentTopicsNumber = data.currentApprovedTopics
		return {
			isEnough: totalNeededTopics <= currentTopicsNumber,
			totalNeededTopics,
			currentTopicsNumber
		}
	}, [phase, data.missingTopics])
	// Map data.missingTopics sang action object
	const actions: Action[] = []
	if (data.missingTopics.length > 0) {
		const isSent = sentActions.has('remind-lecturers')
		actions.push({
			id: 'remind-lecturers',
			label: 'Giảng viên chưa nộp đủ đề tài',
			description: isEnough
				? `Số đề tài đã đạt yêu cầu tối thiểu (${currentTopicsNumber}/${totalNeededTopics}), có thể chuyển pha tiếp theo dù chơi hết thời gian.`
				: 'Nhắc nhở các giảng viên chưa nộp đủ số lượng đề tài yêu cầu',
			count: data.missingTopics.length,
			isSent,
			actionType: 'remind',
			totalMissing: data.missingTopics.reduce((sum, lec) => sum + lec.missingTopicsCount, 0),
			targetDetails: data.missingTopics.map((lec) => ({
				id: lec.userId,
				name: lec.lecturerName,
				email: lec.lecturerEmail,
				currentCount: lec.approvalTopicsCount,
				requiredCount: lec.minTopicsRequired,
				missingCount: lec.missingTopicsCount
			}))
		})
	}

	if (data.pendingTopics.length > 0) {
		actions.push({
			id: 'pending-topics',
			label: 'Đề tài chờ phê duyệt',
			description: 'Các đề tài đã nộp nhưng chưa được xử lý',
			count: data.pendingTopics.length,
			actionType: 'process'
		})
	}

	// Handler khi gửi thành công từ modal (cho remind)
	const handleNotificationSent = async (deadline: string) => {
		if (!activeActionId) return
		setLoading(true)

		// Gọi API gửi nhắc nhở
		try {
			await sendRemainNotification({
				periodId: data.periodId,
				phaseName: data.phase,
				deadline: new Date(deadline)
			}).unwrap()

			// Cập nhật state sent
			setSentActions((prev) => new Set([...prev, activeActionId]))
			setDeadlineModalOpen(false)

			toast({
				title: 'Hoàn tất',
				description: 'Nhắc nhở đã được gửi với deadline đã chọn.'
			})
		} catch (error) {
			console.error(error)
			toast({
				title: 'Lỗi',
				description: 'Gửi nhắc nhở thất bại.',
				variant: 'destructive'
			})
		} finally {
			setLoading(false)
		}
	}

	if (allDone) {
		return (
			<div className='flex flex-col items-center py-8 text-center'>
				<div className='mb-4 rounded-full bg-success/10 p-4'>
					<CheckCircle2 className='h-8 w-8 text-success' />
				</div>
				<p className='text-lg font-medium'>Tất cả tồn đọng đã được xử lý</p>

				<Button onClick={onCompletePhase} className='mt-4'>
					Chuyển pha tiếp theo
				</Button>
			</div>
		)
	}

	return (
		<div className='mx-auto w-[95%] space-y-6'>
			{actions.map((action) => {
				const isExpanded = expandedActions.has(action.id)
				const hasDetails = action.targetDetails && action.targetDetails.length > 0
				const buttonText = action.actionType === 'remind' ? 'Gửi nhắc nhở' : 'Đi Xử lý '
				return (
					<div key={action.id} className={`space-y-2 rounded-lg border p-4 ${'border-gray-200'}`}>
						<div className='flex items-center justify-between gap-4'>
							<div
								className={`rounded-lg border p-2.5 ${
									action.actionType === 'process'
										? 'border-purple-400 bg-purple-50 text-purple-600'
										: 'border-blue bg-blue-100 text-blue-600'
								}`}
							>
								{action.actionType === 'process' ? (
									<Clock className='h-5 w-5' />
								) : (
									<Bell className='h-5 w-5' />
								)}
							</div>
							<div className='flex-1'>
								<div className='mb-1 flex items-center gap-4'>
									<p className='font-semibold'>{action.label}</p>
									{action.totalMissing && action.totalMissing > 0 && (
										<Badge variant='destructive'>Thiếu {action.totalMissing} đề tài</Badge>
									)}
								</div>
								<p className='text-sm text-muted-foreground'>{action.description}</p>
							</div>
							<div className='flex flex-col gap-2'>
								<Button
									variant='default'
									onClick={() => {
										setActiveActionId(action.id)
										if (action.actionType === 'remind') {
											setDeadlineModalOpen(true)
										} else if (action.actionType === 'process') {
											onProcess()
										}
									}}
									disabled={loading}
									className='h-fit w-fit px-2 py-2'
								>
									{loading ? 'Đang xử lý...' : buttonText}
								</Button>
								{isEnough && (
									<Button className='h-fit w-fit px-2 py-2' onClick={onCompletePhase}>
										Có thể chuyển pha
									</Button>
								)}
							</div>
						</div>

						{hasDetails && (
							<Collapsible
								open={isExpanded}
								onOpenChange={(open) => {
									setExpandedActions((prev) => {
										const next = new Set(prev)
										if (open) next.add(action.id)
										else next.delete(action.id)
										return next
									})
								}}
							>
								<CollapsibleTrigger asChild>
									<Button variant='ghost' size='sm' className='mt-2 h-7 text-xs'>
										{isExpanded ? (
											<>
												<ChevronUp className='mr-1 h-3 w-3' />
												Ẩn chi tiết
											</>
										) : (
											<>
												<ChevronDown className='mr-1 h-3 w-3' />
												Xem chi tiết ({action.targetDetails!.length} người)
											</>
										)}
									</Button>
								</CollapsibleTrigger>
								<CollapsibleContent className='mt-3'>
									<div className='overflow-hidden rounded-md border bg-muted/30'>
										<div className='overflow-x-auto'>
											<table className='w-full text-sm'>
												<thead className='bg-muted/50'>
													<tr>
														<th className='p-2 text-left font-medium'>Tên</th>
														<th className='p-2 text-center font-medium'>Hiện có</th>
														<th className='p-2 text-center font-medium'>Yêu cầu</th>
														<th className='p-2 text-center font-medium'>Thiếu</th>
													</tr>
												</thead>
												<tbody>
													{action.targetDetails!.map((d) => (
														<tr key={d.id} className='border-t'>
															<td className='p-2'>
																<p className='font-medium'>{d.name}</p>
																{d.email && (
																	<p className='text-xs text-muted-foreground'>
																		{d.email}
																	</p>
																)}
															</td>
															<td className='p-2 text-center text-muted-foreground'>
																{d.currentCount}
															</td>
															<td className='p-2 text-center text-muted-foreground'>
																{d.requiredCount}
															</td>
															<td className='p-2 text-center'>
																<Badge
																	variant={
																		d.missingCount > 0 ? 'destructive' : 'secondary'
																	}
																>
																	{d.missingCount}
																</Badge>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</CollapsibleContent>
							</Collapsible>
						)}
					</div>
				)
			})}

			<DeadlineModal
				open={deadlineModalOpen}
				onOpenChange={setDeadlineModalOpen}
				onSend={handleNotificationSent}
			/>

			{/* Dialog chuyển pha */}
			<Dialog open={confirmNextPhaseOpen} onOpenChange={setConfirmNextPhaseOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Chuyển pha tiếp theo</DialogTitle>
					</DialogHeader>
					<p>Bạn có chắc muốn chuyển sang pha tiếp theo?</p>
					<DialogFooter className='flex gap-2'>
						<Button variant='secondary' onClick={() => setConfirmNextPhaseOpen(false)}>
							Hủy
						</Button>
						<Button disabled={loading} onClick={onCompletePhase}>
							{loading ? 'Đang xử lý...' : 'Chuyển'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
