import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSubmitTopicScoresMutation } from '@/services/defenseCouncilApi'
import { Loader2 } from 'lucide-react'
import type { CouncilMemberDto, Score} from '@/models/defenseCouncil.model'
import { toast } from 'sonner'

interface ScoreEntryModalProps {
	open: boolean
	onClose: () => void
	councilId: string
	topicId: string
	topicTitle: string
	studentNames: string[]
	members: CouncilMemberDto[]
	existingScores?: Score[]
	isLocked?: boolean
}

const roleLabels: Record<string, string> = {
	chairperson: 'Chủ tịch',
	secretary: 'Thư ký',
	member: 'Ủy viên',
	reviewer: 'Phản biện',
	supervisor: 'GVHD'
}

export function ScoreEntryModal({
	open,
	onClose,
	councilId,
	topicId,
	topicTitle,
	studentNames,
	members,
	existingScores = [],
	isLocked = false
}: ScoreEntryModalProps) {
	const [submitScores, { isLoading }] = useSubmitTopicScoresMutation()

	// Initialize scores state
	const [scores, setScores] = useState<Record<string, { total: string; comment: string }>>({})

	useEffect(() => {
		// Initialize scores from existing data or empty
		const initialScores: Record<string, { total: string; comment: string }> = {}

		members.forEach((member) => {
			const existingScore = existingScores.find((s) => s.scorerId === member.memberId)
			initialScores[member.memberId] = {
				total: existingScore ? existingScore.total.toString() : '',
				comment: existingScore?.comment || ''
			}
		})

		setScores(initialScores)
	}, [members, existingScores])

	const handleScoreChange = (memberId: string, field: 'total' | 'comment', value: string) => {
		setScores((prev) => ({
			...prev,
			[memberId]: {
				...prev[memberId],
				[field]: value
			}
		}))
	}

	const calculateFinalScore = () => {
		const supervisor = parseFloat(scores[members.find((m) => m.role === 'supervisor')?.memberId!]?.total || '0')
		const reviewer = parseFloat(scores[members.find((m) => m.role === 'reviewer')?.memberId!]?.total || '0')
		const secretary = parseFloat(scores[members.find((m) => m.role === 'secretary')?.memberId!]?.total || '0')
		const chairperson = parseFloat(scores[members.find((m) => m.role === 'chairperson')?.memberId!]?.total || '0')

		// Formula: ((supervisor + reviewer) * 2 + secretary + chairperson) / 6
		const weightedTotal = (supervisor + reviewer) * 2 + secretary + chairperson
		const finalScore = weightedTotal / 6

		return Math.round(finalScore * 100) / 100
	}

	const getGradeText = (finalScore: number) => {
		if (finalScore >= 9.0) return 'Xuất sắc'
		if (finalScore >= 8.0) return 'Giỏi'
		if (finalScore >= 7.0) return 'Khá'
		if (finalScore >= 5.5) return 'Trung bình'
		if (finalScore >= 4.0) return 'Yếu'
		return 'Kém'
	}

	const handleSubmit = async () => {
		// Validate all scores
		const scoresData = members.map((member) => {
			const scoreValue = parseFloat(scores[member.memberId]?.total || '')

			if (isNaN(scoreValue)) {
				throw new Error(`Vui lòng nhập điểm cho ${roleLabels[member.role]} - ${member.fullName}`)
			}

			if (scoreValue < 0 || scoreValue > 10) {
				throw new Error(`Điểm phải từ 0-10 (${roleLabels[member.role]} - ${member.fullName})`)
			}

			return {
				scorerId: member.memberId,
				scorerName: member.fullName,
				scoreType: member.role,
				total: scoreValue,
				comment: scores[member.memberId]?.comment || ''
			}
		})

		try {
			await submitScores({
				councilId,
				topicId,
				scores: scoresData
			}).unwrap()

			toast.success('Lưu điểm thành công', {
				description: 'Điểm đã được lưu nháp.'
			})

			onClose()
		} catch (error: any) {
			toast.error('Lỗi', {
				description: error?.data?.message || 'Không thể lưu điểm'
			})
		}
	}

	const finalScore = calculateFinalScore()
	const gradeText = getGradeText(finalScore)

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Nhập điểm: {topicTitle}</DialogTitle>
					<div className='text-sm text-muted-foreground'>Sinh viên: {studentNames.join(', ')}</div>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					{members.map((member) => (
						<div key={member.memberId} className='space-y-3 rounded-lg border border-gray-300 p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='font-medium'>
										<span className='font-semibold'>{roleLabels[member.role]}</span> -{' '}
										{member.title} {member.fullName}
									</div>
								</div>
							</div>

							<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
								<div>
									<Label htmlFor={`score-${member.memberId}`}>
										Điểm <span className='text-red-500'>*</span>
									</Label>
									<Input
										id={`score-${member.memberId}`}
										type='number'
										min='0'
										max='10'
										step='0.1'
										placeholder='0.0 - 10.0'
										value={scores[member.memberId]?.total || ''}
										onChange={(e) => handleScoreChange(member.memberId, 'total', e.target.value)}
										disabled={isLocked}
										className='bg-white'
									/>
								</div>
								<div>
									<Label htmlFor={`comment-${member.memberId}`}>Ghi chú</Label>
									<Textarea
										id={`comment-${member.memberId}`}
										placeholder='Nhận xét, góp ý...'
										value={scores[member.memberId]?.comment || ''}
										onChange={(e) => handleScoreChange(member.memberId, 'comment', e.target.value)}
										disabled={isLocked}
										rows={1}
										className='bg-white'
									/>
								</div>
							</div>
						</div>
					))}

					{/* Final Score Display */}
					<div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
						<div className='flex items-center justify-between'>
							<div className='text-lg font-semibold'>➡️ Điểm trung bình: {finalScore.toFixed(2)}</div>
							<div className='text-lg font-semibold text-blue-700'>{gradeText}</div>
						</div>
						<div className='mt-1 text-sm text-muted-foreground'>
							Tính trung bình từ {members.length} người chấm
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={onClose} disabled={isLoading}>
						Hủy
					</Button>
					{!isLocked && (
						<>
							<Button
								variant='secondary'
								className='bg-blue-600 text-white hover:bg-blue-500'
								onClick={() => handleSubmit()}
								disabled={isLoading}
							>
								{isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
								Lưu nháp
							</Button>
						</>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
