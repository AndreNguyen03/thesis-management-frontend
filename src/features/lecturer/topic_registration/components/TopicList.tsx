import type { StudentRegistration, TopicApproval } from '@/models'
import { TopicCard } from './TopicCard'
import { Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
	topics: TopicApproval[]
	expandedTopicId: string | null
	onToggleExpand: (id: string | null) => void
	isReadOnly: boolean
	onReject: (student: StudentRegistration) => void
	isLoading: boolean
    onApprove: (v: string) => void
}

export function TopicList(props: Props) {
	// Sort topics: pending first (topics with pendingStudents > 0)
	// Topics with pending students come first, regardless of approved count
	// Then, topics with some approved but not full, then full ones
	const sortedTopics = [...props.topics].sort((a, b) => {
		const hasPendingA = a.pendingStudents?.length > 0 || false // Fallback if no pendingStudents field
		const hasPendingB = b.pendingStudents?.length > 0 || false

		if (hasPendingA && !hasPendingB) return -1
		if (!hasPendingA && hasPendingB) return 1

		// If both have pending or both don't, sort by approved count asc (less approved first, i.e., not full)
		const approvedCountA = a.approvedStudents.length
		const approvedCountB = b.approvedStudents.length
		const maxStudentsA = a.maxStudents || 0
		const maxStudentsB = b.maxStudents || 0

		// Prioritize not full (room for more)
		const isFullA = approvedCountA >= maxStudentsA
		const isFullB = approvedCountB >= maxStudentsB

		if (!isFullA && isFullB) return -1
		if (isFullA && !isFullB) return 1

		// Finally, by approved count asc within similar groups
		return approvedCountA - approvedCountB
	})
	return (
		<div className='grid gap-4'>
			{props.isLoading ? (
				<div className='space-y-4'>
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className='space-y-3 rounded-lg border p-4'>
							{/* Topic title */}
							<Skeleton className='h-6 w-3/4' />

							{/* Lecturer / info row */}
							<div className='flex gap-4'>
								<Skeleton className='h-4 w-32' />
								<Skeleton className='h-4 w-24' />
								<Skeleton className='h-4 w-24' />
							</div>

							{/* Student list */}
							<div className='space-y-2 pt-2'>
								{Array.from({ length: 2 }).map((_, j) => (
									<div key={j} className='flex items-center justify-between rounded-md border p-3'>
										<div className='space-y-2'>
											<Skeleton className='h-4 w-40' />
											<Skeleton className='h-3 w-28' />
										</div>

										<div className='flex gap-2'>
											<Skeleton className='h-8 w-20' />
											<Skeleton className='h-8 w-20' />
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			) : sortedTopics.length === 0 ? (
				<div className='flex flex-col items-center justify-center p-8 text-center text-gray-500'>
					<Search className='mx-auto mb-4 h-12 w-12 text-gray-400' />
					<h3 className='mb-2 text-lg font-semibold text-gray-900'>Bạn không có đề tài nào</h3>
					<p className='text-sm'>Hãy thử điều chỉnh bộ lọc để tìm kiếm đề tài phù hợp.</p>
				</div>
			) : (
				sortedTopics.map((topic) => <TopicCard key={topic._id} topic={topic} {...props} />)
			)}
		</div>
	)
}
