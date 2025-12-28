'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ThesisPhase } from './student-dashboard'

interface SchedulePanelProps {
	currentPhase: ThesisPhase
}

const events: Record<string, { title: string; type: 'meeting' | 'deadline' | 'defense' }[]> = {
	'2024-03-15': [{ title: 'Họp nhóm tuần 8', type: 'meeting' }],
	'2024-03-20': [{ title: 'Deadline nộp báo cáo tiến độ', type: 'deadline' }],
	'2024-03-22': [{ title: 'Họp với GVHD', type: 'meeting' }],
	'2024-04-01': [{ title: 'Bảo vệ giữa kỳ', type: 'defense' }],
	'2024-03-18': [{ title: 'Review code với team', type: 'meeting' }],
	'2024-03-25': [{ title: 'Nộp bản nháp chương 3', type: 'deadline' }]
}

const getDaysInMonth = (year: number, month: number) => {
	return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
	const day = new Date(year, month, 1).getDay()
	return day === 0 ? 6 : day - 1 // Convert to Monday-first week
}

const formatDateKey = (year: number, month: number, day: number) => {
	return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const getEventDotColor = (type: string) => {
	switch (type) {
		case 'meeting':
			return 'bg-primary'
		case 'deadline':
			return 'bg-warning'
		case 'defense':
			return 'bg-info'
		default:
			return 'bg-muted-foreground'
	}
}

export function SchedulePanel({ currentPhase }: SchedulePanelProps) {
	const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 1)) // March 2024
	const [hoveredDate, setHoveredDate] = useState<string | null>(null)

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

	const prevMonth = () => {
		setCurrentDate(new Date(year, month - 1, 1))
	}

	const nextMonth = () => {
		setCurrentDate(new Date(year, month + 1, 1))
	}

	const renderCalendarDays = () => {
		const days = []

		// Empty cells for days before the first day of month
		for (let i = 0; i < firstDay; i++) {
			days.push(<div key={`empty-${i}`} className='h-8 w-8' />)
		}

		// Days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			const dateKey = formatDateKey(year, month, day)
			const dayEvents = events[dateKey] || []
			const hasEvents = dayEvents.length > 0
			const isToday = day === 15 && month === 2 && year === 2024 // Demo: March 15 as "today"

			days.push(
				<div
					key={day}
					className='relative flex h-8 w-8 items-center justify-center'
					onMouseEnter={() => hasEvents && setHoveredDate(dateKey)}
					onMouseLeave={() => setHoveredDate(null)}
				>
					<span
						className={`flex h-7 w-7 cursor-default items-center justify-center rounded-full text-xs transition-colors ${isToday ? 'bg-primary font-semibold text-primary-foreground' : ''} ${hasEvents && !isToday ? 'font-medium text-foreground' : 'text-muted-foreground'} ${hasEvents ? 'hover:bg-accent' : ''} `}
					>
						{day}
					</span>

					{/* Event dots */}
					{hasEvents && (
						<div className='absolute -bottom-0.5 left-1/2 flex -translate-x-1/2 gap-0.5'>
							{dayEvents.slice(0, 3).map((event, idx) => (
								<div key={idx} className={`h-1 w-1 rounded-full ${getEventDotColor(event.type)}`} />
							))}
						</div>
					)}

					{/* Tooltip on hover */}
					{hoveredDate === dateKey && dayEvents.length > 0 && (
						<div className='absolute left-1/2 top-full z-50 mt-2 w-48 -translate-x-1/2 rounded-lg border border-border bg-popover p-2 shadow-lg'>
							<div className='space-y-1.5'>
								{dayEvents.map((event, idx) => (
									<div key={idx} className='flex items-center gap-2'>
										<div className={`h-2 w-2 rounded-full ${getEventDotColor(event.type)}`} />
										<span className='text-xs text-popover-foreground'>{event.title}</span>
									</div>
								))}
							</div>
							{/* Tooltip arrow */}
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
				{/* Month Navigation */}
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

				{/* Day Headers */}
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

				{/* Calendar Grid */}
				<div className='grid grid-cols-7 gap-1'>{renderCalendarDays()}</div>

				{/* Legend */}
				<div className='flex flex-wrap items-center gap-3 border-t border-border pt-2'>
					<div className='flex items-center gap-1.5'>
						<div className='h-2 w-2 rounded-full bg-primary' />
						<span className='text-xs text-muted-foreground'>Họp</span>
					</div>
					<div className='flex items-center gap-1.5'>
						<div className='h-2 w-2 rounded-full bg-warning' />
						<span className='text-xs text-muted-foreground'>Deadline</span>
					</div>
					<div className='flex items-center gap-1.5'>
						<div className='h-2 w-2 rounded-full bg-info' />
						<span className='text-xs text-muted-foreground'>Bảo vệ</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
