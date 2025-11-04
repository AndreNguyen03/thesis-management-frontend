import { cn } from "@/lib/utils"

interface ProfileFieldProps {
	label: string
	value?: string
	type?: 'text' | 'email' | 'textarea' | 'select'
	readOnly?: boolean
	onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
	variant?: 'base' | 'medium' | 'large'
	orientation?: 'row' | 'column'
}

export const ProfileField = ({
	label,
	value = '',
	type = 'text',
	readOnly = false,
	onChange,
	variant = 'base',
	orientation = 'row'
}: ProfileFieldProps) => {
	return (
		<div className={cn(orientation === 'row' ? 'mb-3 flex items-center' : 'mb-3 flex flex-col')}>
			<label className={cn('mb-1 font-medium', orientation === 'row' ? 'basis-32' : '')}>{label}</label>

			{type === 'textarea' ? (
				<textarea
					className={cn(
						'rounded-md border px-3 py-2',
						variant === 'large' && 'min-h-[100px] w-full',
						variant === 'medium' && 'w-full',
						variant === 'base' && 'w-full'
					)}
					value={value}
					onChange={onChange}
					readOnly={readOnly}
					disabled={readOnly}
				/>
			) : (
				<input
					type={type}
					className={cn(
						'rounded-md border px-3 py-2',
						variant === 'large' && 'w-full',
						variant === 'medium' && 'w-full',
						variant === 'base' && 'w-full'
					)}
					value={value}
					onChange={onChange}
					readOnly={readOnly}
					disabled={readOnly}
				/>
			)}
		</div>
	)
}
