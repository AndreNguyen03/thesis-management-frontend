import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter
} from '@/components/ui/dialog'
import { LoadingState } from '@/components/ui/LoadingState'
import type { Period } from '@/models/period'

interface DeletePeriodModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	isLoading: boolean
	period: Period | null
	onConfirm: (periodId: string) => void
}

export function DeletePeriodModal({ open, onOpenChange, isLoading, period, onConfirm }: DeletePeriodModalProps) {
    
	const handleDelete = () => {
		if (period) {
			onConfirm(period.id)
			onOpenChange(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[400px]'>
				{isLoading ? (
					<LoadingState message='Đang xóa đợt đăng ký...' />
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Xóa đợt đăng ký</DialogTitle>
							<DialogDescription>
								Bạn có chắc muốn xóa đợt đăng ký <strong>{period?.name}</strong>? Hành động này không
								thể hoàn tác.
							</DialogDescription>
						</DialogHeader>

						<DialogFooter className='flex justify-end gap-2'>
							<Button variant='outline' onClick={() => onOpenChange(false)}>
								Hủy
							</Button>
							<Button variant='destructive' onClick={handleDelete}>
								Xóa
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
