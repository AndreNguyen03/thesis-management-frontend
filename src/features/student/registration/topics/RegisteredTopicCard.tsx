import type { RegisteredTopic, RegistrationPhase } from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Calendar, Users, Code, GraduationCap, Loader2, X, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface RegisteredTopicCardProps {
	registeredTopic: RegisteredTopic
	phase: RegistrationPhase
	onCancel: () => void
	isCancelling?: boolean
}

export function RegisteredTopicCard({ registeredTopic, phase, onCancel, isCancelling }: RegisteredTopicCardProps) {
	const { topic, registeredAt } = registeredTopic
	const canCancel = phase === 'open'

	return (
		<Card className='mx-auto max-w-2xl border-success/30 bg-success/5 transition-all hover:shadow-md'>
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<CheckCircle2 className='h-5 w-5 text-success' />
						<Badge className='bg-success/10 text-success'>Đã đăng ký</Badge>
					</div>

					<div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
						<Calendar className='h-3.5 w-3.5' />
						<span>{format(registeredAt, "HH:mm 'ngày' dd/MM/yyyy", { locale: vi })}</span>
					</div>
				</div>

				<h2 className='mt-3 text-lg font-semibold text-foreground'>{topic.title}</h2>
			</CardHeader>

			<CardContent className='space-y-4'>
				{/* General info row */}
				<div className='flex flex-col gap-3 rounded-lg bg-muted/50 p-3'>
					{/* Advisor */}
					<div className='flex items-center gap-3'>
						<Avatar className='h-9 w-9'>
							<AvatarImage src={topic.advisor.avatar ?? undefined} />
							<AvatarFallback>{topic.advisor.name.split(' ').pop()?.[0]}</AvatarFallback>
						</Avatar>

						<div>
							<p className='font-medium'>{topic.advisor.name}</p>
							<p className='text-xs text-muted-foreground'>{topic.advisor.department}</p>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-3 text-sm'>
						<div className='flex items-center gap-2'>
							<GraduationCap className='h-4 w-4 text-muted-foreground' />
							<span className='text-muted-foreground'>{topic.field}</span>
						</div>

						<div className='flex items-center gap-2'>
							<Users className='h-4 w-4 text-muted-foreground' />
							<span className='text-muted-foreground'>
								{topic.currentSlots}/{topic.maxSlots} sinh viên
							</span>
						</div>
					</div>
				</div>

				<Separator />

				{/* Students in topic */}
				<div className='space-y-2'>
					<div className='flex items-center justify-between'>
						<span className='text-sm font-medium'>Sinh viên đã đăng ký</span>
						<span className='text-xs text-muted-foreground'>{topic.registeredStudents.length} người</span>
					</div>

					<div className='grid grid-cols-2 grid-rows-2 gap-2'>
						{topic.registeredStudents.slice(0, 4).map((s) => (
							<div key={s.email} className='flex flex-col'>
								<span className='text-sm font-medium text-foreground'>{s.fullName}</span>
								<span className='text-xs text-muted-foreground'>{s.email}</span>
							</div>
						))}

						{topic.registeredStudents.length === 0 && (
							<span className='col-span-2 text-xs text-muted-foreground'>Chưa có ai đăng ký</span>
						)}
					</div>
				</div>

				<Separator />

				{/* Description */}
				<div className='space-y-1'>
					<div className='flex items-center gap-2 text-sm font-medium'>
						<BookOpen className='h-4 w-4' />
						<span>Mô tả</span>
					</div>

					<p className='line-clamp-3 text-sm text-muted-foreground'>{topic.description}</p>
				</div>

				{/* Skills */}
				<div className='space-y-1'>
					<div className='flex items-center gap-2 text-sm font-medium'>
						<Code className='h-4 w-4' />
						<span>Kỹ năng yêu cầu</span>
					</div>

					<div className='flex flex-wrap gap-1.5'>
						{topic.requirements.map((r) => (
							<Badge key={r} variant='secondary' className='font-normal'>
								{r}
							</Badge>
						))}
					</div>
				</div>
			</CardContent>

			{canCancel && (
				<CardFooter className='pt-2'>
					<Button
						variant='outline'
						className='w-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive'
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
