import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/Dialog'
import { Calendar, ChevronDown, ChevronUp, Eye, Loader2, Send, Star, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import type { Registration, ThesisInsideRegistration } from 'models'
import { ConfirmCancelRegistration } from '../ConfirmCancelRegistration'

export const ThesisRegisteredCard: React.FC<{
	registration: Registration
	onRegister?: () => void
	onUnregister: () => void
	isSaved?: boolean
	isSaving?: boolean
	isSuccess: boolean
	isCanceling: boolean
}> = ({ registration, onRegister, onUnregister, isSaving, isSuccess, isSaved, isCanceling }) => {
	const { thesis } = registration
	const isFullSlot = thesis.maxStudents === thesis.registeredStudents
	const isDisabled = isFullSlot || isCanceling

	const [confirmOpen, setConfirmOpen] = useState(false)
	const [selectedThesis] = useState<ThesisInsideRegistration | null>(null)

	const [openDetail, setOpenDetail] = useState(false)
	const getStatusBadge = (thesis: ThesisInsideRegistration) => {
		return (
			<div>
				{isFullSlot ? (
					<Badge variant='destructive'>Đã đủ</Badge>
				) : (
					<Badge variant='default'>{thesis.maxStudents - thesis.registeredStudents} chỗ trống</Badge>
				)}
			</div>
		)
	}

	const handleUnRegister = () => {
		onUnregister?.()
		setConfirmOpen(false)
	}
	const renderDialogActions = () => {
		return (
			<div className='flex flex-1 justify-end gap-2'>
				<Button disabled={isDisabled} variant={isSuccess ? 'success' : 'delete'} onClick={onUnregister}>
					{isCanceling ? (
						<Loader2 className='mr-2 h-4 w-4 animate-spin' />
					) : isSuccess ? (
						'Đã xóa'
					) : (
						<>
							<Trash2 className='mr-2 h-4 w-4' />
							'Hủy đăng ký'
						</>
					)}
				</Button>
			</div>
		)
	}
	const renderDepartmentAndLecturers = (thesis: ThesisInsideRegistration) => {
		return (
			<CardDescription className='mt-1'>
				{thesis.registrationIds.length > 0
					? thesis.registrationIds
							.map((reg) => {
								if (reg.registrantId.role === 'lecturer') {
									return reg.registrantId.fullName
								}
							})
							.join(', ')
					: 'Chưa có giảng viên'}
				• {thesis.department}
			</CardDescription>
		)
	}

	return (
		<Card key={registration._id} className={`transition-shadow hover:cursor-pointer hover:shadow-lg`}>
			<CardHeader onClick={() => setOpenDetail(!openDetail)}>
				<div className='flex items-start space-x-4'>
					<div>
						<CardTitle className='text-lg leading-tight'>{registration.thesis.title}</CardTitle>
						{renderDepartmentAndLecturers(registration.thesis)}
					</div>
					{getStatusBadge(registration.thesis)}
					<Badge variant='outline' className='h-fit'>
						{new Date(registration.createdAt).toLocaleString('vi-VN')}
					</Badge>
				</div>
				<div className='justify-items-center'>
					<div className='p-0.5 px-5 hover:bg-muted' onClick={() => setOpenDetail(!openDetail)}>
						{openDetail ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
					</div>
				</div>
			</CardHeader>

			{openDetail && (
				<CardContent className={`space-y-4`}>
					<p className='line-clamp-3 text-sm text-muted-foreground'>{thesis.description}</p>
					<div className='space-y-2'>
						<div className='flex items-center gap-4 text-sm text-muted-foreground'>
							<div className='flex items-center gap-1'>
								<Users className='h-4 w-4' />
								{thesis.registeredStudents}/{thesis.maxStudents}
							</div>
							<div className='flex items-center gap-1'>
								<Star className='h-4 w-4' />
								{thesis.rating}
							</div>
							<div className='flex items-center gap-1'>
								<Eye className='h-4 w-4' />
								{thesis.views}
							</div>
						</div>

						<div className='flex items-center gap-1 text-sm text-muted-foreground'>
							<Calendar className='h-4 w-4' />
							Hạn đăng ký: {new Date(thesis.deadline).toLocaleDateString('vi-VN')}
						</div>
					</div>

					<div className='flex flex-wrap gap-1'>
						{thesis.requirements.slice(0, 4).map((req: string) => (
							<Badge key={req} variant='secondary' className='text-xs'>
								{req}
							</Badge>
						))}
						{thesis.requirements.length > 4 && (
							<Badge variant='outline' className='text-xs'>
								+{thesis.requirements.length - 4}
							</Badge>
						)}
					</div>

					<div className='flex gap-2'>
						<Dialog>
							<DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
								{selectedThesis && (
									<>
										<DialogHeader>
											<DialogTitle>{selectedThesis.title}</DialogTitle>
											<DialogDescription>
												{renderDepartmentAndLecturers(selectedThesis)}
											</DialogDescription>
										</DialogHeader>
										<div className='space-y-4'>
											<div>
												<h4 className='mb-2 font-medium'>Mô tả chi tiết</h4>
												<p className='text-sm text-muted-foreground'>
													{selectedThesis.description}
												</p>
											</div>

											<div>
												<h4 className='mb-2 font-medium'>Yêu cầu kỹ năng</h4>
												<div className='flex flex-wrap gap-2'>
													{selectedThesis.requirements.map((req: string) => (
														<Badge key={req} variant='secondary'>
															{req}
														</Badge>
													))}
												</div>
											</div>

											<div className='grid grid-cols-2 gap-4 text-sm'>
												<div>
													<span className='font-medium'>Lĩnh vực:</span>
													<p className='text-muted-foreground'>{selectedThesis.field}</p>
												</div>
												<div>
													<span className='font-medium'>Số lượng SV:</span>
													<p className='text-muted-foreground'>
														{selectedThesis.registeredStudents}/{selectedThesis.maxStudents}
													</p>
												</div>
											</div>
										</div>
									</>
								)}
							</DialogContent>
						</Dialog>

						{/* dialog xác nhận */}
						<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
							<ConfirmCancelRegistration
								isCanceling={isCanceling}
								onUnRegister={() => handleUnRegister()}
								onClose={() => setConfirmOpen(false)}
							/>
						</Dialog>
						{/* nút đăng ký nhanh */}
						{renderDialogActions()}
					</div>
				</CardContent>
			)}
		</Card>
	)
}
