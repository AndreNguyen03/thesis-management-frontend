import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useUpdateDescriptionMutation } from '@/services/todolistApi'
import RichTextEditor from '@/components/common/RichTextEditor'
import { Edit2, Check, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TaskDescriptionProps {
	taskId: string
	initialDescription: string
}

export const TaskDescription = ({ taskId, initialDescription }: TaskDescriptionProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [description, setDescription] = useState(initialDescription || '')
	const [updateDescription, { isLoading }] = useUpdateDescriptionMutation()
	const { toast } = useToast()

	const handleSave = async () => {
		try {
			await updateDescription({
				taskId,
				payload: { description }
			}).unwrap()

			toast({
				title: 'Success',
				description: 'Description updated successfully'
			})
			setIsEditing(false)
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update description' + error,
				variant: 'destructive'
			})
		}
	}

	const handleCancel = () => {
		setDescription(initialDescription || '')
		setIsEditing(false)
	}

	return (
		<div className='space-y-3'>
			<div className='flex items-center justify-between'>
				<h3 className='text-sm font-semibold'>Description</h3>
				{!isEditing && (
					<Button variant='ghost' size='sm' onClick={() => setIsEditing(true)}>
						<Edit2 className='mr-2 h-4 w-4' />
						Chỉnh sửa
					</Button>
				)}
			</div>

			{isEditing ? (
				<div className='space-y-3'>
					<RichTextEditor value={description} onChange={setDescription} placeholder='Add a description...' />
					<div className='flex gap-2'>
						<Button onClick={handleSave} disabled={isLoading} size='sm'>
							<Check className='mr-1 h-4 w-4' />
							Lưu
						</Button>
						<Button variant='outline' onClick={handleCancel} disabled={isLoading} size='sm' className='bg-white'>
							<X className='mr-1 h-4 w-4' />
							Hủy
						</Button>
					</div>
				</div>
			) : (
				<div
					className='prose prose-sm min-h-[100px] bg-white max-w-none rounded-md border bg-muted/30 p-3'
					dangerouslySetInnerHTML={{
						__html: description || '<p class="text-muted-foreground italic">Chưa có mô tả</p>'
					}}
				/>
			)}
		</div>
	)
}
