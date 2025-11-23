import { useState } from 'react'
import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { ComboboxOption } from './interface/combo-option.interface'
import type { MetaDto } from '@/models/paginated-object.model'
export interface ComboboxWithAddProps {
	options: ComboboxOption[] | undefined
	placeholder?: string
	emptyText?: string
	onSelect: (value: string) => void
	onAdd?: (value: string) => void
	disabled?: boolean
	searchTerm: string
	onSearch: (value: string) => void
	onNextPage?: () => void
	meta: MetaDto
	isLoading?: boolean
}

export function ComboboxWithAdd({
	options,
	placeholder = 'Chọn...',
	emptyText = 'Không tìm thấy.',
	onSelect,
	onAdd,
	disabled = false,
	onSearch,
	onNextPage,
	meta,
	searchTerm,
	isLoading
}: ComboboxWithAddProps) {
	const [open, setOpen] = useState(false)

	const handleSelect = (currentValue: string) => {
		onSelect(currentValue)
		setOpen(false)
		onSearch('')
	}

	const handleAdd = () => {
		if (searchTerm.trim()) {
			onAdd?.(searchTerm.trim())
			onSearch('')
			setOpen(false)
		}
	}
	const buttonSeeMore = onNextPage && (meta?.currentPage ?? 0) < (meta?.totalPages ?? 0)
	const showAddButton = searchTerm.trim() && options?.length === 0

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
					<CommandInput placeholder='Tìm kiếm...' value={searchTerm} onValueChange={onSearch} />
					<CommandEmpty>
						{showAddButton ? (
							<Button
								variant='ghost'
								className='w-full justify-start text-primary hover:bg-secondary'
								onClick={handleAdd}
							>
								<Plus className='mr-2 h-4 w-4' />
								Thêm "{searchTerm}"
							</Button>
						) : (
							<div className='py-6 text-center text-sm text-muted-foreground'>{emptyText}</div>
						)}
					</CommandEmpty>
					{options && options.length > 0 && (
						<CommandGroup className='max-h-60 overflow-y-auto'>
							{options.map((option) => (
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
							{buttonSeeMore && (
								<CommandItem
									onSelect={() => onNextPage?.()}
									className='cursor-pointer transition-colors hover:bg-secondary'
								>
									{isLoading ? <Loader2 /> : <Check className={cn('mr-2 h-4 w-4', 'opacity-0')} />}
									{`Xem thêm...`}
								</CommandItem>
							)}
						</CommandGroup>
					)}
				</Command>
			</PopoverContent>
		</Popover>
	)
}
