'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import type { DefenseCouncilMember, GetTopicsInBatchMilestoneDto } from '@/models/milestone.model'
import { useDebounce } from '@/hooks/useDebounce'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { Button } from '@/components/ui'

interface TopicsPanelProps {
	topics: GetTopicsInBatchMilestoneDto[]
	selectedTopics: Set<string>
	onSelectTopic: (topicId: string) => void
	selectedMilestone: string | null
	isSelectedLecturers: boolean
	searchQueryParams: React.Dispatch<React.SetStateAction<PaginationQueryParamsDto>>
	onClearSelection: () => void
	isLoadingTopics?: boolean
}

export function TopicsPanel({
	topics,
	selectedTopics,
	onSelectTopic,
	selectedMilestone,
	isSelectedLecturers,
	searchQueryParams,
	onClearSelection,
	isLoadingTopics
}: TopicsPanelProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const setQuery = (query: string) => {
		searchQueryParams((prev) => ({ ...prev, query }))
	}
	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })
	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}
	return (
		<div className='flex w-1/2 flex-col gap-4'>
			<div className='flex flex-col gap-2'>
				<h2 className='text-2xl font-bold text-foreground'>Danh sách đề tài đang chờ </h2>
				<p className='text-sm text-muted-foreground'>Chọn đề tài để phân công vào đợt bảo vệ</p>
			</div>

			<div className='relative'>
				<Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
				<Input
					placeholder='Tìm kiếm theo tiêu đề và GV hướng dẫn...'
					value={searchTerm}
					onChange={(e) => onEdit(e.target.value)}
					className='bg-white pl-10'
				/>
			</div>
			{!selectedMilestone && (
				<div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
					<p className='text-sm text-amber-800'>Chọn một đợt bảo vệ</p>
				</div>
			)}
			<div className='flex flex-1 flex-col gap-2'>
				{selectedTopics.size > 0 && (
					<Button className='w-fit' onClick={onClearSelection}>
						Bỏ chọn ({selectedTopics.size})
					</Button>
				)}
				{isLoadingTopics ? (
					<Card className='border-dashed'>
						<CardContent className='pt-6 text-center text-muted-foreground'>
							<Loader2 className='mx-auto h-6 w-6 animate-spin' />
						</CardContent>
					</Card>
				) : topics.length === 0 ? (
					<Card className='border-dashed'>
						<CardContent className='pt-6 text-center text-muted-foreground'>
							Không có đề tài nào được tìm thấy
						</CardContent>
					</Card>
				) : (
					<div className='max-h-[calc(100vh-300px)] flex-1 space-y-3 overflow-y-auto'>
						{topics.map((topic) => (
							<Card
								key={topic._id}
								className={`cursor-pointer p-2 transition-all ${
									selectedTopics.has(topic._id)
										? 'border-primary bg-primary/10'
										: 'hover:border-primary/50'
								} ${!selectedMilestone || isSelectedLecturers ? 'cursor-not-allowed opacity-50' : ''}`}
								onClick={() => selectedMilestone && !isSelectedLecturers && onSelectTopic(topic._id)}
							>
								<CardContent className='pt-4'>
									<div className='flex gap-3'>
										<Checkbox
											checked={selectedTopics.has(topic._id)}
											disabled={!selectedMilestone || isSelectedLecturers}
											className='mt-1'
										/>
										<div className='min-w-0 flex-1'>
											<h3 className='text-sm font-semibold leading-tight text-foreground'>
												{topic.titleVN}
											</h3>
											<p className='mt-1 text-xs text-muted-foreground'>({topic.titleEng})</p>
											<p className='mt-1 text-xs text-muted-foreground'>
												<span className='font-semibold'>GVHD: </span>
												{topic.lecturers
													.map((lecturer) => `${lecturer.title} ${lecturer.fullName}`)
													.join(', ')}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
