import { Button, Card } from '@/components/ui'
import { ArrowLeft, MailIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Logo } from './'
import { FormProvider, useForm } from 'react-hook-form'
import { useResetPasswordMutation } from '../../../services/authApi'
import { toast, ToastContainer } from 'react-toastify'
import { PasswordInput } from './PasswordInput'

interface ResetFormValues {
	newPassword: string
	confirmPassword: string
}

function ResetPassword() {
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [searchParams] = useSearchParams()
	const token = searchParams.get('token') as string

	console.log(token)

	const [resetPassword, { isLoading }] = useResetPasswordMutation()

	const methods = useForm<ResetFormValues>({
		defaultValues: {
			newPassword: '',
			confirmPassword: ''
		}
	})

	const onSubmit = async (data: ResetFormValues) => {
		if (data.newPassword !== data.confirmPassword) {
			toast.error('Mật khẩu không khớp')
			return
		}
		try {
			await resetPassword({ token, newPassword: data.newPassword }).unwrap()
			toast.success('Đặt lại mật khẩu thành công')
			setIsSubmitted(true)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			const message = error?.data?.message || error?.error
			toast.error(message)
		}
	}

	return (
		<>
			<div className='flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-foreground'>
				{/* Logo and Title */}
				<Logo />

				{/* Login Card */}
				<Card className='border-0 shadow-xl backdrop-blur'>
					{/* Back Button */}
					<Link
						to='/login'
						className='mb-4 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground'
					>
						<ArrowLeft size={18} className='mr-2' />
						Quay lại
					</Link>

					{!isSubmitted ? (
						<>
							<h2 className='mb-2 text-center text-xl font-semibold'>Đặt lại mật khẩu</h2>
							<p className='mb-6 text-center text-sm text-muted-foreground'>
								Nhập mật khẩu mới để đặt lại tài khoản của bạn
							</p>
							<FormProvider {...methods}>
								<form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
									{/* New Password Field */}
									<div className='space-y-2'>
										<label htmlFor='newPassword' className='font-semibold'>
											Mật khẩu mới
										</label>
										<div className='relative'>
											<PasswordInput<ResetFormValues>
												name='newPassword'
												placeholder='Nhập mật khẩu mới'
												control={methods.control}
											/>
										</div>
									</div>

									{/* Confirm Password Field */}
									<div className='space-y-2'>
										<label htmlFor='confirmPassword' className='font-semibold'>
											Xác nhận mật khẩu
										</label>
										<div className='relative'>
											<PasswordInput<ResetFormValues>
												name='confirmPassword'
												placeholder='Nhập lại mật khẩu'
												control={methods.control}
											/>
										</div>
									</div>

									{/* Reset Button */}
									<Button
										type='submit'
										className='h-12 w-full bg-gradient-primary text-base font-medium hover:bg-primary-hover'
										disabled={isLoading}
									>
										{isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
									</Button>
								</form>
							</FormProvider>
						</>
					) : (
						<>
							<div className='mb-4 flex justify-center'>
								<MailIcon size={48} className='text-blue-500' />
							</div>
							<h2 className='mb-2 text-center text-xl font-semibold'>Đặt lại mật khẩu</h2>
							<p className='mb-6 text-center text-sm text-muted-foreground'>
								Mật khẩu của bạn đã được đặt lại thành công. Vui lòng kiểm tra email để xác nhận hoặc
								đăng nhập ngay!
							</p>
							<Button
								type='button'
								onClick={() => (window.location.href = '/login')}
								className='h-12 w-full bg-gradient-primary text-base font-medium hover:bg-primary-hover'
							>
								Đăng nhập
							</Button>
						</>
					)}

					<div className='my-3 h-[1px] bg-primary'></div>

					{/* Login Link */}
					<div className='text-center'>
						<span className='inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground'>
							Nhớ mật khẩu rồi?{' '}
						</span>
						<Link
							to='/login'
							className='inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground'
						>
							<span className='ml-2 text-blue-600'>Đăng nhập</span>
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

export { ResetPassword }
