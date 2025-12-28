'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, MapPin, Users, X, Plus } from 'lucide-react'
import { format } from 'date-fns'
import type { ResponseMilestoneWithTemplate } from '@/models/milestone.model'
import { formatDate } from '@/utils/utils'

interface MilestonesPanelProps {
	milestones: ResponseMilestoneWithTemplate[]
	selectedMilestone: string | null
	onSelectMilestone: (milestoneId: string) => void
	selectedTopics: Set<string>
	onAssignTopics: () => void
	onRemoveTopic: (milestoneId: string, topicId: string) => void
}

export function MilestonesPanel({
	milestones,
	selectedMilestone,
	onSelectMilestone,
	selectedTopics,
	onAssignTopics,
	onRemoveTopic
}: MilestonesPanelProps) {
	const currentMilestone = milestones.find((m) => m._id === selectedMilestone)

	return (
		<div className='flex w-1/2 flex-col gap-4'>
			<div className='flex flex-col gap-2'>
				<h2 className='text-2xl font-bold text-foreground'>Defense Milestones</h2>
				<p className='text-sm text-muted-foreground'>Select a milestone and assign topics</p>
			</div>

			<ScrollArea className='flex-1'>
				<div className='space-y-3 pr-4'>
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
								<div className='flex items-start justify-between'>
									<div className='flex-1'>
										<CardTitle className='text-base'>{milestone.title}</CardTitle>
										<CardDescription className='mt-1 text-xs'>
											{!milestone.isActive && 'Inactive'}
										</CardDescription>
									</div>
									<Badge variant={milestone.isActive ? 'default' : 'secondary'}>
										{milestone.isActive ? 'Active' : 'Inactive'}
									</Badge>
								</div>
							</CardHeader>

							<CardContent className='space-y-3'>
								{/* Defense Info */}
								<div className='space-y-2 text-sm'>
									<div className='flex items-center gap-2 text-muted-foreground'>
										<Calendar className='h-4 w-4' />
										<span>{milestone.dueDate ? formatDate(milestone.dueDate) : 'Date TBD'}</span>
									</div>
									{milestone.location && (
										<div className='flex items-center gap-2 text-muted-foreground'>
											<MapPin className='h-4 w-4' />
											<span>{milestone.location}</span>
										</div>
									)}
								</div>

								{/* Council Members */}
								{milestone.defenseCouncil.length > 0 && (
									<div className='border-t pt-3'>
										<div className='mb-2 flex items-center gap-2 text-sm font-semibold text-foreground'>
											<Users className='h-4 w-4' />
											Defense Council
										</div>
										<div className='space-y-1'>
											{milestone.defenseCouncil.map((member) => (
												<div key={member.memberId} className='text-xs text-muted-foreground'>
													<span className='font-medium'>{member.fullName}</span>
													<span className='ml-2 text-xs text-muted-foreground/70'>
														({member.role})
													</span>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Assigned Topics */}
								{selectedMilestone === milestone._id && (
									<div className='space-y-2 border-t pt-3'>
										<div className='flex items-center justify-between'>
											<h4 className='text-sm font-semibold text-foreground'>
												Assigned Topics ({milestone.topicSnaps?.length ?? 0})
											</h4>
											{selectedTopics.size > 0 && (
												<Button
													size='sm'
													variant='outline'
													onClick={onAssignTopics}
													className='h-7 bg-transparent text-xs'
												>
													<Plus className='mr-1 h-3 w-3' />
													Add {selectedTopics.size}
												</Button>
											)}
										</div>

										{(milestone.topicSnaps?.length ?? 0) === 0 && selectedTopics.size === 0 ? (
											<p className='text-xs italic text-muted-foreground'>
												No topics assigned yet
											</p>
										) : (
											<div className='max-h-40 space-y-2 overflow-y-auto'>
												{milestone.topicSnaps?.map((topic) => (
													<div
														key={topic._id}
														className='flex items-start justify-between gap-2 rounded bg-secondary/50 p-2'
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
															onClick={() => onRemoveTopic(milestone._id, topic._id)}
															className='flex-shrink-0 text-muted-foreground transition-colors hover:text-destructive'
														>
															<X className='h-3 w-3' />
														</button>
													</div>
												))}
											</div>
										)}
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			</ScrollArea>
		</div>
	)
}
