import { Button, Card, FormInput } from '@/components/ui'
import { ArrowLeft, Mail } from 'lucide-react'
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
		defaultValues: { email: '' }
	})

	const onSubmit = async (data: ForgotFormValues) => {
		try {
			const { email } = data
			await requestForgotPassword({ email }).unwrap()
			toast.success('Đã gửi link đặt mật khẩu!')
			setUserEmail(email)
			setIsSubmitted(true)
		} catch (error: any) {
			const message = error?.data?.message || error?.error
			toast.error(message)
		}
	}

	const onResend = async () => {
		if (userEmail) await onSubmit({ email: userEmail })
	}

	return (
		<>
			<div className='flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-foreground'>
				<Card className='w-full max-w-md border-0 p-6 shadow-xl backdrop-blur'>
					{/* Back Button */}
					<Link
						to='/login'
						className='mb-4 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
					>
						<ArrowLeft size={18} className='mr-2' />
						Quay lại
					</Link>

					{/* Icon */}
					<div className='m-auto my-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 to-primary shadow-lg'>
						<Mail className='h-8 w-8 text-primary-foreground' />
					</div>

					<h2 className='mb-2 text-center text-xl font-semibold text-foreground'>Quên mật khẩu</h2>

					{!isSubmitted ? (
						<>
							<p className='mb-6 text-center text-sm text-muted-foreground'>
								Nhập email UIT của bạn để nhận link đặt lại mật khẩu
							</p>
							<FormProvider {...methods}>
								<form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
									<div className='space-y-2'>
										<label htmlFor='email' className='font-semibold text-foreground'>
											Email UIT
										</label>
										<FormInput<ForgotFormValues>
											name='email'
											placeholder='student@gm.uit.edu.vn'
											icon={<Mail size={18} className='text-muted-foreground' />}
											className='pl-10'
											rules={{ required: 'Email is required' }}
											control={methods.control}
										/>
									</div>

									<Button
										type='submit'
										className='h-12 w-full bg-gradient-to-br from-primary/80 to-primary font-medium text-primary-foreground hover:from-primary/90 hover:to-primary'
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
							<div className='mb-6 flex flex-col items-center space-y-2 rounded-lg bg-success/10 p-4 text-success'>
								<p className='text-center text-sm font-medium'>
									Vui lòng kiểm tra email <span className='font-semibold'>{userEmail}</span> và làm
									theo hướng dẫn.
								</p>
							</div>
							<div className='mb-6 flex w-full flex-col items-center space-y-2'>
								<p className='text-sm text-muted-foreground'>Không nhận được email?</p>
								<Button
									onClick={onResend}
									className='h-10 w-full bg-gradient-to-br from-primary/80 to-primary font-medium text-primary-foreground hover:from-primary/90 hover:to-primary'
									disabled={isLoading}
								>
									{isLoading ? 'Đang gửi...' : 'Gửi lại'}
								</Button>
							</div>
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

export { ForgotPassword }
