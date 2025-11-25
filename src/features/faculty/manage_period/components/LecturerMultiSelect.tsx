import { useState } from 'react'
import { X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandGroup, CommandItem, CommandList, CommandInput, CommandEmpty } from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import type { LecturerMini } from '@/models'

interface LecturerMultiSelectProps {
	allLecturers: LecturerMini[] | undefined
	selected: string[]
	onChange: (value: string[]) => void
}

export function LecturerMultiSelect({ allLecturers = [], selected, onChange }: LecturerMultiSelectProps) {
	const [open, setOpen] = useState(false)
	const [localSelected, setLocalSelected] = useState<string[]>(selected)

	// Khi mở popup → đồng bộ local để người dùng chọn lại từ đầu
	const openPopover = () => {
		setLocalSelected(selected)
		setOpen(true)
	}

	const toggle = (id: string) => {
		setLocalSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
	}

	const selectAll = () => {
		setLocalSelected(allLecturers.map((l) => l.id))
	}

	const clearAll = () => {
		setLocalSelected([])
	}

	const confirmSelect = () => {
		onChange(localSelected)
		setOpen(false)
	}

	return (
		<div className='w-full'>
			<label className='text-sm font-medium'>Giảng viên yêu cầu nộp</label>

			{/* Selected badges */}
			<div className='mt-2 flex flex-wrap gap-2'>
				{selected.map((id) => {
					const lec = allLecturers.find((l) => l.id === id)
					return (
						<Badge key={id} variant='secondary' className='flex items-center gap-1'>
							{lec?.fullName}
							<X
								size={14}
								className='cursor-pointer'
								onClick={() => onChange(selected.filter((x) => x !== id))}
							/>
						</Badge>
					)
				})}
			</div>

			<Popover open={open} onOpenChange={setOpen}>
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
						<CommandList>
							<CommandEmpty>Không tìm thấy giảng viên.</CommandEmpty>

							{/* Actions */}
							<div className='flex justify-between px-3 py-2 text-xs text-blue-600'>
								<button onClick={selectAll}>Chọn tất cả</button>
								<button onClick={clearAll}>Xóa tất cả</button>
							</div>

							{/* Lecturers */}
							<CommandGroup>
								{allLecturers.map((lec) => (
									<CommandItem
										key={lec.id}
										onSelect={() => toggle(lec.id)}
										className='flex cursor-pointer items-center gap-2 py-2'
									>
										<Checkbox checked={localSelected.includes(lec.id)} />
										{lec.fullName}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
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
