import { Button, FormInput } from '@/components/ui'
import { MailIcon } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { PasswordInput } from './PasswordInput'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../../../services/authApi'
import { getDeviceInfo } from '@/utils/utils'
import type { ApiError } from '@/models/api'
import { toast } from 'react-toastify'

type LoginFormValues = {
	email: string
	password: string
}

function LoginForm() {
	const [login, { isLoading }] = useLoginMutation()
	const deviceInfo = getDeviceInfo()
	const navigate = useNavigate()

	const methods = useForm<LoginFormValues>({
		defaultValues: {
			email: '',
			password: ''
		}
	})

	const onSubmit = async (data: LoginFormValues) => {
		try {
			const { email, password } = data

			await login({ email, password, deviceInfo }).unwrap()
			toast.success('Đăng nhập thành công!')
			navigate('/dashboard')
		} catch (err) {
			const error = err as ApiError
			console.log('Login error:', error)
			methods.setValue('password', '')

			toast.error(error?.data?.message || 'Đăng nhập thất bại')
		}
	}

	return (
		<FormProvider {...methods}>
			<form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-4'>
				{/* Email Field */}
				<div className='space-y-2'>
					<label htmlFor='email' className='font-semibold'>
						Email UIT
					</label>
					<FormInput<LoginFormValues>
						name='email'
						icon={<MailIcon size={18} />}
						placeholder='student@gm.uit.edu.vn'
						rules={{ required: 'Email is required' }}
						control={methods.control}
					/>
				</div>

				{/* Password Field */}
				<div className='space-y-2'>
					<label htmlFor='password' className='font-semibold'>
						Mật khẩu
					</label>
					<PasswordInput<LoginFormValues> name='password' control={methods.control} />
				</div>

				{/* Forgot Password */}
				<div className='text-right'>
					<Link to='/forgot-password' className='text-sm text-primary hover:underline'>
						Quên mật khẩu?
					</Link>
				</div>

				{/* Login Button */}
				<Button
					type='submit'
					className='w-full bg-gradient-primary hover:bg-primary-hover'
					disabled={isLoading}
				>
					{isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
				</Button>
			</form>
		</FormProvider>
	)
}

export { LoginForm }
