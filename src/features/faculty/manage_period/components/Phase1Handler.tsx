// Phase1Handler.tsx
import { useState } from 'react'
import { Button, Badge } from '@/components/ui'
import { Bell, CheckCircle2 } from 'lucide-react'
import type { Phase1Response } from '@/models/period-phase.models'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react'

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
	severity: 'info' | 'warning' | 'critical'
	type: 'send_reminder' | 'request_documents'
	isSent?: boolean
	targetDetails?: ActionDetail[]
}

export function Phase1Handler({ data, onCompletePhase }: { data: Phase1Response; onCompletePhase: () => void }) {
	const allDone = data.missingTopics.length === 0 && data.pendingTopics === 0
	const [loading, setLoading] = useState(false)
	const [confirmReminderOpen, setConfirmReminderOpen] = useState(false)
	const [confirmNextPhaseOpen, setConfirmNextPhaseOpen] = useState(false)
	const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set())

	// Map data.missingTopics sang action object
	const actions: Action[] = []
	if (data.missingTopics.length > 0) {
		actions.push({
			id: 'remind-lecturers',
			label: 'Giảng viên chưa nộp đủ đề tài',
			description: 'Nhắc nhở các giảng viên chưa nộp đủ số lượng đề tài yêu cầu',
			count: data.missingTopics.length,
			severity: 'warning',
			type: 'send_reminder',
			totalMissing: data.missingTopics.reduce((sum, lec) => sum + lec.missingTopicsCount, 0),
			targetDetails: data.missingTopics.map((lec) => ({
				id: lec.lecturerId,
				name: lec.lecturerName,
				email: lec.lecturerEmail,
				currentCount: lec.submittedTopicsCount,
				requiredCount: lec.minTopicsRequired,
				missingCount: lec.missingTopicsCount
			}))
		})
	}

	if (data.pendingTopics > 0) {
		actions.push({
			id: 'pending-topics',
			label: 'Đề tài chờ phê duyệt',
			description: 'Các đề tài đã nộp nhưng chưa được xử lý',
			count: data.pendingTopics,
			severity: 'info',
			type: 'send_reminder'
		})
	}

	const handleSendReminder = async () => {
		setLoading(true)
		await new Promise((r) => setTimeout(r, 1200))
		setLoading(false)
		setConfirmReminderOpen(false)
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
		<div className='space-y-6'>
			{actions.map((action) => {
				const isExpanded = expandedActions.has(action.id)
				const hasDetails = action.targetDetails && action.targetDetails.length > 0
				return (
					<div key={action.id} className='space-y-2 rounded-lg border p-4'>
						<div className='flex items-center justify-between'>
							<div className='flex-1'>
								<p className='font-medium'>{action.label}</p>
								<p className='text-sm text-muted-foreground'>{action.description}</p>
								{action.totalMissing && action.totalMissing > 0 && (
									<Badge variant='destructive'>Thiếu {action.totalMissing} đề tài</Badge>
								)}
							</div>
							<Button
								variant='secondary'
								className='bg-info/10 text-info border-info/20'
								onClick={() => setConfirmReminderOpen(true)}
							>
								<Bell className='mr-2 h-4 w-4' />
								Gửi nhắc nhở
							</Button>
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

			{/* Dialog nhắc nhở */}
			<Dialog open={confirmReminderOpen} onOpenChange={setConfirmReminderOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Gửi nhắc nhở</DialogTitle>
					</DialogHeader>
					<p>Bạn có chắc muốn gửi nhắc nhở?</p>
					<DialogFooter className='flex gap-2'>
						<Button variant='secondary' onClick={() => setConfirmReminderOpen(false)}>
							Hủy
						</Button>
						<Button disabled={loading} onClick={handleSendReminder}>
							{loading ? 'Đang gửi...' : 'Gửi'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

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
