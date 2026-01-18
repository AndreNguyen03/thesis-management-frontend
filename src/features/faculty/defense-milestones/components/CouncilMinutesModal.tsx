'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle2, Download, Loader2, FileText, Save } from 'lucide-react'
import RichTextEditor from '@/components/common/RichTextEditor'
import {
	CouncilMember,
	CouncilMemberRoleOptions,
	type DefenseMilestoneDto,
	type TopicAssignment,
	type CouncilMemberRole
} from '@/models/defenseCouncil.model'
import type { MiniPeriod } from '@/models/period.model'
import { useLazyExportCouncilMinutesPdfQuery, useUpdateCouncilCommentsMutation } from '@/services/defenseCouncilApi'
import { useToast } from '@/hooks/use-toast'

interface AggregatedCouncilMember {
	memberId: string
	fullName: string
	title?: string
	roles: string[] // Can have multiple roles across different topics
}

interface ContextData {
	defenseMilestone: DefenseMilestoneDto // Đợt bảo vệ
	periodInfo: MiniPeriod
	name: string // VD: "Hội đồng 1 - Phòng E03.2"
	location: string // Phòng bảo vệ
	scheduledDate: Date // Thời gian bảo vệ
	topic: TopicAssignment
	councilId: string
	allCouncilMembers?: AggregatedCouncilMember[] // Aggregated members from all topics
	allTopics?: TopicAssignment[] // Tất cả đề tài trong hội đồng
	councilComments?: string // Ý kiến trao đổi của hội đồng
}
interface CouncilMinutesModalProps {
	isOpen: boolean
	onClose: () => void
	context?: ContextData
}

