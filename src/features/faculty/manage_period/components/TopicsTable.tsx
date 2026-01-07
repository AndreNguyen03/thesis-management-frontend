import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type { PeriodPhase } from '@/models/period-phase.models'
import type { PhaseType } from '@/models/period.model'
import type { GeneralTopic, GetPhaseHistoryDto, PaginationTopicsQueryParams, TopicStatus } from '@/models/topic.model'
import { DataTable } from '@/components/ui/DataTable'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Eye, CheckCircle, XCircle, Edit } from 'lucide-react'
import { TopicDetailModal } from './modals/TopicDetailModal'
import {
	useFacuBoardApproveTopicMutation,
	useFacuBoardRejectTopicMutation,
	useGetTopicsInPhaseQuery
} from '@/services/topicApi'
import type { TableAction, TableBulkAction, TableColumn } from '@/components/ui/DataTable/types'
import { useNavigate } from 'react-router-dom'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { getLabelForStatus } from '../utils'
import { toast } from '@/hooks/use-toast'

interface TopicsTableProps {
	phase: PeriodPhase
	periodId: string
	statFilter: TopicStatus | 'all'
	queryParams: PaginationTopicsQueryParams
	setQueryParams: Dispatch<SetStateAction<PaginationTopicsQueryParams>>
}

