'use client'

import { useState } from 'react'
import { TopicsPanel } from './TopicPanel'
import { MilestonesPanel } from './MilestonePanel'
import {
	useGetDefenseAssignmentInPeriodQuery,
	useManageTopicsInDefenseMilestoneMutation
} from '@/services/milestoneApi'
import { useParams } from 'react-router-dom'
import { useGetTopicsAwaitingEvaluationInPeriodQuery } from '@/services/topicApi'
import { ConfirmDialog } from './ConfirmDialog'
import { toast } from 'sonner'
import type { TopicSnaps } from '@/models/milestone.model'

type ActionType = 'add' | 'delete'

export function DefenseAssignmentPage() {
	const { id: periodId } = useParams()
	const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
	const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean
		type: ActionType | null
		topicIds: string[]
		milestoneId: string | null
	}>({
		open: false,
		type: null,
		topicIds: [],
		milestoneId: null
	})

	//endpoint lấy tất cả các milestone
	const { data: milestonesData, refetch: refetchMilestones } = useGetDefenseAssignmentInPeriodQuery(periodId!)
	const {
		data: topicData,
		isLoading,
		error,
		refetch: refetchTopics
	} = useGetTopicsAwaitingEvaluationInPeriodQuery({ periodId: periodId! })

	//Gọi endpoint quản lý đề tài trong milestone bảo vệ
	const [manageTopics, { isLoading: isManagingTopics }] = useManageTopicsInDefenseMilestoneMutation()

	const handleSelectTopic = (topicId: string) => {
		const newSelected = new Set(selectedTopics)
		if (newSelected.has(topicId)) {
			newSelected.delete(topicId)
		} else {
			newSelected.add(topicId)
		}
		setSelectedTopics(newSelected)
	}

	const handleAssignTopics = () => {
		if (!selectedMilestone || selectedTopics.size === 0) {
			toast.error('Vui lòng chọn milestone và ít nhất một đề tài')
			return
		}

		// Mở dialog xác nhận
		setConfirmDialog({
			open: true,
			type: 'add',
			topicIds: Array.from(selectedTopics),
			milestoneId: selectedMilestone
		})
	}

	const handleRemoveTopicFromMilestone = (milestoneId: string, topicId: string) => {
		// Mở dialog xác nhận xóa
		setConfirmDialog({
			open: true,
			type: 'delete',
			topicIds: [topicId],
			milestoneId: milestoneId
		})
	}

	const handleConfirmAction = async () => {
		if (!confirmDialog.milestoneId || confirmDialog.topicIds.length === 0) return

		try {
			// Lấy thông tin topics để tạo snapshots
			let topicSnapshots: TopicSnaps[] = []

			if (confirmDialog.type === 'add') {
				// Lấy từ topicData cho action add
				const filteredTopics =
					topicData?.data?.filter((topic) => confirmDialog.topicIds.includes(topic._id)) || []

				topicSnapshots = filteredTopics.map((topic) => ({
					_id: topic._id,
					titleVN: topic.titleVN,
					titleEng: topic.titleEng,
					studentName: topic.students?.map((s) => s.fullName),
					lecturers: topic.lecturers || []
				}))
			} else {
				// Lấy từ milestone data cho action delete
				const milestone = milestonesData?.find((m) => m._id === confirmDialog.milestoneId)
				const filteredSnaps =
					milestone?.topicSnaps?.filter((snap) => confirmDialog.topicIds.includes(snap._id)) || []

				topicSnapshots = filteredSnaps.map((snap) => ({
					_id: snap._id,
					titleVN: snap.titleVN,
					titleEng: snap.titleEng,
					studentName: snap.studentName,
					lecturers: snap.lecturers
				}))
			}

			// Flatten array nếu bị lồng nhau (debugging)
			const flattenedSnapshots =
				Array.isArray(topicSnapshots[0]) && topicSnapshots.length === 1 ? topicSnapshots[0] : topicSnapshots
			const payload = {
				milestoneTemplateId: confirmDialog.milestoneId,
				action: confirmDialog.type!,
				topicSnapshots: flattenedSnapshots as TopicSnaps[],
			}

			await manageTopics(payload).unwrap()

			// Refetch data
			await Promise.all([refetchMilestones(), refetchTopics()])

			// Show success message
			toast.success(
				confirmDialog.type === 'add'
					? 'Thêm đề tài vào hội đồng bảo vệ thành công'
					: 'Xóa đề tài khỏi hội đồng bảo vệ thành công'
			)

			// Reset state
			setSelectedTopics(new Set())
			setConfirmDialog({ open: false, type: null, topicIds: [], milestoneId: null })
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}

	return (
		<>
			<div className='flex h-full gap-6 bg-background p-6'>
				{/* Left Panel - Topics */}
				<TopicsPanel
					topics={topicData?.data ?? []}
					selectedTopics={selectedTopics}
					onSelectTopic={handleSelectTopic}
					selectedMilestone={selectedMilestone}
				/>

				{/* Right Panel - Milestones */}
				<MilestonesPanel
					milestones={milestonesData ?? []}
					selectedMilestone={selectedMilestone}
					onSelectMilestone={setSelectedMilestone}
					selectedTopics={selectedTopics}
					onAssignTopics={handleAssignTopics}
					onRemoveTopic={handleRemoveTopicFromMilestone}
				/>
			</div>

			{/* Confirmation Dialog */}
			<ConfirmDialog
				open={confirmDialog.open}
				onOpenChange={(open) => !isManagingTopics && setConfirmDialog({ ...confirmDialog, open })}
				title={confirmDialog.type === 'add' ? 'Xác nhận thêm đề tài' : 'Xác nhận xóa đề tài'}
				description={
					confirmDialog.type === 'add'
						? `Bạn có chắc chắn muốn thêm ${confirmDialog.topicIds.length} đề tài vào hội đồng bảo vệ này không?`
						: 'Bạn có chắc chắn muốn xóa đề tài này khỏi hội đồng bảo vệ không?'
				}
				onConfirm={handleConfirmAction}
				isLoading={isManagingTopics}
				confirmText={confirmDialog.type === 'add' ? 'Thêm' : 'Xóa'}
			/>
		</>
	)
}
