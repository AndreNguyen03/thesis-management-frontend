import { Button } from '@/components/ui'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const DeletedTopicContainter = () => {
	const navigate = useNavigate()
	return (
		<Dialog open={true}>
			<DialogContent hideClose={true} className='h-screen min-w-full rounded-xl bg-[#F2F4FF] p-8'>
				<div className='flex flex-col gap-4'>
					<div className='grid grid-cols-3 px-4'>
						<Button variant='back' className='w-fit border border-gray-300' onClick={() => navigate(-1)}>
							<ChevronLeft className='size-6' />
							<p>Quay lại</p>
						</Button>
					</div>
					<div className='flex items-center justify-center'>
						<h1 className='col-span-3 mt-10 text-3xl font-semibold text-gray-700'>Đề tài đã bị xóa</h1>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default DeletedTopicContainter
