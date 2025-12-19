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
import { Loader2 } from 'lucide-react'
import type { GeneralTopic } from '@/models'

interface ConfirmModalProps {
	topic: GeneralTopic | null
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	isLoading?: boolean
}

export function ConfirmModal({ topic, isOpen, onClose, onConfirm, isLoading }: ConfirmModalProps) {
	if (!topic) return null

	return (
		<AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<AlertDialogContent className='border-border bg-card'>
				<AlertDialogHeader>
					<AlertDialogTitle>Xác nhận đăng ký đề tài</AlertDialogTitle>
					<AlertDialogDescription className='space-y-2'>
						<span>Bạn có chắc muốn đăng ký đề tài:</span>
						<span className='block font-medium text-foreground'>"{topic.titleVN}"</span>
						<span className='block'>Giảng viên hướng dẫn: {topic.createByInfo.fullName}</span>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onClose} disabled={isLoading} className='bg-muted hover:bg-muted/80'>
						Hủy
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isLoading}
						className='bg-primary text-primary-foreground hover:bg-primary/90'
					>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Đang xử lý...
							</>
						) : (
							'Xác nhận đăng ký'
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
