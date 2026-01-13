import { useState } from 'react'
import type { TaskUser } from '@/models/task-detail.model'
import { Button } from '@/components/ui/Button'
import { useAssignUsersMutation } from '@/services/todolistApi'
import { useToast } from '@/hooks/use-toast'
import { Plus, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useGetGroupDetailQuery } from '@/services/groupApi'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar } from '@/features/shared/workspace/components/Avatar'
import type { Participant } from '@/models/groups.model'

interface TaskAssigneesProps {
	taskId: string
	groupId: string
	assignees: TaskUser[]
}

export const TaskAssignees = ({ taskId, groupId, assignees }: TaskAssigneesProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedUserIds, setSelectedUserIds] = useState<string[]>(assignees.map((a) => a._id))

	const { data: group } = useGetGroupDetailQuery({ groupId })
	const [assignUsers, { isLoading }] = useAssignUsersMutation()
	const { toast } = useToast()

	const handleSave = async () => {
		try {
			await assignUsers({
				taskId,
				payload: { userIds: selectedUserIds }
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
			const newAssignees = assignees.filter((a) => a._id !== userId).map((a) => a._id)
			await assignUsers({
				taskId,
				payload: { userIds: newAssignees }
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
				{assignees.length === 0 ? (
					<p className='text-sm italic text-muted-foreground'>Chưa có phân công</p>
				) : (
					assignees.map((assignee) => (
						<div key={assignee._id} className='group flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<Avatar fullName={assignee.fullName} avatarUrl={assignee.avatarUrl} />
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
											<Avatar fullName={member.fullName} avatarUrl={member.avatarUrl} />
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
						<Button onClick={handleSave} disabled={isLoading} className='w-full' size='sm'>
							{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
