import { useState, useMemo } from 'react'
import { Check, ChevronDown, Calendar, X } from 'lucide-react'
import type { ResponseMilestone } from '@/models/milestone.model'
import { formatDate } from '@/utils/utils'

interface MilestoneSelectorProps {
	milestones: ResponseMilestone[]
	selectedMilestoneId?: string
	onSelect: (milestoneId: string | undefined) => void
	placeholder?: string
	className?: string
	disabled?: boolean
}

export const MilestoneSelector = ({
	milestones,
	selectedMilestoneId,
	onSelect,
	placeholder = 'Chọn milestone...',
	className = '',
	disabled = false
}: MilestoneSelectorProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const selectedMilestone = useMemo(
		() => milestones.find((m) => m._id === selectedMilestoneId),
		[milestones, selectedMilestoneId]
	)

	const handleSelect = (milestoneId: string) => {
		onSelect(milestoneId)
		setIsOpen(false)
	}

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation()
		onSelect(undefined)
	}

	// Lọc milestone chưa quá hạn hoặc đã hoàn thành
	const availableMilestones = useMemo(
		() => milestones.filter((m) => m.status !== 'Overdue' && m.status !== 'Completed'),
		[milestones]
	)

	return (
		<div className={`relative ${className}`}>
			<button
				type='button'
				onClick={() => !disabled && setIsOpen(!isOpen)}
				disabled={disabled}
				className='flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50'
			>
				{selectedMilestone ? (
					<div className='flex flex-1 items-center gap-2'>
						<Calendar className='h-4 w-4 text-primary' />
						<div className='flex-1 truncate'>
							<span className='font-medium text-foreground'>{selectedMilestone.title}</span>
							<span className='ml-2 text-xs text-muted-foreground'>
								{formatDate(selectedMilestone.dueDate)}
							</span>
						</div>
						{!disabled && (
							<button
								onClick={handleClear}
								className='rounded-full p-1 hover:bg-destructive/10'
								title='Xóa milestone'
							>
								<X className='h-3 w-3 text-muted-foreground hover:text-destructive' />
							</button>
						)}
					</div>
				) : (
					<span className='text-muted-foreground'>{placeholder}</span>
				)}
				<ChevronDown
					className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
				/>
			</button>

			{isOpen && (
				<>
					{/* Overlay to close dropdown */}
					<div className='fixed inset-0 z-10' onClick={() => setIsOpen(false)} />

					{/* Dropdown menu */}
					<div className='absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg'>
						{availableMilestones.length === 0 ? (
							<div className='px-3 py-2 text-center text-sm text-muted-foreground'>
								Không có milestone khả dụng
							</div>
						) : (
							availableMilestones.map((milestone) => {
								const isSelected = milestone._id === selectedMilestoneId
								const daysLeft = Math.ceil(
									(new Date(milestone.dueDate).getTime() - new Date().getTime()) /
										(1000 * 60 * 60 * 24)
								)
								const isUrgent = daysLeft <= 7 && daysLeft >= 0

								return (
									<button
										key={milestone._id}
										onClick={() => handleSelect(milestone._id)}
										className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-secondary ${
											isSelected ? 'bg-primary/10' : ''
										}`}
									>
										<div className='flex-1'>
											<div className='flex items-center gap-2'>
												<span
													className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}
												>
													{milestone.title}
												</span>
												{isUrgent && (
													<span className='rounded-full bg-warning/10 px-2 py-0.5 text-xs text-warning'>
														Gần hạn
													</span>
												)}
											</div>
											<div className='mt-1 flex items-center gap-3 text-xs text-muted-foreground'>
												<span className='flex items-center gap-1'>
													<Calendar className='h-3 w-3' />
													{formatDate(milestone.dueDate)}
												</span>
												<span className='rounded bg-secondary px-2 py-0.5'>
													{milestone.progress}%
												</span>
											</div>
										</div>
										{isSelected && <Check className='h-4 w-4 text-primary' />}
									</button>
								)
							})
						)}
					</div>
				</>
			)}
		</div>
	)
}
