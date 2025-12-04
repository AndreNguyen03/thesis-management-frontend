'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { toast } from '@/hooks/use-toast'
import type { GeneralTopic } from '@/models/topic.model'
import { useFacuBoardRejectTopicMutation, useFacuBoardApproveTopicMutation } from '@/services/topicApi'

interface TopicDetailModalProps {
	isOpen: boolean
	onClose: () => void
	topic: GeneralTopic | null
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({ isOpen, onClose, topic }) => {
	const [approveTopic, { isLoading: isApproving }] = useFacuBoardApproveTopicMutation()
	const [rejectTopic, { isLoading: isRejecting }] = useFacuBoardRejectTopicMutation()
	// const [requestRevision, { isLoading: isRequestingRevision }] = useRequestRevisionTopicMutation()

	if (!topic) return null

	const handleAction = async (action: 'approve' | 'reject' | 'requestRevision') => {
		try {
			if (action === 'approve') await approveTopic({ topicId: topic._id, phaseId: topic.currentPhase }).unwrap()
			else if (action === 'reject')
				await rejectTopic({ topicId: topic._id, phaseId: topic.currentPhase }).unwrap()
			// else if (action === 'requestRevision') await requestRevision(topic._id).unwrap()

			toast({
				title: 'Thành công',
				description: `Action "${action}" đã thực hiện`,
				variant: 'success'
			})

			onClose()
		} catch (err: any) {
			toast({
				title: 'Lỗi',
				description: err?.data?.message || 'Có lỗi xảy ra',
				variant: 'destructive'
			})
		}
	}

	const renderActions = () => {
		if (topic.currentPhase === 'submit_topic') {
			return (
				<>
					{/* <Button
						onClick={() => handleAction('requestRevision')}
						disabled={isRequestingRevision}
						variant='outline'
					>
						Yêu cầu sửa
					</Button> */}
					<Button onClick={() => handleAction('approve')} disabled={isApproving} className='ml-2'>
						Duyệt
					</Button>
					<Button
						onClick={() => handleAction('reject')}
						disabled={isRejecting}
						variant='destructive'
						className='ml-2'
					>
						Từ chối
					</Button>
				</>
			)
		}
		return null
	}

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose() // chỉ đóng modal khi open = false
			}}
		>
			<DialogContent className='max-w-3xl'>
				<DialogHeader>
					<DialogTitle>{topic.titleVN}</DialogTitle>
				</DialogHeader>

				<div className='mt-4 space-y-4'>
					{/* Tiêu đề */}
					<div>
						<h4 className='text-sm font-semibold text-gray-600'>Tiêu đề (VN)</h4>
						<p className='text-gray-800'>{topic.titleVN}</p>
					</div>
					<div>
						<h4 className='text-sm font-semibold text-gray-600'>Tiêu đề (EN)</h4>
						<p className='text-gray-800'>{topic.titleEng}</p>
					</div>

					{/* Yêu cầu */}
					{topic.requirements.length > 0 && (
						<div>
							<h4 className='text-sm font-semibold text-gray-600'>Yêu cầu</h4>
							<ul className='list-inside list-disc text-gray-800'>
								{topic.requirements.map((r) => (
									<li key={r._id}>{r.name}</li>
								))}
							</ul>
						</div>
					)}

					{/* Lĩnh vực */}
					{topic.fields.length > 0 && (
						<div>
							<h4 className='text-sm font-semibold text-gray-600'>Lĩnh vực</h4>
							<div className='flex flex-wrap gap-2'>
								{topic.fields.map((f) => (
									<span
										key={f._id}
										className='inline-block rounded bg-gray-200 px-2 py-1 text-xs text-gray-800'
									>
										{f.name}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Số lượng sinh viên */}
					<div>
						<h4 className='text-sm font-semibold text-gray-600'>Số lượng sinh viên</h4>
						<p className='text-gray-800'>
							{topic.studentsNum} / {topic.maxStudents}
						</p>
					</div>
				</div>

				<DialogFooter className='mt-4 flex justify-end space-x-2'>{renderActions()}</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
