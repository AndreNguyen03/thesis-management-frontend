import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui'

const NotFound = () => {
	const location = useLocation()

	useEffect(() => {
		console.error('404 Error: User attempted to access non-existent route:', location.pathname)
	}, [location.pathname])

	return (
		<div className='flex min-h-screen items-center justify-center bg-gradient-background'>
			<div className='space-y-6 p-8 text-center'>
				<div className='space-y-2'>
					<h1 className='text-8xl font-bold text-primary'>404</h1>
					<h2 className='text-2xl font-semibold text-foreground'>Trang không tồn tại</h2>
					<p className='max-w-md text-muted-foreground'>
						Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
					</p>
				</div>

				<div className='flex flex-col justify-center gap-3 sm:flex-row'>
					<Button className='bg-gradient-primary'>
						<Link to='/'>
							<Home className='mr-2 h-4 w-4' />
							Về trang chủ
						</Link>
					</Button>
					<Button variant='outline'>
						<Link to='/thesis'>Xem danh sách đề tài</Link>
					</Button>
				</div>

				<div className='text-xs text-muted-foreground'>Đường dẫn: {location.pathname}</div>
			</div>
		</div>
	)
}

export default NotFound
