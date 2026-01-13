import { useState } from 'react'
import type { TaskUser } from '@/models/task-detail.model'
import { Button } from '@/components/ui/Button'
import { useUpdateSubtaskMutation } from '@/services/todolistApi'
import { useToast } from '@/hooks/use-toast'
import { Plus, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useGetGroupDetailQuery } from '@/services/groupApi'
import { Checkbox } from '@/components/ui/checkbox'
import type { Participant } from '@/models/groups.model'

interface SubtaskAssigneesProps {
	taskId: string
	columnId: string
	subtaskId: string
	groupId: string
	assignees?: TaskUser[]
}

export const SubtaskAssignees = ({ taskId, columnId, subtaskId, groupId, assignees }: SubtaskAssigneesProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>(assignees?.map((a) => a._id) || [])

	const { data: group } = useGetGroupDetailQuery({ groupId })
	const [updateSubtask, { isLoading }] = useUpdateSubtaskMutation()
	const { toast } = useToast()

	const handleSave = async () => {
		try {
			await updateSubtask({
				taskId,
				columnId,
				subtaskId,
				updates: { assignees: selectedUserIds },
				groupId: groupId
			}).unwrap()

			toast({
				title: 'Success',
				description: 'Assignees updated successfully'
			})
			setIsOpen(false)
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update assignees' + error,
				variant: 'destructive'
			})
		}
	}

	const toggleUser = (userId: string) => {
		setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
	}

	const removeAssignee = async (userId: string) => {
		try {
			const newAssignees = assignees?.filter((a) => a._id !== userId).map((a) => a._id)
			await updateSubtask({
				taskId,
				columnId,
				subtaskId,
				updates: { assignees: newAssignees },
                groupId: groupId
			}).unwrap()

			toast({
				title: 'Success',
				description: 'Assignee removed successfully'
			})
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to remove assignee' + error,
				variant: 'destructive'
			})
		}
	}

	// Get all group members
	const groupMembers = group?.participants || []
	return (
		<div className='space-y-2'>
			{/* Current Assignees */}
			<div className='space-y-2'>
				{!assignees || assignees.length === 0 ? (
					<p className='text-sm italic text-muted-foreground'>Chưa có phân công</p>
				) : (
					assignees.map((assignee) => (
						<div key={assignee._id} className='group flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								{assignee.avatarUrl ? (
									<img
										src={assignee.avatarUrl}
										alt={assignee.fullName}
										className='h-8 w-8 rounded-full'
									/>
								) : (
									<div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
										<span className='text-xs font-medium'>{assignee.fullName.charAt(0)}</span>
									</div>
								)}
								<div className='text-sm'>
									<div className='font-medium'>{assignee.fullName}</div>
								</div>
							</div>
							<Button
								variant='ghost'
								size='icon'
								className='h-6 w-6 opacity-0 group-hover:opacity-100'
								onClick={() => removeAssignee(assignee._id)}
							>
								<X className='h-3 w-3' />
							</Button>
						</div>
					))
				)}
			</div>

			{/* Add Assignee Button */}
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button variant='outline' size='sm' className='w-full'>
						<Plus className='mr-2 h-4 w-4' />
						Thêm phân công
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-80 p-0' align='start'>
					<Command>
						<CommandInput placeholder='Tìm kiếm thành viên...' />
						<CommandList>
							<CommandEmpty>Không tìm thấy thành viên</CommandEmpty>
							<CommandGroup>
								{groupMembers.map((member: Participant) => (
									<CommandItem key={member._id} onSelect={() => toggleUser(member._id)}>
										<Checkbox checked={selectedUserIds.includes(member._id)} className='mr-2' />
										<div className='flex flex-1 items-center gap-2'>
											{member.avatarUrl ? (
												<img
													src={member.avatarUrl}
													alt={member.fullName}
													className='h-6 w-6 rounded-full'
												/>
											) : (
												<div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10'>
													<span className='text-xs'>{member.fullName.charAt(0)}</span>
												</div>
											)}
											<div className='text-sm'>
												<div className='font-medium'>{member.fullName}</div>
											</div>
										</div>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
					<div className='border-t p-2'>
						<Button onClick={handleSave} disabled={isLoading} size='sm' className='w-full'>
							Lưu
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
