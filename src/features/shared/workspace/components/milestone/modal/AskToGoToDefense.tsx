import { Button } from '@/components/ui'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { DialogTitle } from '@radix-ui/react-dialog'
import type { is } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'

const AskToGoToDefense = ({
	open,
	setShowAskToGoModal,
	onGotoDefense,
	isLoading
}: {
	open: boolean
	setShowAskToGoModal: (v: boolean) => void
	onGotoDefense: () => void
	isLoading?: boolean
}) => {
	return (
		<Dialog open={open} onOpenChange={setShowAskToGoModal}>
			<DialogContent className='w-fit px-11 pb-6 pt-8'>
				<DialogTitle className='mb-2 text-xl font-bold text-slate-800'>
					Đề tài đã đủ điều kiện có thể đi tiếp
				</DialogTitle>
				<p className='text-sm text-slate-600'>
					Đề tài đã hoàn thành mốc cuối cùng và giảng viên cho rằng đề tài đã đủ điều kiện để đi tiếp ?
				</p>
				<div className='flex justify-between gap-4'>
					<Button className='bg-gray-200 text-gray-600 hover:bg-gray-300' onClick={onGotoDefense}>
						{isLoading ? <Loader2 /> : 'Cho phép đi tới bảo vệ'}
					</Button>
					<Button
						className='bg-gray-400 font-semibold text-gray-700'
						onClick={() => setShowAskToGoModal(false)}
					>
						Hủy
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default AskToGoToDefense
