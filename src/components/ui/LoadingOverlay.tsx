import { Loader2 } from 'lucide-react'

export function LoadingOverlay({ text = 'Đang tải ...' }: { text?: string }) {
	return (
		<div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-40'>
			<Loader2 className='h-10 w-10 animate-spin text-slate-800' />
			<p className='text-center text-xl font-bold text-slate-800'>{text}</p>
		</div>
	)
}
