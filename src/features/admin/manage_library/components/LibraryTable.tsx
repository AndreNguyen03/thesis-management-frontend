import React from 'react'
import { Eye, Download, ExternalLink, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import { CustomPagination } from '@/components/PaginationBar'
import type { TopicInLibrary } from '@/models'
import { useHideTopicMutation } from '@/services/topicApi'
import { toast } from 'sonner'

// Xóa interface Topic, dùng TopicInLibrary

interface LibraryTableProps {
	topics: TopicInLibrary[]
	isLoading: boolean
	totalCount: number
	page: number
	pageSize: number
	onPageChange: (page: number) => void
	onSelectTopic: (topic: TopicInLibrary) => void
}

const getScoreColor = (score: number) => {
	if (score >= 9) return 'text-success font-bold'
	if (score >= 8) return 'text-primary font-semibold'
	return 'text-muted-foreground font-medium'
}

export const LibraryTable: React.FC<LibraryTableProps> = ({
	topics,
	isLoading,
	totalCount,
	page,
	pageSize,
	onPageChange,
	onSelectTopic
}) => {
	const [hideTopic, { isLoading: isHiding }] = useHideTopicMutation()

	const handleToggleHide = async (e: React.MouseEvent, t: TopicInLibrary) => {
		e.stopPropagation()
		try {
			await hideTopic({ topicId: t._id, hide: !t.isHiddenInLibrary }).unwrap()
			toast.success(t.isHiddenInLibrary ? 'Hiện đề tài thành công' : 'Ẩn đề tài thành công')
		} catch (err) {
			console.error(err)
			toast.error('Cập nhật trạng thái ẩn thất bại')
		}
	}

	return (
		<div className='overflow-hidden rounded-xl border border-border bg-background shadow-card'>
			<div className='overflow-x-auto'>
				<Table>
					<TableHeader>
						<TableRow className='bg-muted'>
							<TableHead className='font-semibold text-foreground'>Tên đề tài</TableHead>
							<TableHead className='font-semibold text-foreground'>Sinh viên</TableHead>
							<TableHead className='font-semibold text-foreground'>Giảng viên</TableHead>
							<TableHead className='font-semibold text-foreground'>Ngành</TableHead>
							<TableHead className='text-center font-semibold text-foreground'>Năm</TableHead>
							<TableHead className='text-center font-semibold text-foreground'>
								<div className='flex items-center justify-center gap-1'>
									<Eye className='h-3.5 w-3.5' />
									Xem
								</div>
							</TableHead>
							<TableHead className='text-center font-semibold text-foreground'>
								<div className='flex items-center justify-center gap-1'>
									<Download className='h-3.5 w-3.5' />
									Tải
								</div>
							</TableHead>
							<TableHead className='text-center font-semibold text-foreground'>
								<div className='flex items-center justify-center gap-1'>Điểm</div>
							</TableHead>
							<TableHead className='font-semibold text-foreground'>Loại</TableHead>
							<TableHead className='text-right font-semibold text-foreground'>Hành động</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={11}>
									<LoadingState message='Đang tải dữ liệu...' />
								</TableCell>
							</TableRow>
						) : topics.length === 0 ? (
							<TableRow>
								<TableCell colSpan={11}>
									<EmptyState
										title='Không có đề tài nào'
										description='Không tìm thấy dữ liệu phù hợp.'
									/>
								</TableCell>
							</TableRow>
						) : (
							topics.map((topic, index) => {
								const isHidden = !!topic.isHiddenInLibrary
								const hiddenAt = topic.hiddenAt ? new Date(topic.hiddenAt) : null
								const hiddenAtText = hiddenAt ? hiddenAt.toLocaleString('vi-VN') : ''
								return (
									<TableRow
										key={topic._id}
										className={`animate-fade-up cursor-pointer border-b border-border bg-background hover:bg-muted/60 ${
											isHidden ? 'line-through/50 bg-destructive/5 opacity-70' : ''
										}`}
										style={{ animationDelay: `${index * 50}ms` }}
										onClick={() => onSelectTopic(topic)}
									>
										<TableCell>
											<div className='max-w-[200px]'>
												<span
													className={`font-medium ${isHidden ? 'text-destructive' : 'text-primary'} hover:underline`}
												>
													{topic.titleVN}
												</span>
												{isHidden && (
													<div className='mt-1 flex items-center gap-2 text-xs text-destructive'>
														<EyeOff className='h-3 w-3' />
														<span>Đã ẩn</span>
														{hiddenAtText && (
															<span className='text-muted-foreground'>
																— {hiddenAtText}
															</span>
														)}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell className='text-muted-foreground'>
											{topic.students && topic.students.approvedStudents.length > 0
												? topic.students.approvedStudents
														.map((s) => s.student.fullName)
														.join(', ')
												: '--'}
										</TableCell>
										<TableCell className='text-muted-foreground'>
											{topic.lecturers && topic.lecturers.length > 0
												? topic.lecturers.map((l) => l.fullName).join(', ')
												: '--'}
										</TableCell>
										<TableCell>
											<Badge
												variant='default'
												className='border-none bg-primary/10 font-normal text-primary'
											>
												{topic.major?.name || '--'}
											</Badge>
										</TableCell>
										<TableCell className='text-center text-muted-foreground'>
											{topic.year}
										</TableCell>
										<TableCell className='text-center text-muted-foreground'>
											{topic.stats?.views ?? 0}
										</TableCell>
										<TableCell className='text-center text-muted-foreground'>
											{topic.stats?.downloads ?? 0}
										</TableCell>
										<TableCell
											className={`text-center ${getScoreColor(topic.defenseResult.finalScore ?? 0)}`}
										>
											{topic.defenseResult?.finalScore?.toFixed(1) ?? '--'}
										</TableCell>
										<TableCell>
											<Badge variant='secondary' className='rounded-full px-2 py-1 text-xs'>
												{topic.defenseResult?.gradeText || '--'}
											</Badge>
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex items-center justify-end gap-1'>
												<Button
													variant='ghost'
													size='icon'
													className='h-8 w-8 text-muted-foreground hover:text-primary'
													onClick={(e) => {
														e.stopPropagation()
														onSelectTopic(topic)
													}}
												>
													<ExternalLink className='h-4 w-4' />
												</Button>
												<Button
													variant='ghost'
													size='icon'
													className='h-8 w-8 text-muted-foreground hover:text-primary'
													onClick={(e) => {
														e.stopPropagation()
														handleToggleHide(e, topic)
													}}
													disabled={isHiding}
													title={topic.isHiddenInLibrary ? 'Hiện đề tài' : 'Ẩn đề tài'}
												>
													{topic.isHiddenInLibrary ? (
														<EyeOff className='h-4 w-4' />
													) : (
														<Eye className='h-4 w-4' />
													)}
												</Button>
											</div>
										</TableCell>
									</TableRow>
								)
							})
						)}
					</TableBody>
				</Table>
			</div>
			{/* Phân trang */}
			{!isLoading && topics.length > 0 && (
				<div className='px-4 py-3'>
					<CustomPagination
						meta={{
							currentPage: page,
							totalPages: Math.ceil(totalCount / pageSize),
							totalItems: totalCount,
							itemsPerPage: pageSize
						}}
						onPageChange={onPageChange}
					/>
				</div>
			)}
		</div>
	)
}
