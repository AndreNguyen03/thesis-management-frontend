import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Loader2 } from 'lucide-react'

export const WithdrawConfirmation: React.FC<{
	open: boolean
	onWithdraw: () => void
	isWithdrawing?: boolean
	onClose: () => void
	amounts: number
}> = ({ open, onWithdraw, isWithdrawing, onClose, amounts }) => (
	<Dialog open={open} onOpenChange={onClose}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Bạn có chắc chắn muốn rút {amounts} đề tài?</DialogTitle>
				<DialogDescription>
					Hãy chắc chắn rằng những đề tài sau sẽ được rút khỏi danh sách nộp{' '}
				</DialogDescription>
				<DialogDescription>Những đề tài này sẽ được lưu trữ trong danh sách nháp </DialogDescription>
			</DialogHeader>
			<div className='flex justify-end gap-2'>
				<Button variant='outline' onClick={onClose}>
					Hủy
				</Button>
				<Button variant={'toggle_orange'} disabled={isWithdrawing} onClick={onWithdraw}>
					{isWithdrawing && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
					Rút đăng ký {amounts} đề tài
				</Button>
			</div>
		</DialogContent>
	</Dialog>
)
