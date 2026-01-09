import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { useUpdateTaskDetailsMutation } from '@/services/todolistApi'
import { useToast } from '@/hooks/use-toast'
import { Plus, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface TaskLabelsProps {
	taskId: string
	labels: string[]
}

export const TaskLabels = ({ taskId, labels }: TaskLabelsProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [newLabel, setNewLabel] = useState('')
	const [updateTask, { isLoading }] = useUpdateTaskDetailsMutation()
	const { toast } = useToast()

	const handleAddLabel = async () => {
		if (!newLabel.trim() || labels.includes(newLabel.trim())) {
			setNewLabel('')
			return
		}

		try {
			await updateTask({
				taskId,
				updates: { labels: [...labels, newLabel.trim()] }
			}).unwrap()

			setNewLabel('')
			setIsOpen(false)
			toast({
				title: 'Success',
				description: 'Label added successfully'
			})
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to add label',
				variant: 'destructive'
			})
		}
	}

	const handleRemoveLabel = async (labelToRemove: string) => {
		try {
			await updateTask({
				taskId,
				updates: { labels: labels.filter((l) => l !== labelToRemove) }
			}).unwrap()

			toast({
				title: 'Success',
				description: 'Label removed successfully'
			})
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to remove label',
				variant: 'destructive'
			})
		}
	}

	return (
		<div className='space-y-2'>
			{/* Current Labels */}
			<div className='flex flex-wrap gap-2'>
				{labels.length === 0 ? (
					<p className='text-sm italic text-muted-foreground'>No labels</p>
				) : (
					labels.map((label) => (
						<Badge key={label} variant='secondary' className='gap-1'>
							{label}
							<button
								onClick={() => handleRemoveLabel(label)}
								className='ml-1 hover:text-destructive'
								disabled={isLoading}
							>
								<X className='h-3 w-3' />
							</button>
						</Badge>
					))
				)}
			</div>

			{/* Add Label */}
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button variant='outline' size='sm' className='w-full'>
						<Plus className='mr-2 h-4 w-4' />
						Add Label
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-80' align='start'>
					<div className='space-y-3'>
						<div className='space-y-2'>
							<label className='text-sm font-medium'>New Label</label>
							<Input
								value={newLabel}
								onChange={(e) => setNewLabel(e.target.value)}
								placeholder='Enter label name...'
								onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
							/>
						</div>
						<Button onClick={handleAddLabel} disabled={isLoading || !newLabel.trim()} className='w-full'>
							{isLoading ? 'Adding...' : 'Add Label'}
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
