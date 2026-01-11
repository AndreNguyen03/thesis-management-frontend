'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Save, AlertCircle } from 'lucide-react'
import type { CouncilMemberSnapshot, DefenseResult } from '@/models'
import { CouncilMemberRoleOptions, type DefenseCouncilMember, type TopicSnaps, type CouncilMemberRole } from '@/models/milestone.model'
import { getGradeColor, getGradeText } from '@/utils/grade-utils'


interface ScoringPanelProps {
	topic: TopicSnaps | undefined
	councilMembers: DefenseCouncilMember[]
	onScoringUpdate: (scores: CouncilMemberSnapshot[]) => void
	onSaveAll: () => void
	currentScoring: DefenseResult | undefined
	isLoadingMilestones: boolean
}

interface MemberScore {
	memberId: string
	fullName: string
	role: string
	score: number | null
	note: string
}

export function ScoringPanel({
	topic,
	councilMembers,
	onScoringUpdate,
	onSaveAll,
	currentScoring,
	isLoadingMilestones
}: ScoringPanelProps) {
	const [memberScores, setMemberScores] = useState<MemberScore[]>([])
	const [averageScore, setAverageScore] = useState<number>(0)
	const [gradeText, setGradeText] = useState<string>('')

	// Initialize scores when topic or council members change
	useEffect(() => {
		if (!topic) {
			setMemberScores([])
			return
		}

		const scores: MemberScore[] = councilMembers.map((member) => {
			const existingScore = currentScoring?.councilMembers?.find((m) => m.fullName === member.fullName)
			return {
				memberId: member.memberId,
				fullName: member.fullName,
				role: member.role,
				score: existingScore?.score ?? null,
				note: existingScore?.note ?? ''
			}
		})

		setMemberScores(scores)
	}, [topic, councilMembers, currentScoring])

	// Calculate average score and grade
	useEffect(() => {
		const validScores = memberScores.map((m) => m.score).filter((score) => score !== null && score !== undefined)

		if (validScores.length === 0) {
			setAverageScore(0)
			setGradeText('')
			return
		}

		const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length
		setAverageScore(avg)
		setGradeText(getGradeText(avg))
	}, [memberScores])

	const handleScoreChange = (memberId: string, score: string) => {
		setMemberScores((prev) =>
			prev.map((m) =>
				m.memberId === memberId ? { ...m, score: score === '' ? null : Number.parseFloat(score) } : m
			)
		)
	}

	const handleNoteChange = (memberId: string, note: string) => {
		setMemberScores((prev) => prev.map((m) => (m.memberId === memberId ? { ...m, note } : m)))
	}

	const handleSubmitScores = () => {
		const councilSnapshots: CouncilMemberSnapshot[] = memberScores.map((m) => ({
			memberId: m.memberId,
			fullName: m.fullName,
			role: m.role,
			score: m.score ?? 0,
			note: m.note
		}))

		onScoringUpdate(councilSnapshots)
	}

	const handleConfirmAction = async () => {}

	if (!topic) {
		return (
			<div className='flex w-2/3 items-center justify-center rounded-lg border border-dashed border-border'>
				<div className='text-center'>
					<AlertCircle className='mx-auto mb-2 h-12 w-12 text-muted-foreground' />
					<p className='text-sm font-medium text-foreground'>Chọn một đề tài để nhập điểm</p>
					<p className='text-xs text-muted-foreground'>Danh sách đề tài sẽ hiển thị bên trái</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex w-2/3 flex-col gap-4'>
			{/* Topic Info */}
			<Card className='p-4'>
				<div className='space-y-2'>
					<div>
						<h3 className='font-semibold'>{topic.titleVN}</h3>
						<p className='text-sm text-muted-foreground'>{topic.titleEng}</p>
					</div>
					<div className='flex flex-wrap gap-2'>
						{topic.studentName?.map((student, idx) => (
							<Badge key={idx} variant='secondary'>
								{student}
							</Badge>
						))}
					</div>
				</div>
			</Card>

			{/* Scoring Table */}
			<Card className='flex-1 overflow-hidden'>
				<div className='p-4'>
					<h4 className='mb-4 font-semibold'>Nhập điểm chấm</h4>

					<div className='max-h-96 space-y-3 overflow-y-auto'>
						{memberScores.map((member) => (
							<div key={member.memberId} className='space-y-2 rounded-lg border border-border p-3'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='font-medium'>{member.fullName}</p>
										<Badge variant={CouncilMemberRoleOptions[member.role as CouncilMemberRole].variant} className='mt-1'>
											{CouncilMemberRoleOptions[member.role as CouncilMemberRole].label}
										</Badge>
									</div>
									<Input
										type='number'
										min='0'
										max='10'
										step='0.5'
										placeholder='Điểm (0-10)'
										value={member.score ?? ''}
										onChange={(e) => handleScoreChange(member.memberId, e.target.value)}
										className='w-24'
									/>
								</div>
								<Textarea
									placeholder='Ghi chú (tùy chọn)'
									value={member.note}
									onChange={(e) => handleNoteChange(member.memberId, e.target.value)}
									className='text-xs'
									rows={2}
								/>
							</div>
						))}
					</div>
				</div>
			</Card>

			{/* Summary */}
			{averageScore > 0 && (
				<Card className='bg-secondary p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-muted-foreground'>Điểm trung bình</p>
							<p className='text-2xl font-bold'>{averageScore.toFixed(2)}</p>
							<p className={`w-fit rounded px-2 py-1 text-sm font-medium ${getGradeColor(averageScore)}`}>
								{gradeText}
							</p>
						</div>
						<div className='text-right'>
							<p className='text-xs text-muted-foreground'>Số lượng đánh giá</p>
							<p className='text-xl font-semibold'>
								{memberScores.filter((m) => m.score !== null).length}
							</p>
						</div>
					</div>
				</Card>
			)}

			{/* Actions */}
			<div className='flex gap-2'>
				<Button
					onClick={handleSubmitScores}
					disabled={memberScores.every((m) => m.score === null) || isLoadingMilestones}
					className='flex-1'
				>
					<Save className='mr-2 h-4 w-4' />
					Lưu điểm đề tài này
				</Button>
				<Button onClick={onSaveAll} variant='default' disabled={isLoadingMilestones} className='flex-1'>
					Hoàn tất chấm điểm
				</Button>
			</div>
		</div>
	)
}
