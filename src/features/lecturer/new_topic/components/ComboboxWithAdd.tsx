import { useState } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface ComboboxOption {
	value: string
	label: string
}

interface ComboboxWithAddProps {
	options: ComboboxOption[]
	placeholder?: string
	emptyText?: string
	onSelect: (value: string) => void
	onAdd: (value: string) => void
	disabled?: boolean
}

export function ComboboxWithAdd({
	options,
	placeholder = 'Chọn...',
	emptyText = 'Không tìm thấy.',
	onSelect,
	onAdd,
	disabled = false
}: ComboboxWithAddProps) {
	const [open, setOpen] = useState(false)
	const [searchValue, setSearchValue] = useState('')

	const handleSelect = (currentValue: string) => {
		onSelect(currentValue)
		setOpen(false)
		setSearchValue('')
	}

	const handleAdd = () => {
		if (searchValue.trim()) {
			onAdd(searchValue.trim())
			setSearchValue('')
			setOpen(false)
		}
	}

	const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchValue.toLowerCase()))

	const showAddButton = searchValue.trim() && filteredOptions.length === 0

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					role='combobox'
					aria-expanded={open}
					disabled={disabled}
					className='w-full justify-between bg-card transition-colors hover:bg-muted/50'
				>
					<span className='text-muted-foreground'>{placeholder}</span>
					<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-full bg-popover p-0 shadow-lg'>
				<Command>
					<CommandInput placeholder='Tìm kiếm...' value={searchValue} onValueChange={setSearchValue} />
					<CommandEmpty>
						{showAddButton ? (
							<Button
								variant='ghost'
								className='w-full justify-start text-primary hover:bg-secondary'
								onClick={handleAdd}
							>
								<Plus className='mr-2 h-4 w-4' />
								Thêm "{searchValue}"
							</Button>
						) : (
							<div className='py-6 text-center text-sm text-muted-foreground'>{emptyText}</div>
						)}
					</CommandEmpty>
					{filteredOptions.length > 0 && (
						<CommandGroup>
							{filteredOptions.map((option) => (
								<CommandItem
									key={option.value}
									value={option.value}
									onSelect={handleSelect}
									className='cursor-pointer transition-colors hover:bg-secondary'
								>
									<Check className={cn('mr-2 h-4 w-4', 'opacity-0')} />
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>
					)}
				</Command>
			</PopoverContent>
		</Popover>
	)
}
