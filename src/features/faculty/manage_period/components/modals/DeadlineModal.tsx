import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { LoadingState } from '@/components/ui/LoadingState'
// Mock mutation: Sử dụng useState để simulate loading, success/error
// Sau này thay bằng useSendNotificationMutation thực tế

interface DeadlineModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSend: (deadline: string) => void
}

export function DeadlineModal({ open, onOpenChange, onSend }: DeadlineModalProps) {
	const [deadline, setDeadline] = useState<string>('')
	const [isLoading, setIsLoading] = useState(false) // Mock loading state

	const resetForm = () => {
		setDeadline('')
		onOpenChange(false)
	}

	// Mock handleSendNotification
	const handleSendNotification = async () => {
		if (!deadline) return

		setIsLoading(true)
		try {
			// Simulate API delay
			await new Promise((resolve) => setTimeout(resolve, 1500))

			// Mock success
			const mockResponse = {
				message: `Thông báo đã được gửi thành công đến giảng viên!`
			}
			// Callback để parent xử lý
			await onSend(deadline)
			resetForm()
			// toast({
			// 	title: 'Thành công',
			// 	description: mockResponse.message
			// })

		} catch (error) {
			// Mock error (20% chance)
			if (Math.random() < 0.2) {
				toast({
					title: 'Lỗi',
					description: `Lỗi kết nối server. Vui lòng thử lại. ${error}`,
					variant: 'destructive'
				})
				return
			}
			// const mockResponse = {
			// 	message: 'Thông báo đã được gửi thành công!'
			// }
			//resetForm()
			// toast({
			// 	title: 'Thành công',
			// 	description: mockResponse.message
			// })
			// onSend(deadline)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[425px]'>
				{isLoading ? (
					<LoadingState message='Đang gửi thông báo...' />
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Gửi thông báo nhắc nhở</DialogTitle>
							<DialogDescription>
								Chọn thời hạn (deadline) để gửi thông báo nhắc nhở 
							</DialogDescription>
						</DialogHeader>

						<div className='space-y-6 py-4'>
							{/* Input deadline */}
							<div className='space-y-2'>
								<Label htmlFor='deadline'>Thời hạn (Deadline) *</Label>
								<input
									id='deadline'
									type='datetime-local'
									className='w-full rounded border px-3 py-2'
									value={deadline}
									onChange={(e) => setDeadline(e.target.value)}
									min={new Date().toISOString().slice(0, 16)} // Không cho chọn quá khứ
								/>
							</div>
						</div>

						<DialogFooter>
							<Button variant='outline' onClick={() => onOpenChange(false)}>
								Hủy
							</Button>
							<Button onClick={handleSendNotification} disabled={!deadline}>
								Gửi thông báo
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
