// Phase3Handler.tsx
import { useState } from 'react'
import { Button } from '@/components/ui'
import { Bell } from 'lucide-react'
import type { Phase3Response } from '@/models/period-phase.models'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'

export function Phase3Handler({ data, onCompletePhase }: { data: Phase3Response; onCompletePhase: () => void }) {
	const { overdueTopics } = data
	const allDone = overdueTopics.length === 0
	const [loading, setLoading] = useState(false)
	const [reminderOpen, setReminderOpen] = useState(false)
	const [nextPhaseOpen, setNextPhaseOpen] = useState(false)

	const handleReminder = async () => {
		setLoading(true)
		await new Promise((r) => setTimeout(r, 1200))
		setLoading(false)
		setReminderOpen(false)
	}

	const handleNextPhase = async () => {
		setLoading(true)
		await new Promise((r) => setTimeout(r, 1200))
		setLoading(false)
		setNextPhaseOpen(false)
		onCompletePhase()
	}

	if (allDone) {
		return (
			<div className='flex flex-col items-center py-8 text-center'>
				<p className='text-lg font-medium'>Không còn đề tài quá hạn</p>
				<Button onClick={() => setNextPhaseOpen(true)} className='mt-4'>
					Chuyển pha tiếp theo
				</Button>
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			<div className='space-y-2'>
				<p className='font-semibold'>Đề tài quá hạn:</p>
				<ul className='list-disc pl-5'>
					{overdueTopics.map((t) => (
						<li key={t.topicId}>{t.title}</li>
					))}
				</ul>
				<Button
					variant='secondary'
					className='border-destructive/20 bg-destructive/10 text-destructive'
					onClick={() => setReminderOpen(true)}
				>
					<Bell className='mr-2 h-4 w-4' />
					Gửi nhắc nhở quá hạn
				</Button>
			</div>

			{/* Dialog nhắc nhở */}
			<Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Gửi nhắc nhở quá hạn</DialogTitle>
					</DialogHeader>
					<p>Bạn có chắc muốn gửi nhắc nhở?</p>
					<DialogFooter className='flex gap-2'>
						<Button variant='secondary' onClick={() => setReminderOpen(false)}>
							Hủy
						</Button>
						<Button disabled={loading} onClick={handleReminder}>
							{loading ? 'Đang gửi...' : 'Gửi'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Dialog chuyển pha */}
			<Dialog open={nextPhaseOpen} onOpenChange={setNextPhaseOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Chuyển pha tiếp theo</DialogTitle>
					</DialogHeader>
					<p>Bạn có chắc muốn chuyển sang pha tiếp theo?</p>
					<DialogFooter className='flex gap-2'>
						<Button variant='secondary' onClick={() => setNextPhaseOpen(false)}>
							Hủy
						</Button>
						<Button disabled={loading} onClick={handleNextPhase}>
							{loading ? 'Đang xử lý...' : 'Chuyển'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
