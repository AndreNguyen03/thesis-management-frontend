import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import type { MilestoneEvent } from '@/models/milestone.model'

interface SchedulePanelProps {
	milestones: MilestoneEvent[]
}

const getDaysInMonth = (year: number, month: number) => {
	return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
	const day = new Date(year, month, 1).getDay()
	return day === 0 ? 6 : day - 1 // Monday-first
}

// Format dùng local date parts (không dùng toISOString để tránh UTC lệch)
const formatDateKey = (date: Date): string => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

const getEventDotColor = (type: string) => {
	switch (type) {
		case 'deadline': // submission
			return 'bg-warning'
		case 'defense':
			return 'bg-info'
		default:
			return 'bg-muted-foreground'
	}
}

// Helper để lấy label từ type
const getEventLabel = (type: string) => {
	switch (type) {
		case 'deadline':
			return 'Nộp bài (Submission)'
		case 'defense':
			return 'Bảo vệ (Defense)'
		default:
			return ''
	}
}

export function SchedulePanel({  milestones }: SchedulePanelProps) {
	const [currentDate, setCurrentDate] = useState(new Date()) // Local time
	const [hoveredDate, setHoveredDate] = useState<string | null>(null)

	// Events từ milestones (như cũ)
	const events = useMemo(() => {
		return milestones.reduce(
			(acc, milestone) => {
				const dueDateObj = new Date(milestone.dueDate) // Parse ISO -> local time
				const dateKey = formatDateKey(dueDateObj) // Local YYYY-MM-DD
                console.log(milestone.type)
				const eventType = milestone.type === 'submission' ? 'deadline' : 'defense'

				if (!acc[dateKey]) acc[dateKey] = []
				acc[dateKey].push({ title: milestone.title, type: eventType })
				return acc
			},
			{} as Record<string, { title: string; type: 'deadline' | 'defense' }[]>
		)
	}, [milestones])

	// Dynamic legend: Chỉ show loại có trong events
	const usedTypes = useMemo(() => {
		const types = new Set<string>()
		Object.values(events).forEach((dayEvents) => {
			dayEvents.forEach((event) => types.add(event.type))
		})
		return Array.from(types)
	}, [events])

	const year = currentDate.getFullYear()
	const month = currentDate.getMonth()
	const daysInMonth = getDaysInMonth(year, month)
	const firstDay = getFirstDayOfMonth(year, month)

	const monthNames = [
		'Tháng 1',
		'Tháng 2',
		'Tháng 3',
		'Tháng 4',
		'Tháng 5',
		'Tháng 6',
		'Tháng 7',
		'Tháng 8',
		'Tháng 9',
		'Tháng 10',
		'Tháng 11',
		'Tháng 12'
	]

	const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

	// Today key từ local date
	const today = new Date() // Local time
	const todayKey = formatDateKey(today)

	const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
	const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

	const renderCalendarDays = () => {
		const days = []

		// Empty cells
		for (let i = 0; i < firstDay; i++) {
			days.push(<div key={`empty-${i}`} className='h-8 w-8' />)
		}

		// Days of month
		for (let day = 1; day <= daysInMonth; day++) {
			// Tạo date obj local
			const dateObj = new Date(year, month, day)
			const dateKey = formatDateKey(dateObj)
			const dayEvents = events[dateKey] || []
			const hasEvents = dayEvents.length > 0
			const isToday = dateKey === todayKey

			// Sửa: Lấy unique types cho dots (1 dot per type, max 2)
			const uniqueTypes = [...new Set(dayEvents.map((e) => e.type))]
			const typeCounts = dayEvents.reduce(
				(acc, e) => {
					acc[e.type] = (acc[e.type] || 0) + 1
					return acc
				},
				{} as Record<string, number>
			)

			days.push(
				<div
					key={day}
					className='relative flex h-8 w-8 items-center justify-center'
					onMouseEnter={() => hasEvents && setHoveredDate(dateKey)}
					onMouseLeave={() => setHoveredDate(null)}
				>
					<span
						className={`flex h-7 w-7 cursor-default items-center justify-center rounded-full text-xs transition-colors ${
							isToday ? 'bg-primary font-semibold text-primary-foreground' : ''
						} ${
							hasEvents && !isToday ? 'font-medium text-foreground' : 'text-muted-foreground'
						} ${hasEvents ? 'hover:bg-accent' : ''}`}
					>
						{day}
					</span>

					{/* Sửa dots: 1 per unique type, với count nếu >1 */}
					{hasEvents && (
						<div className='absolute -bottom-0.5 left-1/2 flex -translate-x-1/2 gap-0.5'>
							{uniqueTypes.map((type) => {
								const count = typeCounts[type]
								return (
									<div key={type} className='flex items-center gap-0.5'>
										<div className={`h-1.5 w-1.5 rounded-full ${getEventDotColor(type)}`} />
										{count > 1 && <span className='text-[8px] text-foreground'>{count}</span>}
									</div>
								)
							})}
						</div>
					)}

					{/* Sửa tooltip: Group by type + count */}
					{hoveredDate === dateKey && dayEvents.length > 0 && (
						<div className='absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-lg border border-border bg-popover p-2 shadow-lg'>
							<div className='space-y-2'>
								{uniqueTypes.map((type) => {
									const typeEvents = dayEvents.filter((e) => e.type === type)
									const count = typeEvents.length
									return (
										<div key={type}>
											<div className='mb-1 flex items-center gap-2 text-xs font-medium text-popover-foreground'>
												<div className={`h-2 w-2 rounded-full ${getEventDotColor(type)}`} />
												<span>{getEventLabel(type)}</span>
												{count > 1 && <span>({count})</span>}
											</div>
											<div className='ml-4 space-y-0.5'>
												{typeEvents.map((event, idx) => (
													<span
														key={idx}
														className='block text-xs text-popover-foreground/80'
													>
														• {event.title}
													</span>
												))}
											</div>
										</div>
									)
								})}
							</div>
							<div className='absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-border bg-popover' />
						</div>
					)}
				</div>
			)
		}

		return days
	}

	return (
		<Card className='rounded-xl border-border p-0'>
			<CardHeader className='pb-2'>
				<CardTitle className='flex items-center gap-2 text-base font-semibold text-foreground'>
					<Calendar className='h-5 w-5 text-primary' />
					Lịch & Mốc thời gian
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-3'>
				<div className='flex items-center justify-between'>
					<button
						onClick={prevMonth}
						className='flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
					>
						<ChevronLeft className='h-4 w-4' />
					</button>
					<span className='text-sm font-medium text-foreground'>
						{monthNames[month]} {year}
					</span>
					<button
						onClick={nextMonth}
						className='flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
					>
						<ChevronRight className='h-4 w-4' />
					</button>
				</div>

				<div className='grid grid-cols-7 gap-1'>
					{dayNames.map((day) => (
						<div
							key={day}
							className='flex h-8 w-8 items-center justify-center text-xs font-medium text-muted-foreground'
						>
							{day}
						</div>
					))}
				</div>

				<div className='grid grid-cols-7 gap-1'>{renderCalendarDays()}</div>

				{/* Dynamic Legend */}
				{usedTypes.length > 0 && (
					<div className='flex flex-wrap items-center gap-3 border-t border-border pt-2'>
						{usedTypes.map((type) => (
							<div key={type} className='flex items-center gap-1.5'>
								<div className={`h-2 w-2 rounded-full ${getEventDotColor(type)}`} />
								<span className='text-xs text-muted-foreground'>{getEventLabel(type)}</span>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}
