import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import type { RegisteredTopic } from '../types'
import { Loader2, AlertTriangle } from 'lucide-react'

interface CancelConfirmModalProps {
	registeredTopic: RegisteredTopic | null
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	isLoading?: boolean
}

export function CancelConfirmModal({
	registeredTopic,
	isOpen,
	onClose,
	onConfirm,
	isLoading
}: CancelConfirmModalProps) {
	if (!registeredTopic) return null

	return (
		<AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<AlertDialogContent className='border-border bg-card'>
				<AlertDialogHeader>
					<div className='mb-2 flex items-center gap-2 text-destructive'>
						<AlertTriangle className='h-5 w-5' />
						<AlertDialogTitle>Xác nhận hủy đăng ký</AlertDialogTitle>
					</div>
					<AlertDialogDescription className='space-y-2'>
						<span>Bạn có chắc muốn hủy đăng ký đề tài:</span>
						<span className='block font-medium text-foreground'>"{registeredTopic.topic.title}"</span>
						<span className='text-warning block'>Sau khi hủy, bạn có thể đăng ký đề tài khác.</span>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose} disabled={isLoading} className='bg-muted hover:bg-muted/80'>
						Giữ đề tài
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isLoading}
						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
					>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Đang xử lý...
							</>
						) : (
							'Xác nhận hủy'
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
