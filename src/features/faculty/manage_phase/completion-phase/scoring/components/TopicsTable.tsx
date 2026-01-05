'use client'
import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { TopicsInDefenseMilestone, TopicStatus } from '@/models'
import { Download, Trash2 } from 'lucide-react'

interface TopicsTableProps {
	topics: TopicsInDefenseMilestone[]
	onScore?: (topicId: string) => void
	onDownload?: (topicId: string) => void
	onDelete?: (topicId: string) => void
	isLoading?: boolean
	importedScores?: Record<
		string,
		{
			councilScores?: Array<{ score?: number; note?: string }>
			finalScore?: number
			gradeText?: string
		}
	>
}

const getStatusBadgeVariant = (status: string) => {
	switch (status?.toLowerCase()) {
		case 'draft':
			return 'outline'
		case 'graded':
			return 'default'
		case 'rejected_final':
			return 'destructive'
		case 'archived':
			return 'secondary'
		default:
			return 'outline'
	}
}

const getGradeBadgeVariant = (grade?: string) => {
	if (!grade) return 'outline'
	switch (grade.toLowerCase()) {
		case 'xuất sắc':
		case 'excellent':
			return 'default'
		case 'giỏi':
		case 'good':
			return 'secondary'
		case 'khá':
		case 'fair':
			return 'outline'
		default:
			return 'outline'
	}
}
// Badge màu cho trạng thái của đề tài trong milestones
export const statusMap: Record<string, { label: string; color: string }> = {
	assigned_defense: { label: 'Chưa chấm', color: 'text-center bg-gray-100 text-gray-700' },
	graded: { label: 'Đã chấm', color: 'text-center bg-green-100 text-green-700' },
	archived: { label: 'Đã lưu trữ', color: 'text-center bg-blue-100 text-blue-700' }
}

