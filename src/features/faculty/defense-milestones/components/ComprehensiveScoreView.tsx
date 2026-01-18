import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import type { TopicAssignment } from '@/models/defenseCouncil.model'
import { CouncilMember, CouncilMemberRoleOptions } from '@/models/defenseCouncil.model'

interface ComprehensiveScoreViewProps {
	topic: TopicAssignment
}

export function ComprehensiveScoreView({ topic }: ComprehensiveScoreViewProps) {
	// Group scores by role
	console.log('hhhhh', topic)
	const scoresByRole = {
		[CouncilMember.Chairperson]: topic.scores?.filter((s) => s.scoreType === CouncilMember.Chairperson) || [],
		[CouncilMember.Secretary]: topic.scores?.filter((s) => s.scoreType === CouncilMember.Secretary) || [],
		[CouncilMember.Member]: topic.scores?.filter((s) => s.scoreType === CouncilMember.Member) || [],
		[CouncilMember.Supervisor]: topic.scores?.filter((s) => s.scoreType === CouncilMember.Supervisor) || [],
		[CouncilMember.Reviewer]: topic.scores?.filter((s) => s.scoreType === CouncilMember.Reviewer) || []
	}

	const calculateFinalScore = () => {
		const supervisor = scoresByRole[CouncilMember.Supervisor]?.[0]?.total || 0
		const reviewer = scoresByRole[CouncilMember.Reviewer]?.[0]?.total || 0
		const secretary = scoresByRole[CouncilMember.Secretary]?.[0]?.total || 0
		const chairperson = scoresByRole[CouncilMember.Chairperson]?.[0]?.total || 0
		const member = scoresByRole[CouncilMember.Member]?.[0]?.total || 0

		// Formula: ((GVHD + GVPB) × 2 + Thư ký + Chủ tịch + Ủy viên) / 7
		return ((supervisor + reviewer) * 2 + secretary + chairperson + member) / 7
	}

	const finalScore = calculateFinalScore()

	return (
		<div className='space-y-4'>
			{/* Topic Info */}
			<Card className='p-0'>
				<CardHeader>
					<CardTitle className='text-lg'>Thông tin đề tài</CardTitle>
				</CardHeader>
				<CardContent className='space-y-3'>
					<div>
						<p className='text-sm text-muted-foreground'>Tên đề tài:</p>
						<p className='font-medium'>{topic.titleVN}</p>
						<p className='text-sm text-muted-foreground'>{topic.titleEng}</p>
					</div>
					<div>
						<p className='text-sm text-muted-foreground'>Sinh viên thực hiện:</p>
						<div className='flex flex-wrap gap-2'>
							{topic.students?.map((student, idx) => (
								<Badge key={idx} variant='secondary'>
									{student.fullName} ({student.studentCode})
								</Badge>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Scores by Role */}
			<Card className='p-0'>
				<CardHeader>
					<CardTitle className='text-lg'>Chi tiết điểm đánh giá</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='overflow-x-auto'>
						<Table>
							<TableHeader className='bg-secondary/40'>
								<TableRow>
									<TableHead className='w-16'>STT</TableHead>
									<TableHead className='w-32'>Vai trò</TableHead>
									<TableHead>Họ và tên</TableHead>
									<TableHead className='w-24 text-center'>Điểm</TableHead>
									<TableHead className='w-48'>Nhận xét</TableHead>
									<TableHead className='w-32 text-center'>Trạng thái</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{Object.entries(scoresByRole).map(([role, scores], roleIdx) => (
									<>
										{scores.length > 0 ? (
											scores.map((score, scoreIdx: number) => (
												<TableRow key={score.scorerId}>
													<TableCell className='text-center'>{scoreIdx + 1}</TableCell>
													<TableCell>
														{
															CouncilMemberRoleOptions[
																role as keyof typeof CouncilMemberRoleOptions
															]?.label
														}
													</TableCell>
													<TableCell className='font-medium'>{score.scorerName}</TableCell>
													<TableCell className='text-center'>
														<span className='text-lg font-semibold text-primary'>
															{score.total?.toFixed(1) || '-'}
														</span>
													</TableCell>
													<TableCell className='text-sm'>{score.comment || '-'}</TableCell>
													<TableCell className='text-center'>
														<Badge variant='default'>Đã chấm</Badge>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow key={`${role}-empty`}>
												<TableCell className='text-center'>{roleIdx + 1}</TableCell>
												<TableCell>
													<Badge
														variant={
															CouncilMemberRoleOptions[
																role as keyof typeof CouncilMemberRoleOptions
															]?.variant || 'outline'
														}
													>
														{
															CouncilMemberRoleOptions[
																role as keyof typeof CouncilMemberRoleOptions
															]?.label
														}
													</Badge>
												</TableCell>
												<TableCell className='text-muted-foreground'>
													Chưa có người chấm
												</TableCell>
												<TableCell className='text-center'>-</TableCell>
												<TableCell>-</TableCell>
												<TableCell className='text-center'>
													<Badge variant='outline'>Chưa chấm</Badge>
												</TableCell>
											</TableRow>
										)}
									</>
								))}
							</TableBody>
						</Table>
					</div>

					<Separator className='my-4' />

					{/* Formula Explanation */}
					<div className='rounded-lg bg-muted p-4'>
						<p className='text-sm font-medium text-muted-foreground'>
							<span className='font-semibold'>Công thức tính điểm:</span> ((GVHD + GVPB) × 2 + Thư ký +
							Chủ tịch + Ủy viên) / 7
						</p>
					</div>

					{/* Final Score */}
					<div className='mt-4 rounded-lg border-2 border-primary bg-primary/10 p-6'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-muted-foreground'>Điểm tổng kết</p>
								<p className='text-4xl font-bold text-primary'>{finalScore.toFixed(2)}</p>
							</div>
							<div className='text-right'>
								<p className='text-sm text-muted-foreground'>Xếp loại</p>
								<Badge variant='default' className='mt-1 text-lg'>
									{topic.gradeText || '-'}
								</Badge>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
