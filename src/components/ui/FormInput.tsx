import { cn } from '@/utils/utils'
import { useController, type Control, type FieldValues, type Path, type RegisterOptions } from 'react-hook-form'

interface InputProps<T extends FieldValues>
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'name'> {
	name: Path<T>
	control: Control<T>
	rules?: RegisterOptions<T>
	icon?: React.ReactNode
}

export function FormInput<T extends FieldValues>({ name, control, rules, icon, className, ...props }: InputProps<T>) {
	const {
		field,
		fieldState: { error }
	} = useController({ name, control, rules })

	return (
		<div className='relative flex items-center'>
			{/* Error tooltip / chú thích bên trái */}
			{error && (
				<>
					<div className='absolute -left-2 inline-flex -translate-x-full items-center whitespace-nowrap rounded bg-red-400 px-3 py-2 text-xs text-white shadow-md'>
						{error.message}
					</div>
					<span className='absolute -left-3 border-b-[10px] border-l-[13px] border-t-[10px] border-b-transparent border-l-red-400 border-t-transparent'></span>
				</>
			)}
			<div
				className={cn(
					'relative flex flex-1 items-center rounded-lg border px-3 py-2 transition-all duration-150 focus-within:ring-2',
					error ? 'border-red-500 focus-within:ring-red-500' : 'border-gray-300 focus-within:ring-primary'
				)}
			>
				{icon && <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>{icon}</span>}

				<input
					{...field}
					{...props}
					className={cn('w-full bg-background pl-8 text-foreground focus:outline-none', className)}
				/>
			</div>
		</div>
	)
}
