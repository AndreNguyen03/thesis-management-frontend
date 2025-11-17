import { Button } from '@/components/ui'
import { DialogHeader } from '@/components/ui/Dialog'
import { DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import { Loader2 } from 'lucide-react'

export const ConfirmCancelRegistration: React.FC<{
	onUnRegister: () => void
	isCanceling: boolean
	onClose: () => void
}> = ({ onUnRegister, isCanceling, onClose }) => (
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Bạn có chắc chắn muốn hủy đăng ký đề tài này?</DialogTitle>
			<DialogDescription>Hãy chắc chắn rằng bạn đã suy nghĩ kĩ trước khi hủy.</DialogDescription>
		</DialogHeader>
		<div className='flex justify-end gap-2'>
			<Button variant='outline' onClick={onClose}>
				Hủy
			</Button>
			<Button className='bg-gradient-primary' disabled={isCanceling} onClick={onUnRegister}>
				{isCanceling && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
				Xác nhận
			</Button>
		</div>
	</DialogContent>
)
