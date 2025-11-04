import { cn } from '@/lib/utils'
import { ProgressBar } from './ProgressBar'

interface TaskCardProps {
	title: string
	category: string
	date: string
	progress: number
	maxProgress: number
	className: string
}

export const TaskCard: React.FC<TaskCardProps> = ({
	title,
	category,
	date,
	progress,
	maxProgress,
	className
}) => {
	return (
		<div className={cn('mb-4 rounded-lg bg-white p-4 shadow-md', className)}>
			<h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
			<div className='mb-2 flex items-center'>
				<span className='mr-2 rounded-full bg-red-100 px-2 py-1 text-xs text-red-800'>{category}</span>
			</div>
			<p className='mb-2 text-xs text-gray-500'>⏳ {date}</p>
			<ProgressBar label='' value={progress} maxValue={maxProgress} color='bg-blue-600' />
			<div className='mt-2 flex justify-between'>
				<button className='rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300'>Chi tiết</button>
				<button className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'>Đăng ký</button>
			</div>
		</div>
	)
}
