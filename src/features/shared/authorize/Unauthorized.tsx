import { Button } from '@/components/ui'
import { useNavigate } from 'react-router-dom'

export default function Unauthorized() {
	const navigate = useNavigate()
	return (
		<div className='flex min-h-screen items-center justify-center'>
			<div className='space-y-4 rounded-lg border bg-white p-8 text-center shadow'>
				<h2 className='text-2xl font-semibold text-red-600'>Không có quyền truy cập</h2>
				<p className='text-sm text-muted-foreground'>Bạn không có đủ quyền để xem trang này.</p>
				<div className='flex justify-center gap-2'>
					<Button onClick={() => navigate(-1)} variant='outline'>
						Quay lại
					</Button>
					<Button onClick={() => navigate('/')}>Về trang chủ</Button>
				</div>
			</div>
		</div>
	)
}
