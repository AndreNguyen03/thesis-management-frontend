import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SearchBarProps {
	searchQuery: string
	onSearch: (value: string) => void
	majorValue: string
	onMajorChange: (value: string) => void
	yearValue: string | number
	onYearChange: (value: string | number) => void
	majorOptions: { value: string; label: string }[]
	yearOptions: { value: string; label: string }[]
}

export const SearchBar: React.FC<SearchBarProps> = ({
	searchQuery,
	onSearch,
	majorValue,
	onMajorChange,
	yearValue,
	onYearChange,
	majorOptions,
	yearOptions
}) => {
	return (
		<div className='flex flex-col gap-3 rounded-xl bg-card p-4 shadow-card sm:flex-row sm:items-center'>
			<div className='relative flex-1'>
				<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
				<Input
					type='text'
					placeholder='Tìm kiếm đề tài, sinh viên, giảng viên...'
					value={searchQuery}
					onChange={(e) => onSearch(e.target.value)}
					className='border-0 bg-muted/50 pl-10 focus-visible:ring-primary'
				/>
			</div>
			<div className='flex items-center gap-2'>
				<Select value={majorValue} onValueChange={onMajorChange}>
					<SelectTrigger className='w-[140px] border-0 bg-muted/50'>
						<SelectValue placeholder='Ngành' />
					</SelectTrigger>
					<SelectContent>
						{majorOptions.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Select value={String(yearValue)} onValueChange={(v) => onYearChange(isNaN(Number(v)) ? v : Number(v))}>
					<SelectTrigger className='w-[120px] border-0 bg-muted/50'>
						<SelectValue placeholder='Năm' />
					</SelectTrigger>
					<SelectContent>
						{yearOptions.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	)
}
