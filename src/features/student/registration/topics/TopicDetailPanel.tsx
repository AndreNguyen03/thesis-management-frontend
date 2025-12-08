import type { Topic } from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Users, AlertTriangle, BookOpen, Code, GraduationCap, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopicDetailPanelProps {
	topic: Topic | null
	isOpen: boolean
	onClose: () => void
	onRegister: () => void
	isRegistering?: boolean
	disabled?: boolean
	isRegistered?: boolean
}

export function TopicDetailPanel({
	topic,
	isOpen,
	onClose,
	onRegister,
	isRegistering,
	disabled,
	isRegistered
}: TopicDetailPanelProps) {
	if (!topic) return null

	const remainingSlots = topic.maxSlots - topic.currentSlots

	const slotColor = topic.status === 'full' ? 'text-destructive' : 'text-success'

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<SheetContent side='right' className='w-full border-l border-border bg-card p-0 sm:max-w-lg'>
				<SheetHeader className='p-6 pb-0'>
					<div className='flex items-start justify-between gap-4'>
						<SheetTitle className='text-left text-xl font-bold leading-tight'>{topic.title}</SheetTitle>
					</div>
				</SheetHeader>

				<ScrollArea className='h-[calc(100vh-200px)] px-6'>
					<div className='space-y-6 py-6'>
						{/* Advisor Section */}
						<div className='flex items-center gap-3 rounded-lg bg-muted/50 p-4'>
							<Avatar className='h-12 w-12'>
								<AvatarImage src={topic.advisor.avatar} alt={topic.advisor.name} />
								<AvatarFallback>{topic.advisor.name.slice(0, 2)}</AvatarFallback>
							</Avatar>
							<div>
								<p className='font-medium text-foreground'>{topic.advisor.name}</p>
								<p className='text-sm text-muted-foreground'>{topic.advisor.department}</p>
							</div>
						</div>

						{/* Slots */}
						<div
							className={cn(
								'flex items-center gap-3 rounded-lg p-4',
								topic.status === 'full' ? 'bg-destructive/10' : 'bg-success/10'
							)}
						>
							{topic.status === 'full' ? (
								<AlertTriangle className={cn('h-6 w-6', slotColor)} />
							) : (
								<Users className={cn('h-6 w-6', slotColor)} />
							)}
							<div>
								<p className={cn('font-semibold', slotColor)}>
									{remainingSlots === 0
										? 'Đã hết slot đăng ký'
										: remainingSlots === 1
											? 'Chỉ còn 1 slot cuối cùng!'
											: `Còn ${remainingSlots} slot trống`}
								</p>
								<p className='text-sm text-muted-foreground'>
									{topic.currentSlots}/{topic.maxSlots} sinh viên đã đăng ký
								</p>
							</div>
						</div>

						<Separator />

						{/* Description */}
						<div className='space-y-3'>
							<div className='flex items-center gap-2 text-foreground'>
								<BookOpen className='h-5 w-5' />
								<h4 className='font-semibold'>Mô tả đề tài</h4>
							</div>
							<p className='leading-relaxed text-muted-foreground'>{topic.description}</p>
						</div>

						<Separator />

						{/* Field */}
						<div className='space-y-3'>
							<div className='flex items-center gap-2 text-foreground'>
								<GraduationCap className='h-5 w-5' />
								<h4 className='font-semibold'>Lĩnh vực</h4>
							</div>
							<Badge variant='outline' className='font-normal'>
								{topic.field}
							</Badge>
						</div>

						<Separator />

						{/* Skills */}
						<div className='space-y-3'>
							<div className='flex items-center gap-2 text-foreground'>
								<Code className='h-5 w-5' />
								<h4 className='font-semibold'>Kỹ năng yêu cầu</h4>
							</div>
							<div className='flex flex-wrap gap-2'>
								{topic.requirements.map((requirement) => (
									<Badge key={requirement} variant='secondary' className='font-normal'>
										{requirement}
									</Badge>
								))}
							</div>
						</div>

						<Separator />
						{/* Registered Students */}
						{topic.registeredStudents && topic.registeredStudents.length > 0 && (
							<div className='space-y-3'>
								<div className='flex items-center gap-2 text-foreground'>
									<Users className='h-5 w-5' />
									<h4 className='font-semibold'>Sinh viên đã đăng ký</h4>
								</div>

								<div className='space-y-3'>
									{topic.registeredStudents.map((student) => (
										<div
											key={student.id}
											className='flex items-center gap-3 rounded-md border border-border p-3'
										>
											<div className='flex flex-col'>
												<span className='font-medium'>{student.fullName}</span>
												<span className='text-sm text-muted-foreground'>{student.email}</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</ScrollArea>

				{/* Fixed bottom action */}
				<div className='absolute bottom-0 left-0 right-0 border-t border-border bg-card p-6'>
					{isRegistered ? (
						<div className='flex items-center justify-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-success'>
							<CheckCircle2 className='h-5 w-5' />
							<span className='font-medium'>Bạn đã đăng ký đề tài này</span>
						</div>
					) : (
						<Button
							size='lg'
							className='w-full'
							disabled={topic.status === 'full' || isRegistering || disabled}
							onClick={onRegister}
						>
							{isRegistering ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Đang xử lý...
								</>
							) : topic.status === 'full' ? (
								'Đã hết slot đăng ký'
							) : disabled ? (
								'Hủy đề tài hiện tại để đăng ký'
							) : (
								'Đăng ký đề tài này'
							)}
						</Button>
					)}
				</div>
			</SheetContent>
		</Sheet>
	)
}
