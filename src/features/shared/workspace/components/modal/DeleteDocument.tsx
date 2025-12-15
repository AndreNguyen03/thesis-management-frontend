import { Button } from '@/components/ui'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/Dialog'
import { Loader2 } from 'lucide-react'

export const DeleteDocumentModal = ({
	isLoading,
	open,
	onOpenChange,
	onConfirm,
	title
}: {
	open: boolean
	isLoading?: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: () => void
	title: string
}) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Xóa Task</DialogTitle>
					<DialogDescription>
						Bạn có chắc chắn muốn xóa <span className='font-bold'>{title}</span> này? Hành động này không
						thể hoàn tác.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)}>
						Hủy
					</Button>
					<Button variant='destructive' onClick={onConfirm} disabled={isLoading}>
						{isLoading ? <Loader2 className='animate-spin' /> : 'Xóa'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
