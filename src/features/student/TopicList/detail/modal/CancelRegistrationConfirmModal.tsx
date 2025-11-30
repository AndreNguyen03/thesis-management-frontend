import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/Dialog'
import { Loader2 } from 'lucide-react'

interface CancelRegistrationConfirmModalProps {
	open: boolean
	onConfirm: () => void
	onCancel: () => void
	isLoading?: boolean
}

const CancelRegistrationConfirmModal: React.FC<CancelRegistrationConfirmModalProps> = ({
	open,
	onConfirm,
	onCancel,
	isLoading
}) => {
	return (
		<Dialog open={open} onOpenChange={onCancel}>
			<DialogContent className='max-w-sm'>
				<DialogHeader>
					<DialogTitle className='text-red-600'>Xác nhận hủy đăng ký</DialogTitle>
				</DialogHeader>
				<div className='py-2 text-sm text-gray-700'>
					Bạn có chắc chắn muốn hủy đăng ký đề tài này không? Hành động này không thể hoàn tác.
				</div>
				<DialogFooter className='flex justify-end gap-2'>
					<Button variant='outline' onClick={onCancel} disabled={isLoading}>
						Đóng
					</Button>
					<Button variant='destructive' onClick={onConfirm} disabled={isLoading}>
						{isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
						Xác nhận hủy
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default CancelRegistrationConfirmModal
