import { Search, ChevronDown, Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

// Định nghĩa kiểu dữ liệu cho Filter/Chip
type Chip = {
	id: string
	label: string
}

// Component Chip có thể xóa
const RemovableChip = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
	<Badge className='mb-2 mr-2 cursor-pointer bg-blue-500 hover:bg-blue-600'>
		{label}
		<X className='ml-1 h-3 w-3' onClick={onRemove} />
	</Badge>
)

const TopicSearchFilter = () => {
	// State mẫu cho các chips
	const [skills, setSkills] = useState<Chip[]>([
		{ id: 'p', label: 'Python' },
		{ id: 'tf', label: 'TensorFlow' }
	])
	const [interests, setInterests] = useState<Chip[]>([{ id: 'sc', label: 'Smart City' }])
	const [preferredLecturers, setPreferredLecturers] = useState<Chip[]>([{ id: 'nvn', label: 'PGS.TS. Nguyễn Văn A' }])

	// Hàm xóa chip (cho ví dụ đơn giản)
	const removeChip = (setChips: React.Dispatch<React.SetStateAction<Chip[]>>, id: string) => {
		setChips((prev) => prev.filter((chip) => chip.id !== id))
	}

	// Hàm giả lập thêm chip (trong thực tế sẽ có Modal/Dialog để chọn)
	const addSkill = (newLabel: string) => {
		const newId = Date.now().toString()
		setSkills((prev) => [...prev, { id: newId, label: newLabel }])
	}

	return (
		<div className='rounded-xl border bg-white p-6 shadow-sm'>
			<h2 className='mb-4 text-xl font-semibold'>🔍 Tìm kiếm và Lọc Đề tài</h2>

			{/* 1. Thanh Tìm Kiếm và Lọc Cơ bản */}
			<div className='mb-6 flex space-x-4'>
				{/* Input Tìm kiếm chính */}
				<div className='relative flex-grow'>
					<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Input placeholder='Tìm kiếm theo tên đề tài, giảng viên...' className='pl-9' />
				</div>

				{/* Dropdown Lĩnh vực */}
				<Select defaultValue='all'>
					<SelectTrigger className='w-[180px]'>
						<SelectValue placeholder='Tất cả lĩnh vực' />
						<ChevronDown className='ml-2 h-4 w-4 opacity-50' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>Tất cả lĩnh vực</SelectItem>
						<SelectItem value='ai'>AI & Machine Learning</SelectItem>
						<SelectItem value='blockchain'>Blockchain</SelectItem>
					</SelectContent>
				</Select>

				{/* Dropdown Sắp xếp */}
				<Select defaultValue='newest'>
					<SelectTrigger className='w-[120px]'>
						<SelectValue placeholder='Mới nhất' />
						<ChevronDown className='ml-2 h-4 w-4 opacity-50' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='newest'>Mới nhất</SelectItem>
						<SelectItem value='popular'>Phổ biến nhất</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* --- Divider --- */}
			<hr className='my-4' />

			{/* 2. Khu vực Lựa chọn Nâng cao (Chip Input) */}
			<div className='space-y-4'>
				{/* Kỹ Năng Hiện Có */}
				<div>
					<h3 className='mb-2 flex items-center text-sm font-medium text-gray-700'>
						⚙️ Kỹ Năng Hiện Có <span className='ml-1 text-red-500'>*</span>
					</h3>
					<div className='flex flex-wrap items-center'>
						{skills.map((chip) => (
							<RemovableChip
								key={chip.id}
								label={chip.label}
								onRemove={() => removeChip(setSkills, chip.id)}
							/>
						))}
						<Button
							variant='outline'
							size='sm'
							onClick={() => addSkill('Java')}
							className='text-blue-500 hover:text-blue-600'
						>
							<Plus className='mr-1 h-4 w-4' /> Thêm Kỹ Năng
						</Button>
					</div>
				</div>

				{/* Lĩnh Vực Muốn Tìm Hiểu */}
				<div>
					<h3 className='mb-2 flex items-center text-sm font-medium text-gray-700'>
						💡 Lĩnh Vực Muốn Tìm Hiểu
					</h3>
					<div className='flex flex-wrap items-center'>
						{interests.map((chip) => (
							<RemovableChip
								key={chip.id}
								label={chip.label}
								onRemove={() => removeChip(setInterests, chip.id)}
							/>
						))}
						<Button
							variant='outline'
							size='sm'
							onClick={() => addSkill('Blockchain')}
							className='text-blue-500 hover:text-blue-600'
						>
							<Plus className='mr-1 h-4 w-4' /> Thêm Lĩnh Vực
						</Button>
					</div>
				</div>

				{/* Giảng Viên Ưu Tiên */}
				<div>
					<h3 className='mb-2 flex items-center text-sm font-medium text-gray-700'>👨‍🏫 Giảng Viên Ưu Tiên</h3>
					<div className='flex flex-wrap items-center'>
						{preferredLecturers.map((chip) => (
							<RemovableChip
								key={chip.id}
								label={chip.label}
								onRemove={() => removeChip(setPreferredLecturers, chip.id)}
							/>
						))}
						<Button
							variant='outline'
							size='sm'
							onClick={() => addSkill('TS. Trần Thị B')}
							className='text-blue-500 hover:text-blue-600'
						>
							<Plus className='mr-1 h-4 w-4' /> Thêm Giảng Viên
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default TopicSearchFilter
