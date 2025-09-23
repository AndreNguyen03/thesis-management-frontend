import { useState } from 'react'
import { LockIcon, Eye, EyeOff } from 'lucide-react'
import { FormInput } from '@/components/ui'
import { type Control, type FieldValues, type Path } from 'react-hook-form'

type PasswordInputProps<T extends FieldValues> = {
	control: Control<T>
	name: Path<T>
	placeholder?: string
}

export function PasswordInput<T extends FieldValues>({ control, name, placeholder }: PasswordInputProps<T>) {
	const [showPassword, setShowPassword] = useState(false)

	return (
		<div className='relative flex flex-col'>
			<div className='relative'>
				<FormInput
					name={name}
					control={control}
					id={name}
					type={showPassword ? 'text' : 'password'}
					placeholder={placeholder !== null ? placeholder : 'Nhập mật khẩu'}
					icon={<LockIcon size={18} />}
					rules={{ required: 'Mật khẩu là bắt buộc' }}
				/>

				{/* nút show/hide password */}
				<button
					type='button'
					className='absolute right-3 top-0 flex h-full items-center justify-center px-1'
					onClick={() => setShowPassword(!showPassword)}
				>
					{showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
				</button>
			</div>
		</div>
	)
}
