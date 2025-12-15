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

	const [resetPassword, { isLoading }] = useResetPasswordMutation()

	const methods = useForm<ResetFormValues>({
		defaultValues: { newPassword: '', confirmPassword: '' }
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
		} catch (error: any) {
			const message = error?.data?.message || error?.error
			toast.error(message)
		}
	}

	return (
		<>
			<div className='flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-foreground'>
				<Logo />

				<Card className='w-full max-w-md border-0 p-6 shadow-xl backdrop-blur'>
					<Link
						to='/login'
						className='mb-4 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
					>
						<ArrowLeft size={18} className='mr-2' />
						Quay lại
					</Link>

					{!isSubmitted ? (
						<>
							<h2 className='mb-2 text-center text-xl font-semibold text-foreground'>Đặt lại mật khẩu</h2>
							<p className='mb-6 text-center text-sm text-muted-foreground'>
								Nhập mật khẩu mới để đặt lại tài khoản của bạn
							</p>

							<FormProvider {...methods}>
								<form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
									<div className='space-y-2'>
										<label htmlFor='newPassword' className='font-semibold text-foreground'>
											Mật khẩu mới
										</label>
										<PasswordInput<ResetFormValues>
											name='newPassword'
											placeholder='Nhập mật khẩu mới'
											control={methods.control}
										/>
									</div>

									<div className='space-y-2'>
										<label htmlFor='confirmPassword' className='font-semibold text-foreground'>
											Xác nhận mật khẩu
										</label>
										<PasswordInput<ResetFormValues>
											name='confirmPassword'
											placeholder='Nhập lại mật khẩu'
											control={methods.control}
										/>
									</div>

									<Button
										type='submit'
										className='h-12 w-full bg-gradient-to-br from-primary/80 to-primary font-medium text-primary-foreground transition-colors hover:from-primary/90 hover:to-primary'
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
								<MailIcon size={48} className='text-primary' />
							</div>
							<h2 className='mb-2 text-center text-xl font-semibold text-foreground'>Đặt lại mật khẩu</h2>
							<p className='mb-6 text-center text-sm text-muted-foreground'>
								Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập để tiếp tục!
							</p>
							<Button
								type='button'
								onClick={() => (window.location.href = '/login')}
								className='h-12 w-full bg-gradient-to-br from-primary/80 to-primary font-medium text-primary-foreground transition-colors hover:from-primary/90 hover:to-primary'
							>
								Đăng nhập
							</Button>
						</>
					)}

					<div className='my-3 h-[1px] bg-primary/40'></div>

					<div className='text-center text-sm'>
						<span className='text-muted-foreground'>Nhớ mật khẩu rồi? </span>
						<Link to='/login' className='ml-1 font-medium text-primary transition-colors hover:underline'>
							Đăng nhập
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
