// Introduction.tsx
import { Heart } from 'lucide-react'

export const Introduction = ({ text }: { text?: string }) => (
	<div className='rounded-lg bg-white p-4 shadow'>
		<div className='mb-3 flex items-center gap-2'>
			<Heart className='h-5 w-5 text-red-500' />
			<h3 className='text-lg font-semibold'>Giới thiệu bản thân</h3>
		</div>
		<p className='leading-relaxed text-gray-600'>{text || 'Chưa có'}</p>
	</div>
)
