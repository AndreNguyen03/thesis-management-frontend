'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Search } from 'lucide-react'
import type { GetTopicsInBatchMilestoneDto, TopicSnaps } from '@/models/milestone.model'

interface TopicsPanelProps {
	topics: GetTopicsInBatchMilestoneDto[]
	selectedTopics: Set<string>
	onSelectTopic: (topicId: string) => void
	selectedMilestone: string | null
}

export function TopicsPanel({ topics, selectedTopics, onSelectTopic, selectedMilestone }: TopicsPanelProps) {
	const [searchTerm, setSearchTerm] = useState('')


	return (
		<div className='flex w-1/2 flex-col gap-4'>
			<div className='flex flex-col gap-2'>
				<h2 className='text-2xl font-bold text-foreground'>Available Topics</h2>
				<p className='text-sm text-muted-foreground'>Select topics to assign to milestones</p>
			</div>

			<div className='relative'>
				<Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
				<Input
					placeholder='Search by title or author...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='pl-10'
				/>
			</div>

			<div className='flex-1 space-y-3 overflow-y-auto pr-2'>
				{topics.length === 0 ? (
					<Card className='border-dashed'>
						<CardContent className='pt-6 text-center text-muted-foreground'>
							No topics found matching your search
						</CardContent>
					</Card>
				) : (
					topics.map((topic) => (
						<Card
							key={topic._id}
							className={`cursor-pointer transition-all p-2 ${
								selectedTopics.has(topic._id)
									? 'border-primary bg-primary/10'
									: 'hover:border-primary/50'
							} ${!selectedMilestone ? 'cursor-not-allowed opacity-50' : ''}`}
							onClick={() => selectedMilestone && onSelectTopic(topic._id)}
						>
							<CardContent className='pt-4'>
								<div className='flex gap-3'>
									<Checkbox
										checked={selectedTopics.has(topic._id)}
										disabled={!selectedMilestone}
										className='mt-1'
									/>
									<div className='min-w-0 flex-1'>
										<h3 className='text-sm font-semibold leading-tight text-foreground'>
											{topic.titleVN}
										</h3>
										<p className='mt-1 text-xs text-muted-foreground'>{topic.titleEng}</p>
										<p className='mt-1 text-xs text-muted-foreground'>
											Advisor:{' '}
											{topic.lecturers
												.map((lecturer) => `${lecturer.title} ${lecturer.fullName}`)
												.join(', ')}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>

			{!selectedMilestone && (
				<div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
					<p className='text-sm text-amber-800'>Select a milestone on the right to enable topic selection</p>
				</div>
			)}
		</div>
	)
}
