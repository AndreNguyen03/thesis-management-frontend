import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

interface DeleteTopicModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    isLoading: boolean
}
const DeleteTopicModal = ({ open, onClose, onConfirm, isLoading }: DeleteTopicModalProps) => (
	<Dialog open={open} onOpenChange={onClose}>
		<DialogContent>
			<DialogTitle>Xác nhận xóa đề tài</DialogTitle>
			<div className='my-4'>Bạn có chắc chắn muốn xóa đề tài này? Hành động này không thể hoàn tác.</div>
			<DialogFooter>
				<Button variant='outline' onClick={onClose} disabled={isLoading}>
					Hủy
				</Button>
				<Button variant='destructive' onClick={onConfirm} disabled={isLoading}>
					{isLoading ? 'Đang xóa...' : 'Xóa'}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
)

export default DeleteTopicModal
