import { Link } from 'react-router-dom'
import { Logo } from './'
import { LoginForm } from './LoginForm'
import { Card } from '@/components/ui'
import { ToastContainer } from 'react-toastify'

function Login() {
	return (
		<>
			<div className='flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-foreground'>
				{/* Logo and Title */}
				<Logo />

				{/* Login Card */}
				<Card className='border-0 shadow-xl backdrop-blur'>
					<h2 className='mb-2 text-center text-xl font-semibold'>Đăng nhập</h2>
					<p className='mb-6 text-center text-sm text-muted-foreground'>
						Nhập thông tin tài khoản UIT của bạn để tiếp tục
					</p>

					{/* Login Form */}
					<LoginForm />

					<div className='my-3 h-[1px] bg-slate-400'></div>

					{/* Register Link */}
					<div className='text-center text-sm text-muted-foreground'>
						Chưa có tài khoản?{' '}
						<Link to='/register' className='font-medium text-primary hover:underline'>
							Liên hệ admin để đăng ký
						</Link>
					</div>
				</Card>
			</div>
			<ToastContainer
				position='top-right'
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme='light'
			/>
		</>
	)
}

export { Login }
