import type { Subtask } from '@/models/todolist.model'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Eye, X } from 'lucide-react'

const SubTaskContainer = ({
	item,
	columnId,
	taskId,
	onHandleDelete,
	onOpenModal,
}: {
	item: Subtask
	onHandleDelete: () => void
	columnId: string
	taskId: string
	onOpenModal: () => void
}) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._id })

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
		opacity: isDragging ? 0.5 : 1,
		touchAction: 'none'
	}

	return (
		<>
			<div
				className='group/item flex justify-between rounded border bg-card p-2 text-xs text-foreground'
				ref={setNodeRef}
				style={style}
				{...attributes}
				{...listeners}
				key={item._id}
			>
				<span className='text-[13px] font-semibold text-foreground'>{item.title}</span>
				<div className='flex gap-2'>
					<button
						className='hidden rounded px-0.5 hover:text-blue-800 group-hover/item:block'
						onClick={(e) => {
							e.stopPropagation()
							onOpenModal()
						}}
						onPointerDown={(e) => e.stopPropagation()}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<Eye className='h-4 w-4' />
					</button>
					<button
						className='hidden rounded px-0.5 hover:bg-red-600 hover:text-white group-hover/item:block'
						onClick={(e) => {
							e.stopPropagation()
							onHandleDelete()
						}}
						onPointerDown={(e) => e.stopPropagation()}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<X className='h-3 w-3' />
					</button>
				</div>
			</div>
		</>
	)
}

export default SubTaskContainer
