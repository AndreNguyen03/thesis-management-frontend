import { useState } from 'react'
import type { PeriodPhase, TopicStatus } from '@/models/period'
import type { PeriodPhaseName, Topic } from '@/models/topic'
import { DataTable } from '@/components/ui/DataTable'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Eye, CheckCircle, XCircle, Edit } from 'lucide-react'
import { TopicDetailModal } from './modals/TopicDetailModal'
import { useGetTopicsInPhaseQuery } from '@/services/periodApi'
import type { QueryParams, TableAction, TableColumn } from '@/components/ui/DataTable/types'
import { useNavigate } from 'react-router-dom'

interface TopicsTableProps {
	phase: PeriodPhase
}

export function TopicsTable({ phase }: TopicsTableProps) {
	const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
	const [detailModalOpen, setDetailModalOpen] = useState(false)

	const navigate = useNavigate()

	const [queryParams, setQueryParams] = useState<QueryParams>({
		page: 1,
		limit: 10,
		search_by: 'title',
		query: '',
		sort_by: 'startDate',
		sort_order: 'desc'
	})

	const { data, isLoading, error } = useGetTopicsInPhaseQuery({ phaseId: phase._id, query: queryParams })

	const handleViewDetail = (topic: Topic) => {
		setSelectedTopic(topic)
		setDetailModalOpen(true)
	}

	const TopicStatusByPhase: Record<PeriodPhaseName, TopicStatus[]> = {
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
			available: { label: 'Đang trống', variant: 'default' },
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
			// Phase 4
			graded: { label: 'Đã chấm', variant: 'success' },
			reviewed: { label: 'Đã duyệt cuối', variant: 'success' },
			archived: { label: 'Lưu trữ', variant: 'graybold' },
			rejected_final: { label: 'Từ chối cuối', variant: 'destructive' }
		}

		const config = variants[status]
		return <Badge variant={config.variant}>{config.label}</Badge>
	}

	const getTopicColumns = (phase: PeriodPhaseName): TableColumn<Topic>[] => {
		const baseCols: TableColumn<Topic>[] = [
			{
				key: 'titleVN' as const,
				title: 'Tên đề tài',
				sortable: true,
				searchable: true
			},
			{
				key: 'lecturers' as const,
				title: 'Giảng viên',
				sortable: false,
				render: (lecturers: Topic['lecturers']) => lecturers?.map((l) => l.fullName).join(', ') ?? '—',
				searchable: true
			},
			{
				key: 'currentStatus' as const,
				title: 'Trạng thái',
				sortable: false,
				render: (status: TopicStatus) => getStatusBadge(status),
				renderSearchInput: ({ value, onChange }) => (
					<select
						className='w-full rounded border p-2 text-sm'
						value={value?.value || ''}
						onChange={(e) => onChange({ value: e.target.value })}
					>
						<option value=''>Tất cả</option>
						{TopicStatusByPhase[phase].map((st) => (
							<option key={st} value={st}>
								{st}
							</option>
						))}
					</select>
				)
			},
			{
				key: phase === 'submit_topic' ? 'created_at' : 'updated_at',
				title: 'Ngày',
				sortable: true,
				render: (value: string) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—')
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
					render: (s: Topic['students']) => s?.map((x) => x.fullName).join(', ') ?? '—',
					searchable: true
				}
			]
		}

		if (phase === 'execution') {
			return [
				...baseCols,
				{
					key: 'students' as const,
					title: 'Sinh viên thực hiện',
					render: (s: Topic['students']) => s?.map((x) => x.fullName).join(', ') ?? '—',
					searchable: true
				},
				{
					key: 'phaseHistories' as const,
					title: 'Tiến độ',
					render: (history: Topic['phaseHistories']) => {
						const last = history?.at(-1)
						return last ? getStatusBadge(last.status) : '—'
					}
				}
			]
		}

		if (phase === 'completion') {
			return [
				...baseCols,
				{
					key: 'grade' as const,
					title: 'Điểm',
					render: (grade: Topic['grade']) => grade?.averageScore?.toString() ?? '—'
				}
			]
		}

		// Default submit_topic
		return baseCols
	}

	const getTopicActions = (phase: PeriodPhaseName): TableAction<Topic>[] => {
		const baseActions: TableAction<Topic>[] = [
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
					onClick: (topic) => console.log('Duyệt', topic),
					disabled: (topic) => topic.currentStatus !== 'submitted'
				},
				{
					label: 'Từ chối',
					icon: <XCircle />,
					onClick: (topic) => console.log('Từ chối', topic),
					disabled: (topic) => topic.currentStatus !== 'submitted'
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

	return (
		<>
			<DataTable
				data={data?.data || []}
				columns={getTopicColumns(phase.phase)}
				actions={getTopicActions(phase.phase)}
				isLoading={isLoading}
				error={error}
				totalRecords={data?.totalRecords}
				pageSize={queryParams.limit}
				onQueryChange={(q) => setQueryParams(q)}
			/>

			<TopicDetailModal open={detailModalOpen} onOpenChange={setDetailModalOpen} topic={selectedTopic} />
		</>
	)
}
