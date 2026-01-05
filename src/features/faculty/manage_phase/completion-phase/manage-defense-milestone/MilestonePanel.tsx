'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, MapPin, Users, X, Plus, Book, Loader2 } from 'lucide-react'
import type { DefenseCouncilMember, ResponseMilestoneWithTemplate } from '@/models/milestone.model'
import { formatDate } from '@/utils/utils'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface MilestonesPanelProps {
	milestones: ResponseMilestoneWithTemplate[]
	selectedMilestone: string | null
	onSelectMilestone: (milestoneId: string) => void
	selectedTopics: Set<string>
	selectedLecturers: DefenseCouncilMember[]
	onAssignTopics: () => void
	onAssignCouncil: () => void
	onRemoveTopic: (milestoneId: string, topicId: string) => void
	onRemoveLecturer: (milestoneId: string, lecturer: DefenseCouncilMember) => void
	isLoadingMilestones?: boolean
}

export function MilestonesPanel({
	milestones,
	selectedMilestone,
	selectedLecturers,
	onSelectMilestone,
	selectedTopics,
	onAssignTopics,
	onAssignCouncil,
	onRemoveTopic,
	onRemoveLecturer,
	isLoadingMilestones
}: MilestonesPanelProps) {
	const navigate = useNavigate()
	const [isOpenNewMilestones, setIsOpenNewMilestones] = useState(false)
	return (
		<div className='flex w-1/2 flex-col gap-4'>
			<div className='flex flex-col gap-2'>
				<h2 className='text-2xl font-bold text-foreground'>Các đợt bảo vệ sắp tới</h2>
				<p className='text-sm text-muted-foreground'>Chọn một đợt bảo vệ và phân công đề tài</p>
			</div>

			<div className='max-h-cal space-y-3 overflow-y-auto pr-4'>
				{isLoadingMilestones ? (
					<Card className='border-dashed'>
						<CardContent className='pt-6 text-center text-muted-foreground'>
							<Loader2 className='mx-auto h-6 w-6 animate-spin' />
						</CardContent>
					</Card>
				) : milestones.length === 0 ? (
					<Card className='border-dashed'>
						<CardContent className='pt-6 text-center text-muted-foreground'>
							Chưa có đợt bảo vệ nào
						</CardContent>
					</Card>
				) : (
					<>
						{milestones.map((milestone) => (
							<Card
								key={milestone._id}
								className={`cursor-pointer p-2 transition-all ${
									selectedMilestone === milestone._id
										? 'border-2 border-blue-700'
										: 'hover:border-primary/50'
								} ${!milestone.isActive ? 'opacity-60' : ''}`}
								onClick={() => milestone.isActive && onSelectMilestone(milestone._id)}
							>
								<CardHeader className='pb-3'>
									<div className='flex flex-col items-start justify-between lg:flex-row'>
										<div className='flex-1'>
											<CardTitle className='text-base'>{milestone.title}</CardTitle>
											<CardDescription className='mt-1 text-xs'>
												{!milestone.isActive && 'Inactive'}
											</CardDescription>
										</div>
										<Badge variant={milestone.isActive ? 'default' : 'secondary'}>
											{milestone.isActive ? 'Đang có hiệu lực' : 'Không còn hiệu lực'}
										</Badge>
									</div>
								</CardHeader>

								<CardContent className='space-y-3'>
									{/* Defense Info */}
									<div className='space-y-2 text-sm'>
										<div className='flex items-center gap-2 text-muted-foreground'>
											<Calendar className='h-4 w-4' />
											<span>
												{milestone.dueDate ? formatDate(milestone.dueDate) : 'Date TBD'}
											</span>
											{!milestone.isScorable && (
												<Button
													onClick={(e) => {e.stopPropagation()
														navigate(`/defense-milestones/${milestone._id}/scoring`)
													}}
													className='bg-cyan-100 px-4 font-semibold text-cyan-700 hover:bg-cyan-200'
												>
													Chấm điểm
												</Button>
											)}
										</div>
										{milestone.location && (
											<div className='flex items-center gap-2 text-muted-foreground'>
												<MapPin className='h-4 w-4' />
												<span>{milestone.location}</span>
											</div>
										)}
									</div>

									{/* Council Members */}
									<div className='border-t pt-3'>
										<div className='mb-2 flex items-center gap-2 text-sm font-semibold text-foreground'>
											<Users className='h-4 w-4' />
											Hội đồng bảo vệ ({milestone.defenseCouncil.length})
										</div>
										{selectedMilestone === milestone._id && selectedLecturers.length > 0 && (
											<Button
												size='sm'
												variant='outline'
												onClick={onAssignCouncil}
												className='mb-2 h-7 w-full border-gray-400 bg-transparent text-xs'
											>
												<Plus className='mr-1 h-3 w-3' />
												Thêm {selectedLecturers.length} giảng viên
											</Button>
										)}
										<div>
											{selectedMilestone === milestone._id && (
												<div>
													{milestone.defenseCouncil.length > 0 ? (
														<div className='max-h-56 space-y-1 overflow-y-auto'>
															{milestone.defenseCouncil.map((member) => (
																<div
																	onClick={() =>
																		navigate(`/profile/lecturer/${member.memberId}`)
																	}
																	key={member.memberId}
																	className='flex items-center justify-between rounded border border-gray-200 bg-secondary/30 p-2 text-xs hover:bg-slate-100'
																>
																	<div className='flex-1'>
																		<span className='font-medium'>
																			{member.fullName}
																		</span>
																		<Badge
																			variant='outline'
																			className='ml-2 text-xs'
																		>
																			{member.role === 'chairperson'
																				? 'Chủ tịch'
																				: member.role === 'secretary'
																					? 'Thư ký'
																					: 'Ủy viên'}
																		</Badge>
																	</div>
																	<button
																		onClick={(e) => {
																			e.stopPropagation()
																			onRemoveLecturer(milestone._id, member)
																		}}
																		className='flex-shrink-0 p-1 py-2 text-muted-foreground transition-colors hover:text-destructive'
																	>
																		<X className='h-3 w-3' />
																	</button>
																</div>
															))}
														</div>
													) : (
														<p className='text-xs italic text-muted-foreground'>
															Chưa có giảng viên nào trong hội đồng
														</p>
													)}
												</div>
											)}
										</div>
									</div>

									{/* Assigned Topics */}
									<div className='space-y-2 border-t pt-3'>
										<div className='flex flex-wrap items-center justify-between'>
											<h4 className='flex gap-2 text-sm font-semibold text-foreground'>
												<Book className='h-4 w-4' />
												Các đề tài sẽ bảo vệ trong đợt ({milestone.topicSnaps?.length ?? 0})
											</h4>
											{selectedTopics.size > 0 && (
												<Button
													size='sm'
													variant='outline'
													onClick={onAssignTopics}
													className='h-7 border border-gray-400 bg-transparent text-xs hover:bg-gray-200'
												>
													<Plus className='mr-1 h-3 w-3' />
													Thêm {selectedTopics.size} đề tài
												</Button>
											)}
										</div>
										{selectedMilestone === milestone._id && (
											<div>
												{(milestone.topicSnaps?.length ?? 0) === 0 &&
												selectedTopics.size === 0 ? (
													<p className='text-xs italic text-muted-foreground'>
														Không có đề tài nào được đưa vào đợt bảo vệ này
													</p>
												) : (
													<div className='max-h-40 space-y-2 overflow-y-auto'>
														{milestone.topicSnaps?.map((topic) => (
															<div
																key={topic._id}
																className='flex items-start justify-between gap-2 rounded border border-gray-300 bg-secondary/50 p-2 hover:bg-slate-100'
																onClick={() => {
																	navigate(`/detail-topic/${topic._id}`)
																}}
															>
																<div className='min-w-0 flex-1'>
																	<p className='truncate text-xs font-medium text-foreground'>
																		{topic.titleVN}
																	</p>
																	<p className='text-xs text-muted-foreground'>
																		{topic.studentName.join(', ')}
																	</p>
																</div>
																<button
																	onClick={(e) => {
																		e.stopPropagation()
																		onRemoveTopic(milestone._id, topic._id)
																	}}
																	className='z-10 flex-shrink-0 text-muted-foreground transition-colors hover:text-destructive'
																>
																	<X className='h-3 w-3' />
																</button>
															</div>
														))}
													</div>
												)}
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						))}
						<Card className='border-2 border-dashed border-gray-300'>
							<Button
								variant='outline'
								className='w-full border-dashed text-muted-foreground hover:bg-muted'
								onClick={() => navigate('create-defense-assignment')}
							>
								<Plus className='mr-2 h-4 w-4' />
								Tạo đợt bảo vệ mới
							</Button>
						</Card>
					</>
				)}
			</div>
		</div>
	)
}
