import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Loader2 } from 'lucide-react'

export const ConfirmRegistration: React.FC<{
	onRegister: () => void
	isRegistering?: boolean
	onClose: () => void
}> = ({ onRegister, isRegistering, onClose }) => (
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Bạn có chắc chắn muốn đăng ký đề tài này?</DialogTitle>
			<DialogDescription>
				Hãy chắc chắn rằng bạn đã đọc kỹ mô tả và yêu cầu của đề tài trước khi đăng ký.
			</DialogDescription>
		</DialogHeader>
		<div className='flex justify-end gap-2'>
			<Button variant='outline' onClick={onClose}>
				Hủy
			</Button>
			<Button className='bg-gradient-primary' disabled={isRegistering} onClick={onRegister}>
				{isRegistering && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
				Đăng ký
			</Button>
		</div>
	</DialogContent>
)
