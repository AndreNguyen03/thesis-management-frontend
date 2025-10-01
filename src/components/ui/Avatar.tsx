import { getInitials } from '../../utils/utils'

export function Avatar({ name, src }: { name: string; src?: string }) {
	return (
		<div className='flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-2xl font-bold'>
			{src ? <img src={src} alt={name} className='h-full w-full object-cover' /> : getInitials(name)}
		</div>
	)
}
