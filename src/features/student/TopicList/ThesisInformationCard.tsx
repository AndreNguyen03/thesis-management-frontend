import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/Dialog'
import { Bookmark, BookmarkCheck, BookmarkIcon, Calendar, Eye, Loader2, Send, Star, Trash2, Users } from 'lucide-react'
import type { Thesis } from 'models/thesis.model'
import { useState } from 'react'
import { ConfirmRegistration } from './ConfirmRegistration'
type ThesisCardMode = 'all' | 'saved'

export const ThesisInformationCard: React.FC<{
	thesis: Thesis
	mode?: ThesisCardMode
	onRegister: () => void
	onSave: () => void
	onUnsave: () => void
	isSaved: boolean
	isSuccess: boolean
	isRegistering: boolean
	isRegistered: boolean
	isSaving?: boolean
	isUnsaving?: boolean
}> = ({
	thesis,
	mode = 'all',
	onRegister,
	onSave,
	onUnsave,
	isSuccess,
	isSaved,
	isRegistering,
	isRegistered,
	isSaving,
	isUnsaving,
}) => {
	const isFullSlot = thesis.maxStudents === thesis.registeredStudents
	const isDisabled = isFullSlot || isRegistered || isRegistering
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null)

	const getStatusBadge = () => {
		return (
			<div className='flex-2 flex-col'>
				{isFullSlot ? (
					<Badge variant='destructive'>Đã đủ</Badge>
				) : (
					<Badge variant='default'>{thesis.maxStudents - thesis.registeredStudents} chỗ trống</Badge>
				)}
				{isRegistered && <Badge variant='registered'>Đã đăng ký</Badge>}
			</div>
		)
	}

	const handleRegister = () => {
		if (isRegistering) return
		onRegister?.()
		setConfirmOpen(false)
	}
	const handleToggleSave = () => {
		if (isSaving || isUnsaving) return

		if (isSaved) {
			onUnsave?.()
		} else {
			onSave?.()
		}
	}
	const renderDialogActions = () => {
		switch (mode) {
			case 'saved':
				return (
					<div className='flex-2 flex justify-end gap-2'>
						<div
							onClick={() => handleToggleSave()}
							className='flex items-center justify-center rounded-full pl-1 pr-1 hover:cursor-pointer hover:bg-slate-100'
						>
							<Bookmark
								className={`h-6 w-6 border-gray-200 ${isSaved ? 'fill-yellow-400' : 'text-muted-foreground'}`}
							/>
						</div>
					</div>
				)
			default:
				return (
					<div className='flex flex-1 justify-end gap-2'>
						<div
							onClick={() => handleToggleSave()}
							className='flex items-center justify-center rounded-full pl-1 pr-1 hover:cursor-pointer hover:bg-slate-100'
						>
							<Bookmark
								className={`h-6 w-6 border-gray-200 ${isSaved ? 'fill-yellow-400' : 'text-muted-foreground'}`}
							/>
						</div>
						<>
							{!isRegistered && (
								<Button
									disabled={isDisabled}
									variant={isSuccess ? 'success' : 'delete'}
									onClick={() => setConfirmOpen(true)}
								>
									{isRegistering ? (
										<>
											<Loader2 className='mr-2 h-8 w-8 animate-spin' />
											Đang đăng kí...
										</>
									) : isSuccess ? (
										'Đã đăng ký'
									) : (
										<>
											<Send className='mr-2 h-4 w-4' />
											Đăng ký
										</>
									)}
								</Button>
							)}
						</>
					</div>
				)
		}
	}

	const renderDepartmentAndLecturers = () => {
		return (
			<CardDescription className='mt-1'>
				{thesis.registrationIds.length > 0
					? thesis.registrationIds
							.map((registrant) => {
								if (registrant.registrantId.role === 'lecturer') return registrant.registrantId.fullName
							})
							.join(', ')
					: 'Chưa có giảng viên'}
				• {thesis.department}
			</CardDescription>
		)
	}

	return (
		<Card key={thesis._id} className='transition-shadow hover:shadow-lg'>
			<CardHeader>
				<div className='flex items-start space-x-4'>
					<div>
						<CardTitle className='text-lg leading-tight'>{thesis.title}</CardTitle>
						{renderDepartmentAndLecturers()}
					</div>
					{getStatusBadge()}
				</div>
			</CardHeader>
			<CardContent className='space-y-4'>
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

				<div className='flex flex-col gap-2 sm:flex-row'>
					<Dialog>
						<DialogTrigger asChild>
							<Button
								className='flex-1'
								variant='outline'
								size='sm'
								onClick={() => setSelectedThesis(thesis)}
							>
								<Eye className='mr-2 h-4 w-4' />
								Chi tiết
							</Button>
						</DialogTrigger>
						<DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
							{selectedThesis && (
								<>
									<DialogHeader>
										<DialogTitle>{selectedThesis.title}</DialogTitle>
										<DialogDescription>{renderDepartmentAndLecturers()}</DialogDescription>
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
							onRegister={() => handleRegister()}
							onClose={() => setConfirmOpen(false)}
						/>
					</Dialog>
					{/* nút đăng ký nhanh */}
					{renderDialogActions()}
				</div>
			</CardContent>
		</Card>
	)
}
