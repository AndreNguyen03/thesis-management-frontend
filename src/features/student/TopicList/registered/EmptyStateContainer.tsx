import { Button } from '@/components/ui'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const EmptyStateContainer = ({ type }: { type: string }) => {
	const navigate = useNavigate()

	const handleDiscover = () => {
		navigate('/topics') // Điều hướng đến trang danh sách đề tài
	}

	return (
		<div className='flex flex-col items-center justify-center rounded-lg border border-dashed bg-gray-50 p-8 text-center'>
			<div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
				<Search className='h-8 w-8 text-blue-600' />
			</div>

			<h3 className='mb-2 text-xl font-semibold text-gray-800'>
				{type === 'registered' ? 'Bạn chưa đăng ký đề tài lần nào cả' : 'Bạn chưa hủy đăng ký đề tài nào'}
			</h3>

			<p className='mb-6 max-w-md text-gray-500'>
				{type === 'registered'
					? 'Có vẻ như bạn chưa đăng ký đề tài nào cả. Hãy bắt đầu khám phá và lựa chọn đề tài phù hợp ngay.'
					: 'Chưa ghi nhận lần hủy đăng ký nào.'}
			</p>

			{type === 'registered' && (
				<Button onClick={() => handleDiscover()} className='bg-blue-600 hover:bg-blue-700'>
					<Search className='mr-2 h-4 w-4' />
					Khám phá đề tài
				</Button>
			)}
		</div>
	)
}