export function CouncilMinutesModal({ isOpen, onClose, context }: CouncilMinutesModalProps) {
	const { toast } = useToast()
	const [triggerExportPdf, { isLoading: isDownloadingPdf }] = useLazyExportCouncilMinutesPdfQuery()
	const [updateComments, { isLoading: isSavingComments }] = useUpdateCouncilCommentsMutation()
	const [councilComments, setCouncilComments] = useState('')

	useEffect(() => {
		if (context?.councilComments) {
			setCouncilComments(context.councilComments)
		}
	}, [context?.councilComments])

	// Tính điểm tổng kết cho từng sinh viên
	const calculateStudentScores = () => {
		if (!context?.topic.students) return []

		return context.topic.students.map((student, index) => {
			// Lấy điểm của từng loại scorer cho sinh viên này
			const advisorScore = context.topic.scores?.find(
				(s) => s.scoreType === 'supervisor' && s.studentId === student.userId
			)
			const reviewerScore = context.topic.scores?.find(
				(s) => s.scoreType === 'reviewer' && s.studentId === student.userId
			)
			const chairmanScore = context.topic.scores?.find(
				(s) => s.scoreType === 'chairperson' && s.studentId === student.userId
			)
			const secretaryScore = context.topic.scores?.find(
				(s) => s.scoreType === 'secretary' && s.studentId === student.userId
			)
			const memberScore = context.topic.scores?.find(
				(s) => s.scoreType === 'member' && s.studentId === student.userId
			)

			// Tính điểm tổng kết: (CTHĐ + TKHĐ + CBHD×2 + CBPB×2) / 6
			const totalScore =
				(chairmanScore?.total || 0) +
				(secretaryScore?.total || 0) +
				(advisorScore?.total || 0) * 2 +
				(reviewerScore?.total || 0) * 2
			const finalScore = (totalScore / 6).toFixed(2)

			return {
				stt: index + 1,
				name: student.fullName,
				studentCode: student.studentCode,
				advisorScore: advisorScore?.total?.toFixed(2) || '--',
				reviewerScore: reviewerScore?.total?.toFixed(2) || '--',
				chairmanScore: chairmanScore?.total?.toFixed(2) || '--',
				secretaryScore: secretaryScore?.total?.toFixed(2) || '--',
				memberScore: memberScore?.total?.toFixed(2) || '--',
				totalScore: finalScore
			}
		})
	}

	const studentScores = calculateStudentScores()

	// Lấy thông tin GVHD và GVPB
	const advisor = context?.topic.members?.find((m) => m.role === CouncilMember.Supervisor)
	const reviewer = context?.topic.members?.find((m) => m.role === CouncilMember.Reviewer)

	// Xuất PDF
	const handleExportPdf = async () => {
		if (!context?.councilId || !context?.topic.topicId) {
			toast({ title: 'Lỗi', description: 'Thiếu thông tin cần thiết', variant: 'destructive' })
			return
		}

		try {
			const blob = await triggerExportPdf({
				councilId: context.councilId,
				topicId: context.topic.topicId
			}).unwrap()

			// Create download link
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url

			// Generate filename
			const topicId = context.topic.topicId.substring(0, 8)
			a.download = `BienBan_${topicId}.pdf`

			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			window.URL.revokeObjectURL(url)

			toast({ title: 'Thành công', description: 'Đã tải xuống biên bản hội đồng' })
		} catch (error: any) {
			toast({
				title: 'Lỗi',
				description: error?.data?.message || 'Không thể tải xuống biên bản',
				variant: 'destructive'
			})
		}
	}
	const councilData = {
		batch: context?.defenseMilestone.title,
		academicYear: context?.periodInfo.year || '2023-2024',
		faculty: context?.periodInfo.faculty.name,
		trainingSystem: 'Chương trình đại trà',
		meeting: {
			startTime: new Date(context?.scheduledDate || '').toLocaleTimeString('vi-VN', {
				hour: '2-digit',
				minute: '2-digit'
			}),
			date: new Date(context?.scheduledDate || '').toLocaleDateString('vi-VN'),
			room: context?.location || 'Phòng A207'
		},
		councilMembers: context?.allCouncilMembers
			? context.allCouncilMembers.map((member) => ({
					name: member.fullName,
					roles: member.roles,
					title: member.title,
					sign: '(Ký, ghi rõ họ tên)'
				}))
			: context?.topic.members.map((member) => ({
					name: member.fullName,
					roles: [member.role],
					title: member.title,
					sign: '(Ký, ghi rõ họ tên)'
				})),
		thesisInfo: context?.topic
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-h-[90vh] w-full max-w-5xl overflow-y-auto border-border bg-white pb-6 pl-8 pr-8 pt-0'>
				<DialogHeader className='sticky top-0 z-10 bg-white pb-4 pt-6 text-center'>
					<div className='mb-2 text-center'>
						<p className='text-sm font-medium text-gray-600'>ĐẠI HỌC QUỐC GIA TP.HCM</p>
						<p className='text-sm font-bold text-gray-800'>{councilData?.faculty?.toUpperCase() || ''}</p>
					</div>
					<Separator className='my-3 bg-gray-300' />
					<DialogTitle className='text-center text-xl font-bold uppercase text-gray-900'>
						Biên bản hội đồng chấm khóa luận tốt nghiệp
					</DialogTitle>
					<p className='mt-2 text-sm text-gray-600'>
						Đợt {councilData.batch} - Năm học {councilData.academicYear}
					</p>
				</DialogHeader>

				<div className='space-y-6'>
					{/* I. Thời gian và địa điểm */}
					<Card className='border border-gray-200 bg-gray-50/50 p-0'>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base font-bold text-gray-800'>
								I. THỜI GIAN VÀ ĐỊA ĐIỂM HỌP
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-3'>
							<div className='grid gap-4 sm:grid-cols-2'>
								<div className='rounded-md bg-white p-3 shadow-sm'>
									<p className='mb-1 text-xs font-semibold uppercase text-gray-500'>
										Thời gian bắt đầu
									</p>
									<p className='text-sm font-medium text-gray-900'>
										{councilData.meeting.startTime}, ngày {councilData.meeting.date}
									</p>
								</div>
								<div className='rounded-md bg-white p-3 shadow-sm'>
									<p className='mb-1 text-xs font-semibold uppercase text-gray-500'>Địa điểm</p>
									<p className='text-sm font-medium text-gray-900'>{councilData.meeting.room}</p>
								</div>
							</div>
							<div className='rounded-md bg-white p-3 shadow-sm'>
								<p className='mb-1 text-xs font-semibold uppercase text-gray-500'>Hệ đào tạo</p>
								<p className='text-sm font-medium text-gray-900'>{councilData.trainingSystem}</p>
							</div>
						</CardContent>
					</Card>

					{/* II. Thành phần hội đồng */}
					<Card className='border border-gray-200 bg-gray-50/50 p-0'>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base font-bold text-gray-800'>II. THÀNH PHẦN HỘI ĐỒNG</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='overflow-hidden rounded-lg border border-gray-200'>
								<Table>
									<TableHeader className='bg-gray-100'>
										<TableRow>
											<TableHead className='w-12 border-r border-gray-200 font-bold text-gray-700'>
												STT
											</TableHead>
											<TableHead className='border-r border-gray-200 font-bold text-gray-700'>
												Họ và tên
											</TableHead>
											<TableHead className='border-r border-gray-200 font-bold text-gray-700'>
												Vai trò
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{councilData?.councilMembers?.map((member, idx) => (
											<TableRow key={idx} className='border-b border-gray-200 bg-white'>
												<TableCell className='border-r border-gray-200 text-center font-medium'>
													{idx + 1}
												</TableCell>
												<TableCell className='border-r border-gray-200 font-medium'>
													{member.title} {member.name}
												</TableCell>
												<TableCell className='border-r border-gray-200'>
													<div className='flex flex-wrap gap-1'>
														{member.roles.map((role, roleIdx) => (
															<Badge
																key={roleIdx}
																variant='outline'
																className='border-blue-600 text-blue-600'
															>
																{CouncilMemberRoleOptions[role as CouncilMemberRole]
																	?.label || role}
															</Badge>
														))}
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>

					{/* III. Nội dung */}
					<Card className='border border-gray-200 bg-gray-50/50 p-0'>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base font-bold text-gray-800'>III. NỘI DUNG</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							{/* 1. Thông tin đề tài */}
							<div>
								<h4 className='mb-3 font-bold text-gray-800'>1. Thông tin đề tài</h4>
								<div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
									<Table>
										<TableHeader className='bg-gray-50'>
											<TableRow>
												<TableHead className='w-16 border-r border-gray-200 text-center font-bold text-gray-700'>
													STT
												</TableHead>
												<TableHead className='border-r border-gray-200 font-bold text-gray-700'>
													Tên đề tài
												</TableHead>
												<TableHead className='border-r border-gray-200 font-bold text-gray-700'>
													Sinh viên thực hiện
												</TableHead>
												<TableHead className='border-r border-gray-200 font-bold text-gray-700'>
													CBHD
												</TableHead>
												<TableHead className='font-bold text-gray-700'>CBPB</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{(context?.allTopics || [context?.topic]).map((topic, idx) => {
												if (!topic) return null
												const advisor = topic.members?.find(
													(m) => m.role === CouncilMember.Supervisor
												)
												const reviewer = topic.members?.find(
													(m) => m.role === CouncilMember.Reviewer
												)
												return (
													<TableRow key={topic.topicId} className='border-b border-gray-200'>
														<TableCell className='border-r border-gray-200 text-center font-medium'>
															{topic.defenseOrder || idx + 1}
														</TableCell>
														<TableCell className='border-r border-gray-200'>
															<div>
																<p className='font-medium text-gray-900'>
																	{topic.titleVN}
																</p>
																{topic.titleEng && (
																	<p className='mt-1 text-sm italic text-gray-600'>
																		{topic.titleEng}
																	</p>
																)}
															</div>
														</TableCell>
														<TableCell className='border-r border-gray-200'>
															<div className='space-y-1'>
																{topic.students?.map((student) => (
																	<p
																		key={student.userId}
																		className='text-sm text-gray-700'
																	>
																		{student.fullName} ({student.studentCode})
																	</p>
																))}
															</div>
														</TableCell>
														<TableCell className='border-r border-gray-200 text-sm text-gray-700'>
															{advisor
																? `${advisor.title || ''} ${advisor.fullName}`
																: '--'}
														</TableCell>
														<TableCell className='text-sm text-gray-700'>
															{reviewer
																? `${reviewer.title || ''} ${reviewer.fullName}`
																: '--'}
														</TableCell>
													</TableRow>
												)
											})}
										</TableBody>
									</Table>
								</div>
							</div>

							{/* 2. Sinh viên thực hiện */}
							<div>
								<h4 className='mb-3 font-bold text-gray-800'>2. Sinh viên thực hiện</h4>
								<div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
									<Table>
										<TableHeader className='bg-gray-50'>
											<TableRow>
												<TableHead className='w-12 border-r border-gray-200 font-bold text-gray-700'>
													STT
												</TableHead>
												<TableHead className='border-r border-gray-200 font-bold text-gray-700'>
													MSSV
												</TableHead>
												<TableHead className='font-bold text-gray-700'>Họ và tên</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{(() => {
												const allStudents: Array<{
													userId: string
													studentCode?: string
													fullName: string
												}> = []
												const topics =
													context?.allTopics || (context?.topic ? [context.topic] : [])
												topics.forEach((topic) => {
													topic.students?.forEach((student) => {
														if (!allStudents.find((s) => s.userId === student.userId)) {
															allStudents.push(student)
														}
													})
												})
												return allStudents.map((student, idx) => (
													<TableRow key={student.userId} className='border-b border-gray-200'>
														<TableCell className='border-r border-gray-200 text-center font-medium'>
															{idx + 1}
														</TableCell>
														<TableCell className='border-r border-gray-200 font-medium text-gray-700'>
															{student.studentCode || '--'}
														</TableCell>
														<TableCell className='font-medium text-gray-900'>
															{student.fullName}
														</TableCell>
													</TableRow>
												))
											})()}
										</TableBody>
									</Table>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* IV. Nội dung */}
					<Card className='border border-gray-200 bg-gray-50/50 p-0'>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base font-bold text-gray-800'>IV. NỘI DUNG</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							{/* 1. Hội đồng làm việc */}
							<div>
								<h4 className='mb-3 font-bold text-gray-800'>1. Hội đồng làm việc</h4>
								<div className='rounded-lg bg-white p-4 shadow-sm'>
									<ul className='space-y-2 text-sm text-gray-700'>
										<li className='flex gap-2'>
											<span className='font-semibold'>a.</span>
											<span>Thư ký đọc quyết định thành lập hội đồng.</span>
										</li>
										<li className='flex gap-2'>
											<span className='font-semibold'>b.</span>
											<span>Chủ tịch hội đồng điều khiển buổi bảo vệ.</span>
										</li>
										<li className='flex gap-2'>
											<span className='font-semibold'>c.</span>
											<span>Sinh viên trình bày đề tài.</span>
										</li>
										<li className='flex gap-2'>
											<span className='font-semibold'>d.</span>
											<span>CBPB (hoặc thư ký) đọc nhận xét.</span>
										</li>
										<li className='flex gap-2'>
											<span className='font-semibold'>e.</span>
											<span>Sinh viên trả lời các câu hỏi của CBPB và hội đồng.</span>
										</li>
										<li className='flex gap-2'>
											<span className='font-semibold'>f.</span>
											<span>CBHD (hoặc thư ký) đọc nhận xét.</span>
										</li>
										<li className='flex gap-2'>
											<span className='font-semibold'>g.</span>
											<span>Hội đồng trao đổi và chấm điểm.</span>
										</li>
									</ul>
								</div>
							</div>

							{/* 2. Ý kiến trao đổi của hội đồng */}
							<div>
								<h4 className='mb-3 font-bold text-gray-800'>2. Ý kiến trao đổi của hội đồng</h4>
								<div className='rounded-lg bg-white p-4 shadow-sm'>
									<RichTextEditor
										value={councilComments}
										onChange={setCouncilComments}
										placeholder='Nhập ý kiến trao đổi của hội đồng...'
										disabled={false}
									/>
									<div></div>
									<div className='mt-3 flex justify-end'>
										<Button
											size='sm'
											variant='default'
											onClick={async () => {
												if (!context?.councilId) return
												try {
													await updateComments({
														councilId: context.councilId,
														councilComments
													}).unwrap()
													toast({
														title: 'Thành công',
														description: 'Đã lưu ý kiến hội đồng',
														variant: 'default'
													})
												} catch (error: any) {
													toast({
														title: 'Lỗi',
														description: error?.data?.message || 'Không thể lưu ý kiến',
														variant: 'destructive'
													})
												}
											}}
											disabled={isSavingComments}
											className='bg-green-600 hover:bg-green-700'
										>
											{isSavingComments ? (
												<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											) : (
												<Save className='mr-2 h-4 w-4' />
											)}
											{isSavingComments ? 'Đang lưu...' : 'Lưu ý kiến'}
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card className='border border-gray-200 bg-gray-50/50 p-0'>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base font-bold text-gray-800'>
								IV. KẾT LUẬN - BẢNG ĐIỂM TỔNG HỢP
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
								<Table>
									<TableHeader className='bg-gray-100'>
										<TableRow>
											<TableHead className='border-r border-gray-200 text-center font-bold text-gray-700'>
												STT
											</TableHead>
											<TableHead className='border-r border-gray-200 font-bold text-gray-700'>
												Họ và tên
											</TableHead>
											<TableHead className='border-r border-gray-200 text-center font-bold text-gray-700'>
												MSSV
											</TableHead>
											<TableHead className='border-r border-gray-200 text-center font-bold text-gray-700'>
												CBHD
											</TableHead>
											<TableHead className='border-r border-gray-200 text-center font-bold text-gray-700'>
												CBPB
											</TableHead>
											<TableHead className='border-r border-gray-200 text-center font-bold text-gray-700'>
												CTHĐ
											</TableHead>
											<TableHead className='border-r border-gray-200 text-center font-bold text-gray-700'>
												TKHĐ
											</TableHead>
											<TableHead className='border-r border-gray-200 text-center font-bold text-gray-700'>
												UVHĐ
											</TableHead>
											<TableHead className='text-center font-bold text-gray-700'>
												Điểm TB
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{studentScores.map((student) => (
											<TableRow key={student.stt} className='border-b border-gray-200'>
												<TableCell className='border-r border-gray-200 text-center font-medium'>
													{student.stt}
												</TableCell>
												<TableCell className='border-r border-gray-200 font-medium text-gray-900'>
													{student.name}
												</TableCell>
												<TableCell className='border-r border-gray-200 text-center text-gray-700'>
													{student.studentCode}
												</TableCell>
												<TableCell className='border-r border-gray-200 text-center font-semibold text-gray-900'>
													{student.advisorScore}
												</TableCell>
												<TableCell className='border-r border-gray-200 text-center font-semibold text-gray-900'>
													{student.reviewerScore}
												</TableCell>
												<TableCell className='border-r border-gray-200 text-center font-semibold text-gray-900'>
													{student.chairmanScore}
												</TableCell>
												<TableCell className='border-r border-gray-200 text-center font-semibold text-gray-900'>
													{student.secretaryScore}
												</TableCell>
												<TableCell className='border-r border-gray-200 text-center font-semibold text-gray-900'>
													{student.memberScore}
												</TableCell>
												<TableCell className='text-center'>
													<Badge className='bg-blue-600 px-3 py-1 text-base font-bold text-white'>
														{student.totalScore}
													</Badge>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
							<div className='mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3'>
								<p className='text-xs font-semibold text-blue-800'>
									<FileText className='mb-1 mr-1 inline h-3 w-3' />
									Công thức tính điểm: Điểm TB = (CTHĐ + TKHĐ + CBHD×2 + CBPB×2) / 6
								</p>
							</div>
						</CardContent>
					</Card>

					{/* VI. Kết luận chung */}
					<Card className='border border-gray-200 bg-gray-50/50 p-0'>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base font-bold text-gray-800'>VI. KẾT LUẬN CHUNG</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='rounded-lg bg-white p-4 shadow-sm'>
								<p className='mb-3 text-sm text-gray-700'>
									Hội đồng đã thảo luận và thống nhất kết quả chấm điểm cho các sinh viên thực hiện đề
									tài như trên.
								</p>
								<div className='mt-4 text-sm text-gray-700'>
									<p className='mb-2 font-semibold'>Biên bản được lập thành 02 bản:</p>
									<ul className='ml-6 list-disc space-y-1 text-gray-600'>
										<li>01 bản lưu tại Phòng Đào tạo</li>
										<li>01 bản lưu tại Khoa</li>
									</ul>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Signature Section */}
				<div className='mt-6 grid gap-6 sm:grid-cols-2'>
					<div className='text-center'>
						<p className='mb-1 text-sm font-bold text-gray-800'>THƯ KÝ HỘI ĐỒNG</p>
						<p className='mb-12 text-xs italic text-gray-500'>(Ký và ghi rõ họ tên)</p>
						<p className='text-sm font-medium text-gray-700'>
							{councilData?.councilMembers?.find((m) => m.roles.includes(CouncilMember.Secretary))
								?.name || ''}
						</p>
					</div>
					<div className='text-center'>
						<p className='mb-1 text-sm font-bold text-gray-800'>CHỦ TỊCH HỘI ĐỒNG</p>
						<p className='mb-12 text-xs italic text-gray-500'>(Ký và ghi rõ họ tên)</p>
						<p className='text-sm font-medium text-gray-700'>
							{councilData?.councilMembers?.find((m) => m.roles.includes(CouncilMember.Chairperson))
								?.name || ''}
						</p>
					</div>
				</div>

				{/* Actions */}
				<Separator className='my-4 bg-gray-300' />
				<div className='flex gap-3'>
					<Button
						variant='outline'
						className='flex-1 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100'
						onClick={handleExportPdf}
						disabled={isDownloadingPdf}
					>
						{isDownloadingPdf ? (
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
						) : (
							<Download className='mr-2 h-4 w-4' />
						)}
						{isDownloadingPdf ? 'Đang xuất PDF...' : 'Xuất biên bản PDF'}
					</Button>
					<Button className='flex-1 bg-blue-600 text-white hover:bg-blue-700' onClick={onClose}>
						<CheckCircle2 className='mr-2 h-4 w-4' />
						Đóng
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
