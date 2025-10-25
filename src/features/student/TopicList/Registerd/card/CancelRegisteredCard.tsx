import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar, ChevronDown, ChevronUp, Eye, Loader2, Star, Users } from 'lucide-react'
import { useState } from 'react'
import type { Registration, ThesisInsideRegistration } from 'models'
import { ConfirmRegistration } from '../../ConfirmRegistration'
import { getRegistrationStatus } from '../../utils/registration'
import { useBreadcrumb } from '@/hooks/useBreadcrumb'
import path from 'path'

export const CancelRegisteredCard: React.FC<{
	registration: Registration
	onRegister?: () => void
	isRegistering: boolean
	isSuccess: boolean
	isRegistered: boolean
}> = ({ registration, onRegister, isRegistering, isSuccess, isRegistered }) => {
	const { thesis } = registration
	const isFullSlot = thesis.maxStudents === thesis.registeredStudents
	const isDisabled = isFullSlot || isRegistering

	const [confirmOpen, setConfirmOpen] = useState(false)
	const [selectedThesis] = useState<ThesisInsideRegistration | null>(null)

	const [openDetail, setOpenDetail] = useState(false)
	const getStatusBadge = (thesis: ThesisInsideRegistration) => {
		return (
			<>
				{isFullSlot ? (
					<Badge variant='destructive'>
						<p className='text-sm'>Đã đủ</p>
					</Badge>
				) : (
					<Badge variant='default'>
						<p className='text-sm'>{thesis.maxStudents - thesis.registeredStudents} chỗ trống</p>
					</Badge>
				)}
				{isRegistered && (
					<Badge variant='registered'>
						<p className='text-sm'>Đã đăng ký</p>
					</Badge>
				)}
				<Badge variant='outline' className='h-fit'>
					<p className='text-sm'>{new Date(registration.createdAt).toLocaleString('vi-VN')}</p>
				</Badge>
				<Badge variant='destructive' className='h-fit'>
					{getRegistrationStatus(registration.status)}
				</Badge>
			</>
		)
	}

	const handleRegister = () => {
		onRegister?.()
		setConfirmOpen(false)
	}
	const renderDialogActions = () => {
		return (
			<div className='flex flex-1 justify-end gap-2'>
				{!isFullSlot && !isRegistered && (
					<Button disabled={isDisabled} variant='re_register' onClick={() => setConfirmOpen(true)}>
						{isRegistering ? (
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
						) : isSuccess ? (
							<span>Đăng ký lại</span>
						) : (
							<span>Đăng ký lại</span>
						)}
					</Button>
				)}
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
		<Card key={registration._id} className={`border transition-shadow hover:cursor-pointer hover:shadow-lg`}>
			<CardHeader onClick={() => setOpenDetail(!openDetail)}>
				<div className='flex items-start space-x-4'>
					<div>
						<CardTitle className='text-lg leading-tight'>{registration.thesis.title}</CardTitle>
						{renderDepartmentAndLecturers(registration.thesis)}
					</div>
					{getStatusBadge(registration.thesis)}
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
							<Badge variant='outline' className='h-fit'>
								<Calendar className='mr-1 h-4 w-4' />
								<p className='text-sm'>Hạn đăng ký:</p>
							</Badge>
							<Badge variant='outline' className='h-fit'>
								<p className='text-sm'>{new Date(thesis.deadline).toLocaleDateString('vi-VN')}</p>
							</Badge>
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
							<ConfirmRegistration
								isRegistering={isRegistering}
								onRegister={handleRegister}
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
