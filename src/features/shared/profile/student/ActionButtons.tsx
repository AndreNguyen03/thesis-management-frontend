import { Mail, BookOpen } from 'lucide-react'

export const ActionButtons = ({ email }: { email: string }) => (
	<div className='space-y-3 rounded-lg bg-white p-4 shadow'>
		<button
			className='flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700'
			onClick={() => (window.location.href = `mailto:${email}`)}
		>
			<Mail className='h-4 w-4' /> Gửi email
		</button>
		<button className='flex w-full items-center justify-center gap-2 rounded border border-gray-300 px-4 py-2 transition hover:bg-gray-100'>
			<BookOpen className='h-4 w-4' /> Xem đề tài phù hợp
		</button>
	</div>
)
