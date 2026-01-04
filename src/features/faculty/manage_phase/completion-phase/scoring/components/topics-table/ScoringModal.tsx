'use client'

import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { getGradeText, getGradeColor } from '@/utils/grade-helper'
import type { CouncilMemberSnapshot, TopicsInDefenseMilestone } from '@/models'

interface ScoringModalProps {
	open: boolean
	topic?: TopicsInDefenseMilestone
	councilMembers?: CouncilMemberSnapshot[]
	onOpenChange: (open: boolean) => void
	onSubmit: (data: any) => Promise<void>
	isLoading?: boolean
}

export function ScoringModal({
	open,
	topic,
	councilMembers = [],
	onOpenChange,
	onSubmit,
	isLoading = false
}: ScoringModalProps) {
	const [scores, setScores] = useState<Record<string, number>>({})
	const [notes, setNotes] = useState<Record<string, string>>({})

	const averageScore =
		councilMembers.length > 0
			? councilMembers.reduce((sum, _, idx) => sum + (scores[idx] || 0), 0) / councilMembers.length
			: 0

	const handleScoreChange = (index: number, value: string) => {
		const numValue = Number.parseFloat(value) || 0
		setScores({ ...scores, [index]: Math.min(Math.max(numValue, 0), 10) })
	}

	const handleNoteChange = (index: number, value: string) => {
		setNotes({ ...notes, [index]: value })
	}

	const handleSubmit = async () => {
		if (councilMembers.length === 0) {
			toast.error('Vui lòng thêm thành viên hội đồng')
			return
		}

		const allScored = councilMembers.every((_, idx) => scores[idx] !== undefined && scores[idx] > 0)
		if (!allScored) {
			toast.error('Vui lòng nhập điểm cho tất cả thành viên hội đồng')
			return
		}

		const submissionData = {
			topicId: topic?._id,
			finalScore: averageScore,
			gradeText: getGradeText(averageScore),
			councilMembers: councilMembers.map((member, idx) => ({
				...member,
				score: scores[idx],
				note: notes[idx] || ''
			}))
		}

		try {
			await onSubmit(submissionData)
			setScores({})
			setNotes({})
			onOpenChange(false)
		} catch (error) {
			console.error('[v0] Scoring submission error:', error)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle>Chấm điểm đề tài</DialogTitle>
					<DialogDescription>
						{topic?.titleVN} - {topic?.titleEng}
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-6'>
					{/* Council Members Scoring */}
					<div className='space-y-4'>
						<h3 className='font-semibold text-foreground'>Nhập điểm từng thành viên hội đồng</h3>
						{councilMembers.length === 0 ? (
							<p className='text-sm text-muted-foreground'>Không có thành viên hội đồng nào</p>
						) : (
							<div className='space-y-4'>
								{councilMembers.map((member, idx) => (
									<div key={idx} className='grid grid-cols-2 gap-4 rounded-lg border p-4'>
										<div>
											<Label className='text-sm font-medium'>{member.fullName}</Label>
											<p className='text-xs text-muted-foreground'>{member.role}</p>
										</div>
										<div className='space-y-2'>
											<div>
												<Label htmlFor={`score-${idx}`} className='text-sm'>
													Điểm (0-10)
												</Label>
												<Input
													id={`score-${idx}`}
													type='number'
													min='0'
													max='10'
													step='0.5'
													value={scores[idx] || ''}
													onChange={(e) => handleScoreChange(idx, e.target.value)}
													placeholder='Nhập điểm'
													disabled={isLoading}
												/>
											</div>
											<div>
												<Label htmlFor={`note-${idx}`} className='text-sm'>
													Ghi chú
												</Label>
												<Input
													id={`note-${idx}`}
													type='text'
													value={notes[idx] || ''}
													onChange={(e) => handleNoteChange(idx, e.target.value)}
													placeholder='Ghi chú (tùy chọn)'
													disabled={isLoading}
												/>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					{/* Average Score Preview */}
					{councilMembers.length > 0 && Object.keys(scores).length > 0 && (
						<div className='space-y-2 rounded-lg bg-muted p-4'>
							<div className='flex items-center justify-between'>
								<span className='font-medium'>Điểm trung bình:</span>
								<span className='text-xl font-bold text-foreground'>{averageScore.toFixed(1)}</span>
							</div>
							<div className='flex items-center justify-between'>
								<span className='font-medium'>Xếp loại:</span>
								<Badge variant='outline' className={getGradeColor(averageScore)}>
									{getGradeText(averageScore)}
								</Badge>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
						Hủy
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading || councilMembers.length === 0}>
						{isLoading ? 'Đang lưu...' : 'Lưu điểm'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
