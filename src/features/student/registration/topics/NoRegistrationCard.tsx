import type { RegistrationPhase } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import { FileQuestion, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PhaseType } from '@/models/period.model'

interface NoRegistrationCardProps {
	phase: PhaseType
}

export function NoRegistrationCard({ phase }: NoRegistrationCardProps) {
	const isOpen = phase === 'submit_topic'
	const Icon = isOpen ? FileQuestion : AlertCircle

	return (
		<Card className={cn('mx-auto max-w-lg', isOpen ? 'border-muted' : 'border-warning/30 bg-warning/5')}>
			<CardContent className='p-8 text-center'>
				<div className={cn('mx-auto mb-4 w-fit rounded-full p-4', isOpen ? 'bg-muted' : 'bg-warning/10')}>
					<Icon className={cn('h-10 w-10', isOpen ? 'text-muted-foreground' : 'text-warning')} />
				</div>

				<h3 className='mb-2 text-lg font-semibold text-foreground'>
					{isOpen ? 'Bạn chưa đăng ký đề tài nào' : 'Không có đề tài đã đăng ký'}
				</h3>

				<p className='text-sm text-muted-foreground'>
					{isOpen
						? 'Hãy chuyển sang tab "Danh sách đề tài" để xem và đăng ký đề tài phù hợp với bạn.'
						: 'Bạn chưa đăng ký đề tài nào trong đợt này hoặc đợt trước.'}
				</p>
			</CardContent>
		</Card>
	)
}
