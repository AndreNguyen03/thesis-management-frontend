import { useState } from 'react'
import type { PhaseType } from '@/models/period.model'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Eye, MoreVertical, CheckCircle, XCircle, Edit } from 'lucide-react'
import { motion } from 'framer-motion'

import type { GeneralTopic, Topic } from '@/models'
import { useNavigate } from 'react-router-dom'

interface TopicsTableProps {
	topics: GeneralTopic[] | undefined
	phase: PhaseType
	actions: {
		onApproveTopic: (topicId: string) => void
		onRejectTopic: (topicId: string) => void
		onSearchTopics: (searchTerm: string) => void
	}
}

export function TopicsTable({ topics, phase, actions }: TopicsTableProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedTopic, setSelectedTopic] = useState<GeneralTopic | null>(null)
	const navigate = useNavigate()
	const handleViewDetail = (topic: GeneralTopic) => {
		navigate(`/detail-topic/${topic._id}`)
	}

	const handleEdit = (topic: GeneralTopic) => {
		setSelectedTopic(topic)
		// setEditModalOpen(true)
	}
	const handleSearchChange = (value: string) => {
		setSearchTerm(value)
		actions.onSearchTopics(value)
	}
	const getStatusBadge = (status: string) => {
		const variants = {
			submitted: { label: 'Đã nộp', variant: 'outline' as const },
			pending_registration: { label: 'Chờ xét', variant: 'outline' as const },
			approved: { label: 'Đã duyệt', variant: 'default' as const },
			rejected: { label: 'Từ chối', variant: 'destructive' as const },
			in_progress: { label: 'Đang thực hiện', variant: 'default' as const },
			paused: { label: 'Tạm dừng', variant: 'secondary' as const },
			completed: { label: 'Hoàn thành', variant: 'default' as const }
		}

		const config = variants[status as keyof typeof variants]
		return <Badge variant={config.variant}>{config.label}</Badge>
	}

	const renderPhaseSpecificColumns = (topic: GeneralTopic) => {
		switch (phase) {
			case 'submit_topic':
				return (
					<>
						<TableCell>{new Date(topic.submittedAt).toLocaleString('vi-VN')}</TableCell>
						<TableCell className='min-w-32'>{getStatusBadge(topic.currentStatus)}</TableCell>
					</>
				)
			case 'open_registration':
				return (
					<>
						<TableCell>{topic.students.map((student) => student.fullName).join(', ') || 'N/A'}</TableCell>
						<TableCell>{topic.students.length || 0} sinh viên</TableCell>
						<TableCell>{getStatusBadge(topic.currentStatus)}</TableCell>
					</>
				)
			case 'execution':
				return (
					<>
						<TableCell>{topic.students.map((student) => student.fullName).join(', ') || 'N/A'}</TableCell>
						<TableCell>
							<div className='flex items-center gap-2'>
								<div className='h-2 w-full rounded-full bg-muted'>
									<div className='h-2 rounded-full bg-primary transition-all'>
										styl width: topic.progres
									</div>
								</div>
								<span className='whitespace-nowrap text-sm text-muted-foreground'>topic.progres</span>
							</div>
						</TableCell>
						<TableCell>{getStatusBadge(topic.currentStatus)}</TableCell>
					</>
				)
			case 'completion':
				return (
					<>
						<TableCell>{topic.students.map((student) => student.fullName).join(', ') || 'N/A'}</TableCell>
						<TableCell className='font-semibold'>score</TableCell>
						<TableCell>{getStatusBadge(topic.currentStatus)}</TableCell>
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
						<TableHead className='min-w-30'>Trạng thái</TableHead>
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
					placeholder='Tìm kiếm đề tài, giảng viên,...'
					value={searchTerm}
					onChange={(e) => handleSearchChange(e.target.value)}
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
						{topics?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className='py-8 text-center text-muted-foreground'>
									Không tìm thấy đề tài nào
								</TableCell>
							</TableRow>
						) : (
							topics?.map((topic, index) => (
								<motion.tr
									key={topic._id}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: index * 0.05 }}
									className='group hover:bg-muted/50'
								>
									<TableCell className='font-medium'>{topic._id}</TableCell>
									<TableCell className='max-w-[500px]'>
										<div
											className='line-clamp-3 truncate text-wrap font-semibold'
											title={topic.titleVN}
										>
											{topic.titleVN}
										</div>
										<div
											className='line-clamp-3 truncate text-wrap text-gray-500'
											title={topic.titleEng}
										>
											{topic.titleEng}
										</div>
									</TableCell>
									<TableCell>
										{topic.lecturers && topic.lecturers.length > 0
											? topic.lecturers.map((lecturer, idx) => (
													<span key={lecturer._id || idx} className='mr-2 font-semibold'>
														{lecturer.title}
														{'.'} {lecturer.fullName}
														{idx < topic.lecturers.length - 1 && ','}
													</span>
												))
											: 'N/A'}
									</TableCell>
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
												{phase === 'submit_topic' && topic.currentStatus === 'submitted' && (
													<>
														<DropdownMenuItem
															onClick={() => actions.onApproveTopic(topic._id)}
														>
															<CheckCircle className='mr-2 h-4 w-4' />
															Duyệt
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => actions.onRejectTopic(topic._id)}
														>
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

			{/* Modals
			<TopicDetailModal open={detailModalOpen} onOpenChange={setDetailModalOpen} topic={selectedTopic} /> */}
			{/* <EditTopicModal open={editModalOpen} onOpenChange={setEditModalOpen} topic={selectedTopic} /> */}
		</div>
	)
}
