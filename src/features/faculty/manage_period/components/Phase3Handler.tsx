import { useEffect, useState } from 'react'
import { Button, Badge } from '@/components/ui'
import { Bell, CheckCircle2 } from 'lucide-react'
import type { Phase3Response } from '@/models/period-phase.models'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { DeadlineModal } from './modals/DeadlineModal'

import { useSendRemainIssueNotiMutation } from '@/services/notificationApi' // import mutation RTK Query
const STORAGE_KEY = 'phase3-actions-sent'

export function Phase3Handler({ data, onCompletePhase }: { data: Phase3Response; onCompletePhase: () => void }) {
	const [sendRemainNotification] = useSendRemainIssueNotiMutation()
	console.log('data overdue topics', data.overdueTopics)
	const noOverdue = data.overdueTopics.length === 0
	const [loading, setLoading] = useState(false)
	const [deadlineModalOpen, setDeadlineModalOpen] = useState(false)
	const [sentActions, setSentActions] = useState<Set<string>>(new Set())
	const [expanded, setExpanded] = useState(false)
	const actionId = 'remind-overdue-topics'
	// Load sent actions
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored) {
			try {
				setSentActions(new Set(JSON.parse(stored)))
			} catch {
				localStorage.removeItem(STORAGE_KEY)
			}
		}
	}, [])

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(sentActions)))
	}, [sentActions])

	// Khi gửi nhắc nhở
	const handleNotificationSent = async (deadline: string) => {
		if (sentActions.has(actionId)) return
		setLoading(true)
		setDeadlineModalOpen(false)

		try {
			await sendRemainNotification({
				periodId: data.periodId,
				phaseName: data.phase,
				deadline: new Date(deadline)
			}).unwrap()

			setSentActions((prev) => new Set([...prev, actionId]))
			toast({
				title: 'Hoàn tất',
				description: `Nhắc nhở cập nhật tài liệu đề tài đã được gửi (deadline: ${deadline}).`
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

	// Nếu không có đề tài quá hạn → giống Phase1
	if (noOverdue) {
		return (
			<div className='flex flex-col items-center py-8 text-center'>
				<div className='mb-4 rounded-full bg-success/10 p-4'>
					<CheckCircle2 className='h-8 w-8 text-success' />
				</div>
				<p className='text-lg font-medium'>Không có đề tài nào quá hạn xử lý</p>

				<Button onClick={onCompletePhase} className='mt-4'>
					Chuyển pha tiếp theo
				</Button>
			</div>
		)
	}

	const isSent = sentActions.has(actionId)

	return (
		<div className='mx-auto w-[95%] space-y-6'>
			<div
				className={`space-y-2 rounded-lg border p-4 ${
					isSent ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
				}`}
			>
				{/* Header */}
				<div className='flex items-center justify-between gap-4'>
					<div
						className={`rounded-lg border p-2.5 ${
							isSent
								? 'border-yellow bg-yellow-100 text-yellow-600'
								: 'border-red-400 bg-red-50 text-red-600'
						}`}
					>
						<Bell className='h-5 w-5' />
					</div>

					<div className='flex-1'>
						<div className='mb-1 flex items-center gap-4'>
							<p className='font-semibold'>Đề tài thiếu tài liệu</p>
							<Badge variant='destructive'>{data.overdueTopics.length} đề tài</Badge>
							{isSent && <Badge variant='secondary'>Đang chờ</Badge>}
						</div>
						<p className='text-sm text-muted-foreground'>
							Các đề tài còn thiếu tài liệu và cần được giảng viên hoặc sinh viên hoàn thành.
						</p>
					</div>

					{isSent ? (
						<Button variant='secondary' disabled>
							Đã nhắc nhở
						</Button>
					) : (
						<Button onClick={() => setDeadlineModalOpen(true)} disabled={loading}>
							{loading ? 'Đang xử lý...' : 'Gửi nhắc nhở'}
						</Button>
					)}
				</div>

				{/* Details table */}
				<Collapsible open={expanded} onOpenChange={setExpanded}>
					<CollapsibleTrigger asChild>
						<Button variant='ghost' size='sm' className='mt-2 h-7 text-xs'>
							{expanded ? (
								<>
									<ChevronUp className='mr-1 h-3 w-3' />
									Ẩn chi tiết
								</>
							) : (
								<>
									<ChevronDown className='mr-1 h-3 w-3' />
									Xem chi tiết ({data.overdueTopics.length} đề tài)
								</>
							)}
						</Button>
					</CollapsibleTrigger>

					<CollapsibleContent className='mt-3'>
						<div className='overflow-hidden rounded-md border bg-muted/30'>
							<table className='w-full text-sm'>
								<thead className='bg-muted/50'>
									<tr>
										<th className='p-2 text-left font-medium'>Tên đề tài</th>
										<th className='p-2 text-left font-medium'>Giảng viên</th>
										<th className='p-2 text-left font-medium'>Sinh viên</th>
									</tr>
								</thead>
								<tbody>
									{data.overdueTopics.map((t) => (
										<tr key={t.topicId} className='border-t'>
											<td className='p-2 font-medium'>{t.title}</td>
											<td className='p-2'>
												<p className='font-medium'>{t.lecturerId}</p>
												<p className='text-xs text-muted-foreground'>{t.lecturerEmail}</p>
											</td>
											<td className='p-2'>
												{t.studentIds.map((s, idx) => (
													<p key={s} className='text-xs'>
														{s} - {t.studentEmails[idx]}
													</p>
												))}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CollapsibleContent>
				</Collapsible>
			</div>

			{/* Deadline Modal */}
			<DeadlineModal
				open={deadlineModalOpen}
				onOpenChange={setDeadlineModalOpen}
				onSend={handleNotificationSent}
			/>
		</div>
	)
}
