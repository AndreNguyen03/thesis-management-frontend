'use client'

import { useMemo, useState, useEffect } from 'react'
import { TopicsPanel } from './TopicPanel'
import { MilestonesPanel } from './MilestonePanel'
import {
	useGetDefenseAssignmentInPeriodQuery,
	useManageLecturersInDefenseMilestoneMutation,
	useManageTopicsInDefenseMilestoneMutation
} from '@/services/milestoneApi'
import { useParams } from 'react-router-dom'
import { useGetTopicsAwaitingEvaluationInPeriodQuery } from '@/services/topicApi'
import { ConfirmDialog } from './ConfirmDialog'
import { toast } from 'sonner'
import type { CouncilMemberRole, DefenseCouncilMember, TopicSnaps } from '@/models/milestone.model'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { LecturersPanel } from './LecturersPanel'
import { useGetAllLecturersComboboxQuery } from '@/services/lecturerApi'
import { useLocation, useNavigate } from 'react-router-dom'
type ActionType = 'add' | 'delete'

export function DefenseAssignmentPage() {
	const { id: periodId } = useParams()
	const location = useLocation()
	const navigate = useNavigate()

	// Lấy milestoneId từ location.state nếu có
	const initialMilestoneId = location.state?.milestoneId ?? null
	const [selectedMilestone, setSelectedMilestone] = useState<string | null>(initialMilestoneId)
	const [highlightedMilestone, setHighlightedMilestone] = useState<string | null>(initialMilestoneId)
	const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
	const [selectedLecturers, setSelectedLecturers] = useState<DefenseCouncilMember[]>([])
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

	const [topicQueries, setTopicQueries] = useState<PaginationQueryParamsDto>({
		limit: 15,
		page: 1,
		query: '',
		search_by: ['titleVN', 'titleEng', 'lecturers.fullName']
	})

	const [lecturerQueries, setLecturerQueries] = useState<PaginationQueryParamsDto>({
		limit: 15,
		page: 1,
		query: '',
		search_by: ['fullName']
	})
	//endpoint lấy tất cả các milestone
	const {
		data: milestonesData,
		refetch: refetchMilestones,
		isLoading: isLoadingMilestones
	} = useGetDefenseAssignmentInPeriodQuery(periodId!)
	//endpoint lấy tất cả các đề tài đang chờ đánh giá
	const {
		data: lecturersData,
		refetch: refetchLecturers,
		isLoading: isLoadingLecturers
	} = useGetAllLecturersComboboxQuery(lecturerQueries)
	const {
		data: topicData,
		isLoading: isLoadingTopics,
		error,
		refetch: refetchTopics
	} = useGetTopicsAwaitingEvaluationInPeriodQuery({ periodId: periodId!, queryParams: topicQueries })
	const selectedMilestoneData = useMemo(() => {
		return milestonesData?.find((m) => m._id === selectedMilestone)
	}, [milestonesData, selectedMilestone])

	// Xóa highlight sau 3 giây
	useEffect(() => {
		if (highlightedMilestone) {
			const timer = setTimeout(() => {
				setHighlightedMilestone(null)
			}, 3000)
			return () => clearTimeout(timer)
		}
	}, [highlightedMilestone])

	// Reset highlight khi navigate state thay đổi
	useEffect(() => {
		if (location.state?.milestoneId) {
			setHighlightedMilestone(location.state.milestoneId)
			setSelectedMilestone(location.state.milestoneId)
		}
	}, [location.state?.milestoneId])

	//Gọi endpoint quản lý đề tài trong milestone bảo vệ
	const [manageTopics, { isLoading: isManagingTopics }] = useManageTopicsInDefenseMilestoneMutation()
	//Gọi endpoint quản lý giảng viên trong hội đồng bảo vệ
	const [manageLecturers, { isLoading: isManagingLecturers }] = useManageLecturersInDefenseMilestoneMutation()

	const [lecturerConfirmDialog, setLecturerConfirmDialog] = useState<{
		open: boolean
		type: ActionType | null
		lecturers: DefenseCouncilMember[]
		milestoneId: string | null
	}>({
		open: false,
		type: null,
		lecturers: [],
		milestoneId: null
	})

	const handleSelectTopic = (topicId: string) => {
		const newSelected = new Set(selectedTopics)
		if (newSelected.has(topicId)) {
			newSelected.delete(topicId)
		} else {
			newSelected.add(topicId)
		}
		setSelectedTopics(newSelected)
	}

	const handleSelectLecturer = (lecturer: DefenseCouncilMember) => {
		const exists = selectedLecturers.some((l) => l.memberId === lecturer.memberId)
		if (exists) {
			setSelectedLecturers(selectedLecturers.filter((l) => l.memberId !== lecturer.memberId))
		} else {
			setSelectedLecturers([...selectedLecturers, lecturer])
		}
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
	const handleAssignCouncil = async () => {
		if (!selectedMilestone) {
			toast.error('Vui lòng chọn đợt bảo vệ')
			return
		}

		if (selectedLecturers.length === 0) {
			toast.error('Vui lòng chọn ít nhất một giảng viên')
			return
		}
		const memberNum = selectedLecturers.length + selectedMilestoneData?.defenseCouncil.length!
		const isLe = memberNum % 2
		if (isLe === 0) {
			toast.error('Số lượng thành viên trong hội đồng bảo vệ phải là số lẻ. Hãy chọn thêm 1 thành viên', {
				richColors: true
			})
			return
		}
		const arrayLecturerEliminate = [
			...(milestonesData?.find((m) => m._id === selectedMilestone)?.defenseCouncil ?? []),
			...selectedLecturers
		]
		const haveChairPerson = arrayLecturerEliminate.some((lecturer) => lecturer.role === 'chairperson')
		if (!haveChairPerson) {
			toast.error('Vui lòng thêm 1 chủ tịch hội đồng bảo vệ', { richColors: true })
			return
		}
		const haveSecretary = arrayLecturerEliminate.some((lecturer) => lecturer.role === 'secretary')
		if (!haveSecretary) {
			toast.error('Vui lòng thêm ít nhất một thư ký hội đồng bảo vệ', { richColors: true })
			return
		}

		// Mở dialog xác nhận
		setLecturerConfirmDialog({
			open: true,
			type: 'add',
			lecturers: selectedLecturers,
			milestoneId: selectedMilestone
		})
	}

	const handleRemoveLecturerFromCouncil = (milestoneId: string, lecturer: DefenseCouncilMember) => {
		setLecturerConfirmDialog({
			open: true,
			type: 'delete',
			lecturers: [lecturer],
			milestoneId: milestoneId
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
				topicSnapshots: flattenedSnapshots as TopicSnaps[]
			}

			await manageTopics(payload).unwrap()

			// Refetch data
			await Promise.all([refetchMilestones(), refetchTopics(), refetchLecturers()])

			// Show success message
			toast.success(
				confirmDialog.type === 'add'
					? 'Thêm đề tài vào hội đồng bảo vệ thành công'
					: 'Xóa đề tài khỏi hội đồng bảo vệ thành công',
				{
					richColors: true
				}
			)

			// Reset state
			setSelectedTopics(new Set())
			setConfirmDialog({ open: false, type: null, topicIds: [], milestoneId: null })
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}
	const handleChangeRole = (lecturerId: string, role: CouncilMemberRole) => {
		const updatedLecturers = selectedLecturers.map((lecturer) =>
			lecturer.memberId === lecturerId ? { ...lecturer, role } : lecturer
		)
		setSelectedLecturers(updatedLecturers)
	}

	const handleConfirmLecturerAction = async () => {
		if (!lecturerConfirmDialog.milestoneId || lecturerConfirmDialog.lecturers.length === 0) return

		try {
			const payload = {
				milestoneTemplateId: lecturerConfirmDialog.milestoneId,
				action: lecturerConfirmDialog.type!,
				defenseCouncil: lecturerConfirmDialog.lecturers
			}

			await manageLecturers(payload).unwrap()

			// Refetch data
			await Promise.all([refetchMilestones(), refetchLecturers()])

			// Show success message
			toast.success(
				lecturerConfirmDialog.type === 'add'
					? 'Thêm giảng viên vào hội đồng bảo vệ thành công'
					: 'Xóa giảng viên khỏi hội đồng bảo vệ thành công',
				{
					richColors: true
				}
			)

			// Reset state
			setSelectedLecturers([])
			setLecturerConfirmDialog({ open: false, type: null, lecturers: [], milestoneId: null })
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}

	return (
		<>
			<div className='flex h-full w-full gap-6 bg-background p-6'>
				{/* Left Panel - Topics */}
				<TopicsPanel
					topics={topicData?.data ?? []}
					selectedTopics={selectedTopics}
					onSelectTopic={handleSelectTopic}
					selectedMilestone={selectedMilestone}
					isSelectedLecturers={selectedLecturers.length > 0}
					searchQueryParams={setTopicQueries}
					onClearSelection={() => setSelectedTopics(new Set())}
					isLoadingTopics={isLoadingTopics}
				/>
				{/* Center panel - Lecturers */}
				<LecturersPanel
					lecturers={
						lecturersData?.data.filter(
							(l) => !selectedMilestoneData?.defenseCouncil.some((sl) => sl.memberId === l._id)
						) ?? []
					}
					selectedLecturers={selectedLecturers}
					onSelectLecturer={handleSelectLecturer}
					selectedMilestone={selectedMilestone}
					selectedTopics={selectedTopics}
					searchQueryParams={setLecturerQueries}
					onChangeRole={handleChangeRole}
					isHaveChairPerson={
						selectedLecturers.some((lecturer) => lecturer.role === 'chairperson') ||
						(milestonesData
							?.find((m) => m._id === selectedMilestone)
							?.defenseCouncil.some((lecturer) => lecturer.role === 'chairperson') ??
							false)
					}
					onClearSelection={() => setSelectedLecturers([])}
					isLoadingLecturers={isLoadingLecturers}
				/>
				{/* Right Panel - Milestones */}
				<MilestonesPanel
					milestones={milestonesData && milestonesData.length > 0 ? milestonesData : []}
					selectedMilestone={selectedMilestone}
					highlightedMilestone={highlightedMilestone}
					selectedLecturers={selectedLecturers}
					onSelectMilestone={setSelectedMilestone}
					selectedTopics={selectedTopics}
					onAssignTopics={handleAssignTopics}
					onRemoveTopic={handleRemoveTopicFromMilestone}
					onAssignCouncil={handleAssignCouncil}
					onRemoveLecturer={handleRemoveLecturerFromCouncil}
					isLoadingMilestones={isLoadingMilestones}
				/>
			</div>

			{/* Confirmation Dialog for Topics */}
			<ConfirmDialog
				open={confirmDialog.open}
				onOpenChange={(open) => !isManagingTopics && setConfirmDialog({ ...confirmDialog, open })}
				title={confirmDialog.type === 'add' ? 'Xác nhận thêm đề tài' : 'Xác nhận xóa đề tài'}
				description={
					confirmDialog.type === 'add'
						? `Bạn có chắc chắn muốn thêm ${confirmDialog.topicIds.length} đề tài vào đợt bảo vệ này không?`
						: 'Bạn có chắc chắn muốn xóa đề tài này khỏi đợt bảo vệ không?'
				}
				onConfirm={handleConfirmAction}
				isLoading={isManagingTopics}
				confirmText={confirmDialog.type === 'add' ? 'Thêm' : 'Xóa'}
			/>

			{/* Confirmation Dialog for Lecturers */}
			<ConfirmDialog
				open={lecturerConfirmDialog.open}
				onOpenChange={(open) =>
					!isManagingLecturers && setLecturerConfirmDialog({ ...lecturerConfirmDialog, open })
				}
				title={lecturerConfirmDialog.type === 'add' ? 'Xác nhận thêm giảng viên' : 'Xác nhận xóa giảng viên'}
				description={
					lecturerConfirmDialog.type === 'add'
						? `Bạn có chắc chắn muốn thêm ${lecturerConfirmDialog.lecturers.length} giảng viên vào hội đồng bảo vệ này không?`
						: `Bạn có chắc chắn muốn xóa giảng viên ${lecturerConfirmDialog.lecturers[0]?.fullName} khỏi hội đồng bảo vệ không?`
				}
				onConfirm={handleConfirmLecturerAction}
				isLoading={isManagingLecturers}
				confirmText={lecturerConfirmDialog.type === 'add' ? 'Thêm' : 'Xóa'}
			/>
		</>
	)
}
