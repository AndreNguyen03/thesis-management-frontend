'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lock, Search } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import type { MiniPeriodInfo } from '@/models/period.model'

interface Props {
	periodId: string | null
	searchTerm: string
	onPeriodChange: (v: string) => void
	onSearchChange: (v: string) => void

	isReadOnly: boolean


	// New props for tab switching
	currentTab: 'thesis' | 'scientific_research'
	onTabChange: (tab: 'thesis' | 'scientific_research') => void
	periodInfo: MiniPeriodInfo[]
}

function getPeriodName(periodInfo: MiniPeriodInfo) {
	return `${periodInfo.year} - Kì ${periodInfo.semester}`
}

export function FilterBar({
	isReadOnly,
	periodId,
	searchTerm,
	onPeriodChange,
	onSearchChange,
	currentTab = 'thesis',
	onTabChange,
	periodInfo
}: Props) {
	return (
		<Card className='p-0'>
			{isReadOnly && (
				<Alert className='border-amber-200 bg-amber-50 text-amber-800'>
					<Lock className='h-4 w-4 text-amber-600' />
					<AlertDescription className='flex w-full items-center justify-between'>
						<span>
							Đây là dữ liệu lịch sử của kỳ học đã kết thúc. Giao diện đang ở chế độ{' '}
							<strong>chỉ xem</strong>.
						</span>
						<Badge
							variant='outline'
							className='border-amber-300 bg-amber-100 text-[10px] font-bold uppercase text-amber-800'
						>
							Read Only
						</Badge>
					</AlertDescription>
				</Alert>
			)}
			<CardContent className='p-6'>
				{/* Tab Switcher */}
				<Tabs
					value={currentTab}
					onValueChange={(v) => onTabChange(v as 'thesis' | 'scientific_research')}
					className='mb-6'
				>
					<TabsList className='grid w-full grid-cols-2 rounded-lg border border-gray-200 bg-gray-50'>
						<TabsTrigger
							value='thesis'
							className='rounded-md transition-all duration-200 hover:bg-gray-100 data-[state=active]:border-b-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:hover:bg-primary/90'
						>
							Khóa luận
						</TabsTrigger>
						<TabsTrigger
							value='scientific_research'
							className='rounded-md transition-all duration-200 hover:bg-gray-100 data-[state=active]:border-b-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:hover:bg-primary/90'
						>
							Nghiên cứu khoa học
						</TabsTrigger>
					</TabsList>
				</Tabs>

				<div className='flex flex-wrap items-center justify-center gap-4'>
					<div className='min-w-[300px] flex-1'>
						<Label className='text-xs'>Tìm kiếm đề tài</Label>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
							<Input
								className='pl-9'
								value={searchTerm}
								onChange={(e) => onSearchChange(e.target.value)}
								placeholder='Nhập tên đề tài để tìm kiếm...'
							/>
						</div>
					</div>

					<div>
						<Label className='text-xs'>Học kỳ</Label>
						<Select value={periodId || ''} onValueChange={(v) => onPeriodChange(v)}>
							<SelectTrigger className='w-[200px]'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{periodInfo.map((period) => {
									return <SelectItem value={period._id}>{getPeriodName(period)}</SelectItem>
								})}
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