export function TopicsTable({
	topics,
	onScore,
	onDownload,
	onDelete,
	isLoading = false,
	importedScores
}: TopicsTableProps) {
	// Xác định số lượng thành viên hội đồng từ dữ liệu
	const councilCount = useMemo(() => {
		if (topics && topics.length > 0) {
			const maxMembers = Math.max(...topics.map((t) => t.defenseResult?.councilMembers?.length || 0))
			return maxMembers > 0 ? maxMembers : 3 // Mặc định 3 nếu chưa có dữ liệu
		}
		return 3
	}, [topics])

	if (isLoading) {
		return <div className='flex h-64 items-center justify-center text-muted-foreground'>Đang tải dữ liệu...</div>
	}

	if (!topics || topics.length === 0) {
		return (
			<div className='flex h-64 items-center justify-center text-muted-foreground'>
				Không có đề tài nào để hiển thị
			</div>
		)
	}

	return (
		<div className='w-full overflow-x-auto rounded-lg border bg-card'>
			<Table className='min-w-[900px] table-fixed text-sm md:text-base'>
				<TableHeader>
					<TableRow className='bg-muted/50'>
						<TableHead
							rowSpan={2}
							className='w-[80px] border border-gray-300 px-2 py-1 text-center align-middle font-semibold text-foreground md:px-4 md:py-2'
						>
							STT
						</TableHead>
						<TableHead
							rowSpan={2}
							className='w-[300px] border border-gray-300 px-2 py-1 text-center align-middle font-semibold text-foreground md:px-4 md:py-2'
						>
							Tiêu đề đề tài
						</TableHead>
						<TableHead
							rowSpan={2}
							className='min-w-[120px] border border-gray-300 px-2 py-1 text-center align-middle font-semibold text-foreground md:px-4 md:py-2'
						>
							Sinh viên
						</TableHead>
						<TableHead
							rowSpan={2}
							className='min-w-[120px] border border-gray-300 px-2 py-1 text-center align-middle font-semibold text-foreground md:px-4 md:py-2'
						>
							Giảng viên
						</TableHead>
						<TableHead
							rowSpan={2}
							className='w-[120px] border border-gray-300 px-2 py-1 text-center align-middle font-semibold text-foreground md:px-4 md:py-2'
						>
							Trạng thái
						</TableHead>
						<TableHead
							colSpan={councilCount + 1}
							className='border border-gray-300 px-2 py-1 text-center font-semibold text-foreground md:px-4 md:py-2'
						>
							Điểm số
						</TableHead>
						<TableHead
							rowSpan={2}
							className='w-[150px] border border-gray-300 px-2 py-1 text-center align-middle font-semibold text-foreground md:px-4 md:py-2'
						>
							Nhận xét
						</TableHead>
						<TableHead
							rowSpan={2}
							className='w-[150px] border border-gray-300 px-2 py-1 text-center align-middle font-semibold text-foreground md:px-4 md:py-2'
						>
							Xếp loại
						</TableHead>
						<TableHead
							rowSpan={2}
							className='w-[150px] border border-gray-300 px-2 py-1 text-center align-middle font-semibold text-foreground md:px-4 md:py-2'
						>
							Hành động
						</TableHead>
					</TableRow>
					<TableRow className='bg-muted/50'>
						{/* Render động các cột cho từng thành viên hội đồng */}
						{Array.from({ length: councilCount }, (_, i) => (
							<TableHead
								key={`council-${i}`}
								className='w-[60px] border border-gray-300 px-1 py-1 text-center font-semibold text-foreground md:px-2 md:py-2'
							>
								GV{i + 1}
							</TableHead>
						))}
						<TableHead className='w-[60px] border border-gray-300 px-1 py-1 text-center font-semibold text-foreground md:px-2 md:py-2'>
							DTB
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{topics.map((topic, index) => (
						<TableRow key={topic._id} className='transition-colors hover:bg-muted/50'>
							<TableCell className='border border-gray-300 py-3 text-center align-middle'>
								<span className='text-sm text-foreground'>{index + 1}</span>
							</TableCell>

							{/* Topic Title */}
							<TableCell className='border border-gray-300 py-3 align-middle'>
								<div className='flex flex-col gap-1'>
									<p className='text-sm font-medium leading-tight text-foreground'>{topic.titleVN}</p>
									<p className='text-xs text-muted-foreground'>({topic.titleEng})</p>
								</div>
							</TableCell>

							{/* Students */}
							<TableCell className='border border-gray-300 py-3 align-middle'>
								<div className='flex flex-col gap-1'>
									{topic.students && topic.students.length > 0 ? (
										topic.students.map((student) => (
											<span key={student._id} className='text-sm text-foreground'>
												{student.fullName}
											</span>
										))
									) : (
										<span className='text-sm italic text-muted-foreground'>Chưa có sinh viên</span>
									)}
								</div>
							</TableCell>

							{/* Lecturers */}
							<TableCell className='border border-gray-300 py-3 align-middle'>
								<div className='flex flex-col gap-1'>
									{topic.lecturers && topic.lecturers.length > 0 ? (
										topic.lecturers.map((lecturer) => (
											<span key={lecturer._id} className='text-sm text-foreground'>
												{lecturer.fullName}
											</span>
										))
									) : (
										<span className='text-sm italic text-muted-foreground'>Chưa có giảng viên</span>
									)}
								</div>
							</TableCell>

							{/* Status */}
							<TableCell className='border border-gray-300 py-3 text-center align-middle'>
								<Badge
									variant={getStatusBadgeVariant(topic.currentStatus)}
									className={statusMap[topic.currentStatus]?.color}
								>
									{statusMap[topic.currentStatus]?.label || 'Chưa xác định'}
								</Badge>
							</TableCell>

							{/* Render động các cột điểm cho từng thành viên hội đồng */}
							{Array.from({ length: councilCount }, (_, i) => {
								const isChanged =
									importedScores?.[topic._id]?.councilScores?.[i]?.score !==
									topic.defenseResult?.councilMembers?.[i]?.score
								return (
									<TableCell
										key={`score-${topic._id}-${i}`}
										className='border border-gray-300 py-3 text-center align-middle'
									>
										{importedScores?.[topic._id]?.councilScores?.[i]?.score !== undefined &&
											isChanged && (
												<span className='text-sm font-semibold text-blue-600'>
													{importedScores?.[topic._id]?.councilScores?.[i]?.score!.toFixed(1)}
												</span>
											)}{' '}
										{topic.defenseResult?.councilMembers?.[i]?.score !== undefined ? (
											<span className='text-sm font-medium text-foreground'>
												{topic.defenseResult.councilMembers[i].score.toFixed(1)}
											</span>
										) : (
											<span className='text-sm italic text-muted-foreground'>Chưa chấm</span>
										)}
									</TableCell>
								)
							})}

							{/* Average Scores */}
							<TableCell className='border border-gray-300 py-3 text-center align-middle'>
								{importedScores?.[topic._id]?.finalScore !== undefined &&
									importedScores[topic._id].finalScore!.toFixed(2) !==
										topic.defenseResult.finalScore.toFixed(2) && (
										<span className='text-sm font-semibold text-blue-600'>
											{importedScores[topic._id].finalScore!.toFixed(2)}
										</span>
									)}
								{'  '}
								{topic.defenseResult?.finalScore !== undefined ? (
									<span className='text-sm font-medium text-foreground'>
										{topic.defenseResult.finalScore.toFixed(2)}
									</span>
								) : (
									<span className='text-sm italic text-muted-foreground'>Chưa chấm</span>
								)}
							</TableCell>

							{/* Note */}
							<TableCell className='border border-gray-300 py-3 text-center align-middle'>
								{(() => {
									const hasDefenseNotes = topic.defenseResult?.councilMembers?.some(
										(member) => member.note
									)
									const hasImportedNotes = importedScores?.[topic._id]?.councilScores?.some(
										(cs) => cs.note
									)
									if (!hasDefenseNotes && !hasImportedNotes) {
										return <span className='text-sm italic text-muted-foreground'>Không có</span>
									}
									return (
										<div className='flex flex-col gap-2'>
											{hasImportedNotes &&
												Array.isArray(importedScores?.[topic._id]?.councilScores) && (
													<span className='text-sm font-semibold text-blue-600'>
														{importedScores?.[topic._id]?.councilScores?.map((cs, inx) => cs.note && cs.note !== topic.defenseResult.councilMembers[inx]?.note && `GV ${inx + 1}: ${cs.note}`)
															.filter((note) => note)
															.join('; ')}
													</span>
												)}
											{hasDefenseNotes && (
												<span className='text-sm text-foreground'>
													{topic.defenseResult.councilMembers
														.map(
															(member, inx) =>
																member.note && 
																`GV ${inx + 1}: ${member.note}`
														)
														.filter((note) => note)
														.join('; ')}
												</span>
											)}
										</div>
									)
								})()}
							</TableCell>
							<TableCell className='border border-gray-300 py-3 text-center align-middle'>
								{importedScores?.[topic._id]?.gradeText ? (
									<Badge
										variant={getGradeBadgeVariant(importedScores[topic._id].gradeText)}
										className='font-semibold'
									>
										{importedScores[topic._id].gradeText}
									</Badge>
								) : topic.defenseResult?.gradeText ? (
									<Badge variant={getGradeBadgeVariant(topic.defenseResult.gradeText)}>
										{topic.defenseResult.gradeText}
									</Badge>
								) : (
									<span className='text-sm italic text-muted-foreground'>Chưa xếp loại</span>
								)}
							</TableCell>

							{/* Actions */}
							<TableCell className='border border-gray-300 py-3 align-middle'>
								<div className='flex items-center justify-end gap-2'>
									{!topic.defenseResult && onScore && (
										<Button
											variant='outline'
											size='sm'
											onClick={() => onScore(topic._id)}
											className='text-xs'
										>
											Chấm điểm
										</Button>
									)}
									{topic.finalProduct?.thesisReport && onDownload && (
										<Button
											variant='ghost'
											size='sm'
											onClick={() => onDownload(topic._id)}
											title={`Tải ${topic.finalProduct.thesisReport.fileName}`}
										>
											<Download className='h-4 w-4' />
										</Button>
									)}
									{onDelete && (
										<Button
											variant='ghost'
											size='sm'
											onClick={() => onDelete(topic._id)}
											className='text-destructive hover:text-destructive'
										>
											<Trash2 className='h-4 w-4' />
										</Button>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	)
}
