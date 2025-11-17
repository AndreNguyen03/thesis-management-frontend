import { useState } from 'react'
import type { PhaseType, Topic } from '@/models/period'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Eye, MoreVertical, CheckCircle, XCircle, Edit } from 'lucide-react'
import { motion } from 'framer-motion'
import { TopicDetailModal } from './modals/TopicDetailModal'
import { EditTopicModal } from './modals/EditTopicModal'

interface TopicsTableProps {
	topics: Topic[]
	phase: PhaseType
}

export function TopicsTable({ topics, phase }: TopicsTableProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
	const [detailModalOpen, setDetailModalOpen] = useState(false)
	const [editModalOpen, setEditModalOpen] = useState(false)

	const handleViewDetail = (topic: Topic) => {
		setSelectedTopic(topic)
		setDetailModalOpen(true)
	}

	const handleEdit = (topic: Topic) => {
		setSelectedTopic(topic)
		setEditModalOpen(true)
	}

	const filteredTopics = topics.filter(
		(topic) =>
			topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			topic.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
			topic.student?.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const getStatusBadge = (status: string) => {
		const variants = {
			pending: { label: 'Chờ xét', variant: 'outline' as const },
			approved: { label: 'Đã duyệt', variant: 'default' as const },
			rejected: { label: 'Từ chối', variant: 'destructive' as const },
			in_progress: { label: 'Đang thực hiện', variant: 'default' as const },
			paused: { label: 'Tạm dừng', variant: 'secondary' as const },
			completed: { label: 'Hoàn thành', variant: 'default' as const }
		}

		const config = variants[status as keyof typeof variants]
		return <Badge variant={config.variant}>{config.label}</Badge>
	}

	const renderPhaseSpecificColumns = (topic: Topic) => {
		switch (phase) {
			case 'submit_topic':
				return (
					<>
						<TableCell>{new Date(topic.submittedAt).toLocaleDateString('vi-VN')}</TableCell>
						<TableCell>{getStatusBadge(topic.status)}</TableCell>
					</>
				)
			case 'open_registration':
				return (
					<>
						<TableCell>{topic.student || 'Chưa có'}</TableCell>
						<TableCell>{topic.registrationCount || 0} sinh viên</TableCell>
						<TableCell>{getStatusBadge(topic.status)}</TableCell>
					</>
				)
			case 'execution':
				return (
					<>
						<TableCell>{topic.student || 'N/A'}</TableCell>
						<TableCell>
							<div className='flex items-center gap-2'>
								<div className='h-2 w-full rounded-full bg-muted'>
									<div
										className='h-2 rounded-full bg-primary transition-all'
										style={{ width: `${topic.progress || 0}%` }}
									/>
								</div>
								<span className='whitespace-nowrap text-sm text-muted-foreground'>
									{topic.progress || 0}%
								</span>
							</div>
						</TableCell>
						<TableCell>{getStatusBadge(topic.status)}</TableCell>
					</>
				)
			case 'completion':
				return (
					<>
						<TableCell>{topic.student || 'N/A'}</TableCell>
						<TableCell className='font-semibold'>{topic.score?.toFixed(1) || 'N/A'}</TableCell>
						<TableCell>{getStatusBadge(topic.status)}</TableCell>
					</>
				)
			default:
				return null
		}
	}

	const getPhaseHeaders = () => {
		switch (phase) {
			case 'submit_topic':
				return (
					<>
						<TableHead>Thời gian nộp</TableHead>
						<TableHead>Trạng thái</TableHead>
					</>
				)
			case 'open_registration':
				return (
					<>
						<TableHead>Sinh viên</TableHead>
						<TableHead>Đăng ký</TableHead>
						<TableHead>Trạng thái</TableHead>
					</>
				)
			case 'execution':
				return (
					<>
						<TableHead>Sinh viên</TableHead>
						<TableHead>Tiến độ</TableHead>
						<TableHead>Trạng thái</TableHead>
					</>
				)
			case 'completion':
				return (
					<>
						<TableHead>Sinh viên</TableHead>
						<TableHead>Điểm TB</TableHead>
						<TableHead>Trạng thái</TableHead>
					</>
				)
			default:
				return null
		}
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between gap-4'>
				<Input
					placeholder='Tìm kiếm đề tài, giảng viên, sinh viên...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='max-w-md'
				/>
			</div>

			<div className='rounded-md border bg-card'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-[100px]'>Mã ĐT</TableHead>
							<TableHead>Tên đề tài</TableHead>
							<TableHead>Giảng viên</TableHead>
							{getPhaseHeaders()}
							<TableHead className='w-[80px]'>Hành động</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredTopics.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className='py-8 text-center text-muted-foreground'>
									Không tìm thấy đề tài nào
								</TableCell>
							</TableRow>
						) : (
							filteredTopics.map((topic, index) => (
								<motion.tr
									key={topic.id}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: index * 0.05 }}
									className='group hover:bg-muted/50'
								>
									<TableCell className='font-medium'>{topic.id}</TableCell>
									<TableCell className='max-w-[300px]'>
										<div className='truncate' title={topic.title}>
											{topic.title}
										</div>
									</TableCell>
									<TableCell>{topic.instructor}</TableCell>
									{renderPhaseSpecificColumns(topic)}
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant='ghost' size='icon'>
													<MoreVertical className='h-4 w-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end'>
												<DropdownMenuItem onClick={() => handleViewDetail(topic)}>
													<Eye className='mr-2 h-4 w-4' />
													Xem chi tiết
												</DropdownMenuItem>
												{phase === 'submit_topic' && topic.status === 'submitted' && (
													<>
														<DropdownMenuItem>
															<CheckCircle className='mr-2 h-4 w-4' />
															Duyệt
														</DropdownMenuItem>
														<DropdownMenuItem>
															<XCircle className='mr-2 h-4 w-4' />
															Từ chối
														</DropdownMenuItem>
													</>
												)}
												<DropdownMenuItem onClick={() => handleEdit(topic)}>
													<Edit className='mr-2 h-4 w-4' />
													Chỉnh sửa
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</motion.tr>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Modals */}
			<TopicDetailModal open={detailModalOpen} onOpenChange={setDetailModalOpen} topic={selectedTopic} />
			<EditTopicModal open={editModalOpen} onOpenChange={setEditModalOpen} topic={selectedTopic} />
		</div>
	)
}
