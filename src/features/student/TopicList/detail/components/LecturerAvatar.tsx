import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Component hiển thị Avatar nhỏ gọn
const LecturerAvatar = ({ lecturer, className = '' }: { lecturer: any; className?: string }) => {
	const initials = lecturer.fullName
		.split(' ')
		.map((n: string) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Avatar className={`h-8 w-8 border-2 border-white ring-1 ring-slate-100 ${className}`}>
						<AvatarImage src={lecturer.avatarUrl} alt={lecturer.fullName} className='object-cover' />
						<AvatarFallback className='bg-blue-100 text-[10px] font-bold text-blue-700'>
							{initials}
						</AvatarFallback>
					</Avatar>
				</TooltipTrigger>
				<TooltipContent>
					<p>
						{lecturer.title} {lecturer.fullName}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}

// Main Component
export const LecturerList = ({ lecturers }: { lecturers: any[] }) => {
	if (!lecturers || lecturers.length === 0) return null

	const mainLecturer = lecturers[0]
	const otherLecturers = lecturers.slice(1)
	const maxVisibleOthers = 3 // Số lượng giảng viên phụ tối đa hiển thị avatar
	const hiddenCount = otherLecturers.length - maxVisibleOthers

	return (
		<div className='flex flex-col gap-1.5'>
			<h1 className='font-medium'>GVHD</h1>

			<div className='flex items-center gap-3'>
				{/* 1. Giảng viên chính (Hiển thị to rõ kèm tên) */}
				<div className='flex items-center gap-2 border-r border-slate-200 pr-4'>
					<LecturerAvatar lecturer={mainLecturer} className='h-9 w-9' />
					<div className='flex flex-col'>
						<span className='text-sm font-semibold leading-tight text-slate-900'>
							{mainLecturer.title} {mainLecturer.fullName}
						</span>
						{/* Có thể thêm role nếu cần, ví dụ: 'GVHD Chính' */}
					</div>
				</div>

				{/* 2. Các giảng viên phụ (Dạng Avatar Stack) */}
				{otherLecturers.length > 0 && (
					<div className='flex items-center -space-x-2 transition-all duration-300 hover:space-x-1'>
						{otherLecturers.slice(0, maxVisibleOthers).map((lec) => (
							<LecturerAvatar key={lec._id} lecturer={lec} />
						))}

						{/* Số lượng giảng viên bị ẩn (+2, +3...) */}
						{hiddenCount > 0 && (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger asChild>
										<div className='z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-medium text-slate-600 ring-1 ring-slate-100 hover:bg-slate-200'>
											+{hiddenCount}
										</div>
									</TooltipTrigger>
									<TooltipContent>
										{/* Liệt kê tên những người bị ẩn */}
										<ul className='list-disc pl-4 text-xs'>
											{otherLecturers.slice(maxVisibleOthers).map((l) => (
												<li key={l._id}>
													{l.title} {l.fullName}
												</li>
											))}
										</ul>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</div>
				)}
			</div>

			{/* Dòng text phụ (Optional - nếu muốn hiển thị rõ ràng hơn bằng chữ) */}
			{otherLecturers.length > 0 && (
				<p className='mt-1 text-xs text-slate-500'>và {otherLecturers.length} giảng viên đồng hướng dẫn</p>
			)}
		</div>
	)
}