export function TopicsTable({ phase, statFilter, periodId, queryParams, setQueryParams }: TopicsTableProps) {
	const [selectedTopic, setSelectedTopic] = useState<GeneralTopic | null>(null)
	const [detailModalOpen, setDetailModalOpen] = useState(false)

	const navigate = useNavigate()

	const { data, isLoading, error, refetch } = useGetTopicsInPhaseQuery(
		{
			periodId,
			queries: queryParams
		},
		{ skip: !periodId }
	)
	const [approveTopic, { isLoading: isLoadingApprove }] = useFacuBoardApproveTopicMutation()
	const [rejectTopic, { isLoading: isLoadingReject }] = useFacuBoardRejectTopicMutation()

	useEffect(() => {
		if (statFilter !== 'all') {
			setQueryParams(
				(prev) =>
					({
						...prev,
						query: '',
						page: 1,
						search_by: [],
						status: statFilter
					}) as PaginationTopicsQueryParams
			)
		} else {
			setQueryParams((prev) => ({ ...prev, query: '', page: 1 }))
		}
	}, [statFilter])

	const handleViewDetail = (topic: GeneralTopic) => {
		setSelectedTopic(topic)
		setDetailModalOpen(true)
	}

	const handleApprove = async (topicId: string) => {
		try {
			await approveTopic({ topicId, phaseId: phase._id, periodId }).unwrap()
			toast({ title: 'Duyệt đề tài thành công', variant: 'success' })
			refetch()
		} catch (err) {
			toast({ title: `Duyệt thất bại ${err}`, variant: 'destructive' })
		}
	}

	const handleReject = async (topicId: string) => {
		try {
			await rejectTopic({ topicId, phaseId: phase._id, periodId }).unwrap()
			toast({ title: 'Từ chối đề tài thành công', variant: 'success' })
			refetch()
		} catch (err) {
			toast({ title: `Từ chối thất bại ${err}`, variant: 'destructive' })
		}
	}

	const truncateText = (text: string, length = 30) => (text.length > length ? text.slice(0, length) + '…' : text)

	const TopicStatusByPhase: Record<PhaseType, TopicStatus[]> = {
		empty: [],

		submit_topic: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],

		open_registration: ['pending_registration', 'registered', 'full', 'cancelled'],

		execution: ['in_progress', 'delayed', 'paused', 'submitted_for_review', 'awaiting_evaluation'],

		completion: ['graded', 'reviewed', 'archived', 'rejected_final']
	}

	const getStatusBadge = (status: TopicStatus) => {
		const variants: Record<TopicStatus, { label: string; variant: BadgeVariant }> = {
			// Phase 1
			draft: { label: 'Nháp', variant: 'outline' },
			submitted: { label: 'Đã nộp', variant: 'blue' },
			under_review: { label: 'Đang xét duyệt', variant: 'lightBlue' },
			approved: { label: 'Được duyệt', variant: 'success' },
			rejected: { label: 'Bị từ chối', variant: 'destructive' },
			// Phase 2
			//available: { label: 'Đang trống', variant: 'default' },
			pending_registration: { label: 'Chờ đăng ký', variant: 'outline' },
			registered: { label: 'Đã đăng ký', variant: 'registered' },
			full: { label: 'Đã đầy', variant: 'gray' },
			cancelled: { label: 'Đã hủy', variant: 'destructive' },
			// Phase 3
			in_progress: { label: 'Đang thực hiện', variant: 'blue' },
			delayed: { label: 'Trễ tiến độ', variant: 'destructive' },
			paused: { label: 'Tạm dừng', variant: 'secondary' },
			submitted_for_review: { label: 'Nộp để xét duyệt', variant: 'lightBlue' },
			awaiting_evaluation: { label: 'Chờ đánh giá', variant: 'outline' },
			assigned_defense: { label: 'Đã phân hội đồng', variant: 'purple' }, // Added missing status
			// Phase 4
			graded: { label: 'Đã chấm', variant: 'success' },
			reviewed: { label: 'Đã duyệt cuối', variant: 'success' },
			archived: { label: 'Lưu trữ', variant: 'graybold' },
			rejected_final: { label: 'Từ chối cuối', variant: 'destructive' }
		}

		const config = variants[status]
		return <Badge variant={config.variant}>{config.label}</Badge>
	}

	const getTopicColumns = (phase: PhaseType): TableColumn<GeneralTopic>[] => {
		const baseCols: TableColumn<GeneralTopic>[] = [
			{
				key: 'titleVN' as const,
				title: 'Tên đề tài',
				sortable: true,
				searchable: true,
				render: (title: string) => (
					<Tooltip>
						<TooltipTrigger asChild>
							<span>{truncateText(title, 40)}</span>
						</TooltipTrigger>
						<TooltipContent>{title}</TooltipContent>
					</Tooltip>
				)
			},
			{
				key: 'lecturers',
				title: 'Giảng viên',
				sortable: false,
				render: (lecturers: GeneralTopic['lecturers']) => {
					const text = lecturers?.map((l) => l.fullName).join(', ') ?? '—'
					return (
						<Tooltip>
							<TooltipTrigger asChild>
								<span>{truncateText(text, 30)}</span>
							</TooltipTrigger>
							<TooltipContent>{text}</TooltipContent>
						</Tooltip>
					)
				},
				searchable: true
			},
			{
				key: 'lastStatusInPhaseHistory' as const,
				title: 'Trạng thái',
				sortable: false,
				searchable: true,
				render: (lastStatusInPhaseHistory: GetPhaseHistoryDto) =>
					getStatusBadge(lastStatusInPhaseHistory.status as TopicStatus),
				renderSearchInput: ({ value, onChange }) => (
					<select
						className='w-full rounded border p-2 text-sm'
						value={value?.value || ''}
						onChange={(e) => onChange({ value: e.target.value })}
					>
						<option value=''>Tất cả</option>
						{TopicStatusByPhase[phase].map((st) => (
							<option key={st} value={st}>
								{getLabelForStatus(st)}
							</option>
						))}
					</select>
				)
			},
			{
				key: phase === 'submit_topic' ? 'submittedAt' : 'updatedAt',
				title: phase === 'submit_topic' ? 'Ngày Nộp' : 'Ngày Cập Nhật ',
				sortable: true,
				render: (value: string) => (value ? new Date(value).toLocaleString('vi-VN') : '—')
			}
		]

		if (phase === 'open_registration') {
			return [
				...baseCols,
				{
					key: 'maxStudents' as const,
					title: 'Chỉ tiêu',
					render: (v: number) => v.toString()
				},
				{
					key: 'students' as const,
					title: 'Sinh viên đăng ký',
					render: (s: GeneralTopic['students']) =>
						s?.approvedStudents?.length
							? s.approvedStudents.map((x) => x.student.fullName).join(', ')
							: '—',
					searchable: true
				}
			]
		}

		if (phase === 'execution') {
			return [
				...baseCols,
				{
					key: 'students' as const,
					title: 'Sinh viên đăng ký',
					render: (s: GeneralTopic['students']) =>
						s?.approvedStudents?.length
							? s.approvedStudents.map((x) => x.student.fullName).join(', ')
							: '—',
					searchable: true
				}
			]
		}

		if (phase === 'completion') {
			return [
				...baseCols,
				{
					key: 'grade' as const,
					title: 'Điểm',
					render: (grade: GeneralTopic['grade']) => grade?.averageScore?.toString() ?? '—'
				}
			]
		}

		// Default submit_topic
		return baseCols
	}

	const getTopicActions = (phase: PhaseType): TableAction<GeneralTopic>[] => {
		const baseActions: TableAction<GeneralTopic>[] = [
			// Mở trang detail
			{
				icon: <Eye className='h-4 w-4' />,
				label: 'Xem trang chi tiết',
				onClick: (topic) => navigate(`/topic/${topic._id}`)
			},
			// Quick view modal
			{
				icon: <Eye className='h-4 w-4 text-blue-500' />,
				label: 'Xem nhanh',
				onClick: handleViewDetail
			}
		]

		if (phase === 'submit_topic') {
			return [
				...baseActions,
				{
					label: 'Duyệt',
					icon: <CheckCircle />,
					onClick: (topic) => handleApprove(topic._id),
					disabled: (topic) => topic.currentStatus !== 'submitted' || isLoadingApprove
				},
				{
					label: 'Từ chối',
					icon: <XCircle />,
					onClick: (topic) => handleReject(topic._id),
					disabled: (topic) => topic.currentStatus !== 'submitted' || isLoadingReject
				}
			]
		}

		if (phase === 'execution') {
			return [
				...baseActions,
				{
					label: 'Đang thực hiện',
					icon: <CheckCircle />,
					onClick: (topic) => console.log('Đang thực hiện', topic),
					disabled: (topic) => topic.currentStatus !== 'paused'
				},
				{
					label: 'Tạm dừng',
					icon: <XCircle />,
					onClick: (topic) => console.log('Tạm dừng', topic),
					disabled: (topic) => topic.currentStatus !== 'in_progress'
				},
				{
					label: 'Nộp đánh giá',
					icon: <CheckCircle />,
					onClick: (topic) => console.log('Nộp đánh giá', topic),
					disabled: (topic) => topic.currentStatus !== 'in_progress'
				}
			]
		}

		if (phase === 'completion') {
			return [
				...baseActions,
				{
					label: 'Chỉnh sửa điểm',
					icon: <Edit />,
					onClick: (topic) => {
						// Nếu đã vào Detail Page, bật edit mode
						navigate(`/topic/${topic._id}?edit=true`)
					}
				}
			]
		}

		return baseActions
	}

	const getTopicBulkActions =
		(phase: PhaseType) =>
		(selectedRows: GeneralTopic[]): TableBulkAction<GeneralTopic>[] => {
			if (selectedRows.length === 0) return []

			switch (phase) {
				case 'submit_topic':
					return [
						{
							label: 'Duyệt',
							icon: <CheckCircle />,
							onClick: (rows) => {
								const toApprove = rows.filter((r) => r.currentStatus === 'submitted')
								console.log('Bulk Duyệt:', toApprove)
								// Gọi API approve từng topic hoặc batch
							},
							disabled: (rows) => !rows.some((r) => r.currentStatus === 'submitted')
						},
						{
							label: 'Từ chối',
							icon: <XCircle />,
							onClick: (rows) => {
								const toReject = rows.filter((r) => r.currentStatus === 'submitted')
								console.log('Bulk Từ chối:', toReject)
								// Gọi API reject
							},
							disabled: (rows) => !rows.some((r) => r.currentStatus === 'submitted')
						}
					]

				case 'open_registration':
					return [
						{
							label: 'Hủy đăng ký',
							icon: <XCircle />,
							onClick: (rows) => {
								const cancellable = rows.filter((r) => r.currentStatus === 'registered')
								console.log('Bulk Hủy đăng ký:', cancellable)
							},
							disabled: (rows) => !rows.some((r) => r.currentStatus === 'registered')
						}
					]

				case 'execution':
					return [
						{
							label: 'Đang thực hiện',
							icon: <CheckCircle />,
							onClick: (rows) => {
								const pausedRows = rows.filter((r) => r.currentStatus === 'paused')
								console.log('Bulk Đang thực hiện:', pausedRows)
							},
							disabled: (rows) => !rows.some((r) => r.currentStatus === 'paused')
						},
						{
							label: 'Tạm dừng',
							icon: <XCircle />,
							onClick: (rows) => {
								const inProgressRows = rows.filter((r) => r.currentStatus === 'in_progress')
								console.log('Bulk Tạm dừng:', inProgressRows)
							},
							disabled: (rows) => !rows.some((r) => r.currentStatus === 'in_progress')
						},
						{
							label: 'Nộp đánh giá',
							icon: <CheckCircle />,
							onClick: (rows) => {
								const inProgressRows = rows.filter((r) => r.currentStatus === 'in_progress')
								console.log('Bulk Nộp đánh giá:', inProgressRows)
							},
							disabled: (rows) => !rows.some((r) => r.currentStatus === 'in_progress')
						}
					]

				case 'completion':
					return [
						{
							label: 'Chỉnh sửa điểm',
							icon: <Edit />,
							onClick: (rows) => {
								console.log('Bulk chỉnh sửa điểm:', rows)
								// Có thể redirect đến trang edit hoặc mở modal
							},
							disabled: () => false // luôn enable
						}
					]

				default:
					return []
			}
		}

	return (
		<TooltipProvider>
			<DataTable<GeneralTopic>
				data={data?.data || []}
				columns={getTopicColumns(phase.phase)}
				actions={getTopicActions(phase.phase)}
				bulkActions={getTopicBulkActions(phase.phase)}
				isLoading={isLoading}
				error={error}
				searchFields={{
					titleVN: 'Tên đề tài',
					lecturers: 'Giảng viên',
					currentStatus: 'Trạng thái'
				}}
				totalRecords={data?.meta.totalItems}
				pageSize={queryParams.limit}
				onQueryChange={(q) => setQueryParams(q)}
			/>

			<TopicDetailModal
				isOpen={detailModalOpen}
				onClose={() => setDetailModalOpen(false)}
				topic={selectedTopic}
			/>
		</TooltipProvider>
	)
}
