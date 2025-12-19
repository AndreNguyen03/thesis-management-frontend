import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Calendar, Users, Loader2, X, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import type { GeneralTopic } from '@/models'
import type { PhaseType } from '@/models/period.model'

interface RegisteredTopicCardProps {
	registeredTopic: GeneralTopic
	phase: PhaseType
	onCancel: () => void
	isCancelling?: boolean
}

export function RegisteredTopicCard({ registeredTopic, phase, onCancel, isCancelling }: RegisteredTopicCardProps) {
	const canCancel = phase === 'open_registration'

	return (
		<Card className='mx-auto max-w-2xl border-success/30 bg-success/5 transition-all hover:shadow-md'>
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<CheckCircle2 className='h-5 w-5 text-success' />
						<Badge className='bg-success/10 text-success'>Đã đăng ký</Badge>
					</div>
				</div>

				<h2 className='mt-3 text-lg font-semibold'>{registeredTopic.titleVN}</h2>
			</CardHeader>

			<CardContent className='space-y-4'>
				{/* Lecturer */}
				<div className='flex items-center gap-3'>
					<Avatar className='h-9 w-9'>
						<AvatarImage src={registeredTopic.lecturers[0]?.avatarUrl} />
						<AvatarFallback>{registeredTopic.lecturers[0]?.fullName?.[0]}</AvatarFallback>
					</Avatar>

					<div>
						<p className='font-medium'>{registeredTopic.lecturers[0]?.fullName}</p>
						<p className='text-xs text-muted-foreground'>{registeredTopic.major?.name}</p>
					</div>
				</div>

				<Separator />

				{/* Meta */}
				<div className='grid grid-cols-2 gap-3 text-sm'>
					<div className='flex items-center gap-2'>
						<Users className='h-4 w-4' />
						<span>
							{registeredTopic.studentsNum}/{registeredTopic.maxStudents} sinh viên
						</span>
					</div>

					<div className='flex items-center gap-2'>
						<Calendar className='h-4 w-4' />
						<span>{format(new Date(registeredTopic.updatedAt), 'dd/MM/yyyy')}</span>
					</div>
				</div>

				<Separator />

				{/* Description */}
				<div className='space-y-1'>
					<div className='flex items-center gap-2 text-sm font-medium'>
						<BookOpen className='h-4 w-4' />
						<span>Mô tả</span>
					</div>

					<p className='line-clamp-3 text-sm text-muted-foreground'>{registeredTopic.description}</p>
				</div>

				{/* Requirements */}
				<div className='flex flex-wrap gap-1.5'>
					{registeredTopic.requirements.map((r) => (
						<Badge key={r._id} variant='secondary'>
							{r.name}
						</Badge>
					))}
				</div>
			</CardContent>

			{canCancel && (
				<CardFooter>
					<Button
						variant='outline'
						className='w-full border-destructive text-destructive'
						onClick={onCancel}
						disabled={isCancelling}
					>
						{isCancelling ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Đang hủy...
							</>
						) : (
							<>
								<X className='mr-2 h-4 w-4' />
								Hủy đăng ký
							</>
						)}
					</Button>
				</CardFooter>
			)}
		</Card>
	)
}
