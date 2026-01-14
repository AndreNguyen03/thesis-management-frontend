import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { User, GraduationCap, Calendar, Eye, Download, Star, FileText, BookOpen } from 'lucide-react'
import type { TopicInLibrary } from '@/models'

interface LibraryDetailModalProps {
	open: boolean
	topic: TopicInLibrary | null
	onClose: () => void
}

export const LibraryDetailModal: React.FC<LibraryDetailModalProps> = ({ open, topic, onClose }) => {
	if (!topic) return null

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='max-w-2xl gap-0 overflow-hidden p-0'>
				{/* Header with gradient */}
				<div className='gradient-primary p-6 text-primary-foreground'>
					<DialogHeader>
						<div className='flex justify-between gap-4'>
							<div className='flex-1'>
								<Badge className='mb-2'>{topic.major?.name || '--'}</Badge>
								<DialogTitle className='text-xl font-bold text-black'>{topic.titleVN}</DialogTitle>
							</div>
							<div className='flex items-center justify-center gap-2 rounded-xl px-4 py-2'>
								<span className='text-2xl font-bold text-black'>
									{topic.stats?.averageRating?.toFixed(1) ?? '--'}
								</span>
								<Star className='h-5 w-5 text-warning' fill='currentColor' />
							</div>
						</div>
					</DialogHeader>
				</div>

				{/* Content */}
				<div className='p-6'>
					{/* Quick stats */}
					<div className='mb-6 grid grid-cols-4 gap-3'>
						<div className='flex items-center gap-2 rounded-lg bg-muted/50 p-3'>
							<User className='h-4 w-4 text-muted-foreground' />
							<div>
								<p className='text-xs text-muted-foreground'>Sinh viên</p>
								<p className='text-sm font-medium'>
									{topic.students && topic.students.approvedStudents.length > 0
										? topic.students.approvedStudents.map((s) => s.student.fullName).join(', ')
										: '--'}
								</p>
							</div>
						</div>
						<div className='flex items-center gap-2 rounded-lg bg-muted/50 p-3'>
							<GraduationCap className='h-4 w-4 text-muted-foreground' />
							<div>
								<p className='text-xs text-muted-foreground'>Giảng viên</p>
								<p className='text-sm font-medium'>
									{topic.lecturers && topic.lecturers.length > 0
										? topic.lecturers.map((l) => l.fullName).join(', ')
										: '--'}
								</p>
							</div>
						</div>
						<div className='flex items-center gap-2 rounded-lg bg-muted/50 p-3'>
							<Calendar className='h-4 w-4 text-muted-foreground' />
							<div>
								<p className='text-xs text-muted-foreground'>Năm</p>
								<p className='text-sm font-medium'>{topic.year}</p>
							</div>
						</div>
						<div className='flex items-center gap-2 rounded-lg bg-muted/50 p-3'>
							<BookOpen className='h-4 w-4 text-muted-foreground' />
							<div>
								<p className='text-xs text-muted-foreground'>Ngành</p>
								<p className='text-sm font-medium'>{topic.major?.name || '--'}</p>
							</div>
						</div>
					</div>

					{/* Stats row */}
					<div className='mb-6 flex items-center gap-6 rounded-lg border border-border p-4'>
						<div className='flex items-center gap-2'>
							<Eye className='h-4 w-4 text-info' />
							<span className='text-sm text-muted-foreground'>Lượt xem:</span>
							<span className='font-semibold text-info'>{topic.stats?.views ?? 0}</span>
						</div>
						<div className='h-4 w-px bg-border' />
						<div className='flex items-center gap-2'>
							<Download className='h-4 w-4 text-accent' />
							<span className='text-sm text-muted-foreground'>Lượt tải:</span>
							<span className='font-semibold'>{topic.stats?.downloads ?? 0}</span>
						</div>
						<div className='h-4 w-px bg-border' />
						<div className='flex items-center gap-2'>
							<Badge variant='secondary'>{topic.defenseResult?.gradeText || '--'}</Badge>
						</div>
					</div>

					{/* Tabs */}
					<Tabs defaultValue='overview' className='w-full'>
						<TabsList className='w-full justify-start gap-1 bg-muted/50 p-1'>
							<TabsTrigger value='overview' className='gap-1.5'>
								<FileText className='h-3.5 w-3.5' />
								Tổng quan
							</TabsTrigger>
							<TabsTrigger value='files' className='gap-1.5'>
								<Download className='h-3.5 w-3.5' />
								Tài liệu
							</TabsTrigger>
							
						</TabsList>
						<TabsContent value='overview' className='mt-4'>
							<div className='rounded-lg border border-border p-4'>
								<h4 className='mb-2 font-medium'>Mô tả đề tài</h4>
								<div
									className='text-sm text-muted-foreground'
									dangerouslySetInnerHTML={{ __html: topic.description || 'Không có mô tả.' }}
								/>
							</div>
						</TabsContent>
						<TabsContent value='files' className='mt-4'>
							<div className='rounded-lg border border-border p-4'>
								{topic.finalProduct?.thesisReport ? (
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
												<FileText className='h-5 w-5 text-primary' />
											</div>
											<div>
												<p className='text-sm font-medium'>
													{topic.finalProduct.thesisReport.fileName}
												</p>
												<p className='text-xs text-muted-foreground'>
													{(topic.finalProduct.thesisReport.size / (1024 * 1024)).toFixed(2)}{' '}
													MB
												</p>
											</div>
										</div>
										<Button size='sm' variant='outline' asChild>
											<a
												href={topic.finalProduct.thesisReport.fileUrl}
												target='_blank'
												rel='noopener noreferrer'
											>
												<Download className='mr-1.5 h-3.5 w-3.5' />
												Tải xuống
											</a>
										</Button>
									</div>
								) : (
									<div className='text-center text-sm text-muted-foreground'>Không có tài liệu.</div>
								)}
							</div>
						</TabsContent>
						
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	)
}
