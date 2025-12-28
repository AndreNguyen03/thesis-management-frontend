import { Sparkles } from 'lucide-react'

interface RecommendationButtonProps {
	onClick: () => void
	isOpen: boolean
}

export function RecommendationButton({ onClick, isOpen }: RecommendationButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`fixed right-6 top-40 z-30 flex h-10 px-4 w-fit items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary/80 to-primary/70 text-primary-foreground shadow-lg ring-1 ring-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:ring-primary/40 active:scale-95 active:shadow-md ${isOpen ? 'pointer-events-none opacity-0' : 'opacity-100'} `}
		>
			{/* Notification Dot */}
			<span className='absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-primary-foreground bg-destructive' />

			<span className='relative z-10 text-xs font-medium'>Gợi ý cho bạn</span>
			<Sparkles className='relative z-10 h-4 w-4' />
		</button>
	)
}
