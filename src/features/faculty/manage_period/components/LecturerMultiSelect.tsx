import { useState } from 'react'
import { X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandGroup, CommandItem, CommandList, CommandInput, CommandEmpty } from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import type { MiniActorInforDto, ResponseMiniLecturerDto } from '@/models'

interface LecturerMultiSelectProps {
	allLecturers: ResponseMiniLecturerDto[] | undefined
	selected: ResponseMiniLecturerDto[]
	onChange: (value: ResponseMiniLecturerDto[]) => void
}

export function LecturerMultiSelect({ allLecturers = [], selected, onChange }: LecturerMultiSelectProps) {
	const [open, setOpen] = useState(false)
	const [localSelected, setLocalSelected] = useState<ResponseMiniLecturerDto[]>(selected)

	// Khi mở popup → đồng bộ local để người dùng chọn lại từ đầu
	const openPopover = () => {
		setLocalSelected(selected)
		setOpen(true)
	}

	const toggle = (id: string) => {
		setLocalSelected((prev) => {
			const exists = prev.some((item) => item._id === id)
			if (exists) {
				return prev.filter((item) => item._id !== id)
			}
			const lecturer = allLecturers.find((l) => l._id === id)
			return lecturer ? [...prev, lecturer] : prev
		})
	}

	const selectAll = () => {
		setLocalSelected(allLecturers)
	}

	const clearAll = () => {
		setLocalSelected([])
	}

	const confirmSelect = () => {
		onChange(localSelected)
		setOpen(false)
	}
console.log("kkkk",selected)
	return (
		<div className='w-full'>
			<label className='text-sm font-medium'>Giảng viên yêu cầu nộp</label>

			{/* Selected badges */}
			<div className='mt-2 flex flex-wrap gap-2'>
				{selected.map((item) => (
					<Badge key={item._id} variant='secondary' className='flex items-center gap-1'>
						{item.title + ' '}
						{item.fullName}
						<X
							size={14}
							className='cursor-pointer'
							onClick={() => onChange(selected.filter((x) => x._id !== item._id))}
						/>
					</Badge>
				))}
			</div>

			<Popover open={open} onOpenChange={setOpen} modal={true}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						className='mt-3 w-full justify-start text-left font-normal'
						onClick={openPopover}
					>
						Chọn giảng viên…
					</Button>
				</PopoverTrigger>

				<PopoverContent className='w-[330px] p-0'>
					<Command>
						<CommandInput placeholder='Tìm kiếm giảng viên...' />

						{/* Scrollable list */}
						<div className='h-64'>
							<CommandList>
								<CommandEmpty>Không tìm thấy giảng viên.</CommandEmpty>

								{/* Actions */}
								<div className='sticky top-0 z-10 flex justify-between border-b bg-white px-3 py-2 text-xs text-blue-600'>
									<button onClick={selectAll}>Chọn tất cả</button>
									<button onClick={clearAll}>Xóa tất cả</button>
								</div>

								{/* Lecturers */}
								<CommandGroup>
									{allLecturers.map((lec) => (
										<CommandItem
											key={lec._id}
											onSelect={() => toggle(lec._id)}
											className='flex cursor-pointer items-center gap-2 py-2'
										>
											<Checkbox checked={localSelected.some((item) => item._id === lec._id)} />
											{lec.title + ' '}{lec.fullName}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</div>
					</Command>

					{/* Confirm button */}
					<div className='flex justify-end gap-2 border-t p-2'>
						<Button variant='outline' size='sm' onClick={() => setOpen(false)}>
							Hủy
						</Button>
						<Button size='sm' onClick={confirmSelect}>
							Xác nhận
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
