import { Button, Card, FormInput } from '@/components/ui'
import { ArrowLeft, Mail, MailIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { useForgotPasswordMutation } from '../../../services/authApi'
import { toast, ToastContainer } from 'react-toastify'

interface ForgotFormValues {
	email: string
}

function ForgotPassword() {
	const [isSubmitted, setIsSubmitted] = useState(false)
	const [userEmail, setUserEmail] = useState<string | null>('')

	const [requestForgotPassword, { isLoading }] = useForgotPasswordMutation()

	const methods = useForm<ForgotFormValues>({
		defaultValues: {
			email: ''
		}
	})

	const onSubmit = async (data: ForgotFormValues) => {
		// Simulate API call
		try {
			const { email } = data
			await requestForgotPassword({ email }).unwrap()
			toast.success('Đã gửi link đặt mật khẩu!')
			setUserEmail(email)
			setIsSubmitted(true)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			const message = error?.data?.message || error?.error

			toast.error(message)
		}
	}

	const onResend = async () => {
		if (userEmail) {
			await onSubmit({ email: userEmail })
		}
	}

	return (
		<>
			<div className='flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-foreground'>
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

					<div className='m-auto my-4 w-fit rounded-lg bg-gradient-primary p-4 text-primary-foreground'>
						<Mail className='h-8 w-8' />
					</div>

					<h2 className='mb-2 text-center text-xl font-semibold'>Quên mật khẩu</h2>

					{!isSubmitted ? (
						<>
							<p className='mb-6 text-center text-sm text-muted-foreground'>
								Nhập email UIT của bạn để nhận link đặt lại mật khẩu
							</p>
							<FormProvider {...methods}>
								<form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
									{/* Email Field */}
									<div className='space-y-2'>
										<label htmlFor='email' className='font-semibold'>
											Email UIT
										</label>
										<div className='relative'>
											<FormInput<ForgotFormValues>
												name='email'
												icon={<MailIcon size={18} />}
												placeholder='student@gm.uit.edu.vn'
												className='pl-10 pr-10'
												rules={{ required: 'Email is required' }}
												control={methods.control}
											/>
											<MailIcon
												size={18}
												className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'
											/>
										</div>
									</div>

									{/* Send Button */}
									<Button
										type='submit'
										className='h-12 w-full bg-gradient-primary text-base font-medium hover:bg-primary-hover'
										disabled={isLoading}
									>
										{isLoading ? 'Đang gửi...' : 'Gửi link đặt lại'}
									</Button>
								</form>
							</FormProvider>
						</>
					) : (
						<>
							<div className='mb-6 text-center text-sm text-muted-foreground'>
								Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn
							</div>
							<div className='mb-6 flex flex-col items-center space-y-2 bg-[#E7F5EC] p-4 text-muted-foreground'>
								<p className='text-center text-sm font-medium'>
									Vui lòng kiểm tra email <span className='text-slate-700'>{userEmail}</span> và làm
									theo hướng dẫn để đặt lại mật khẩu.
								</p>
							</div>
							<div className='mb-6 flex flex-col items-center space-y-2'>
								<p className='text-sm text-muted-foreground'>Không nhận được email?</p>
								<Button
									onClick={onResend}
									className='h-10 w-full bg-gradient-primary text-sm font-medium hover:bg-primary-hover'
									disabled={isLoading}
								>
									{isLoading ? 'Đang gửi...' : 'Gửi lại'}
								</Button>
							</div>
						</>
					)}

					<div className='my-3 h-[1px] bg-primary'></div>

					{/* Login Link */}
					<div className='text-center'>
						<span className='inline-flex items-center text-sm font-medium text-muted-foreground'>
							Nhớ mật khẩu rồi?{' '}
						</span>
						<Link
							to='/login'
							className='inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground hover:underline'
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

export { ForgotPassword }
