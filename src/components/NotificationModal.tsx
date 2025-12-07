// src/components/modals/SendNotificationModal.tsx (Phiên bản Tối Giản Cuối Cùng)

import React, { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CalendarIcon, Send } from 'lucide-react'

// Import từ file types.ts đã được sửa đổi
import type { RecipientMode, SendData } from './types'
import { RECIPIENT_OPTIONS } from './types'
import RecipientSelector from './RecipientSelector' // Giả định đường dẫn chính xác
import RichTextEditor from './common/RichTextEditor'
import type { ResponseMiniLecturerDto } from '@/models'
import { toast } from '@/hooks/use-toast'

// --- SCHEMA VALIDATION (Loại bỏ templateId) ---
const notificationSchema = z
	.object({
		// Cập nhật enum để chỉ sử dụng 3 tùy chọn mới
		recipientMode: z.enum(['custom-instructors', 'all-instructors', 'all-students'], {
			message: 'Vui lòng chọn kiểu người nhận hợp lệ.'
		}),
		recipients: z.array(z.string()).optional(),
		subject: z.string().min(1, 'Tiêu đề email là bắt buộc.'),
		content: z.string().min(1, 'Nội dung email là bắt buộc.')
	})
	.superRefine((data, ctx) => {
		// Logic Validation Người nhận: Chỉ bắt buộc nếu là 'custom-instructors'
		if (data.recipientMode === 'custom-instructors' && (!data.recipients || data.recipients.length === 0)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Vui lòng chọn ít nhất một giảng viên.',
				path: ['recipients']
			})
		}
	})

type NotificationFormValues = z.infer<typeof notificationSchema>
interface SendNotificationModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (data: SendData) => Promise<void>
	totalStudents: number
	totalLecturers: number
	availableLecturers: ResponseMiniLecturerDto[]
}
export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	totalStudents,
	totalLecturers,
	availableLecturers
}) => {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const methods = useForm<NotificationFormValues>({
		resolver: zodResolver(notificationSchema),
		defaultValues: {
			recipientMode: 'all-students',
			recipients: [],
			subject: '',
			content: ''
		}
	})

	const { handleSubmit, reset, watch } = methods

	// Xử lý gửi form (Luôn là Tùy chỉnh/Thủ công)
	const onSubmitHandler = async (values: NotificationFormValues) => {
		setIsSubmitting(true)
		try {
			const data: SendData = {
				recipientMode: values.recipientMode,
				recipients: values.recipients || [],
				subject: values.subject,
				content: values.content
			}

			await onSubmit(data)
		} catch (error) {
			toast({
				title: `Đã có lỗi xảy ra`,
				description: `Lỗi ${error}`
			})
		} finally {
			setIsSubmitting(false)
			reset()
			onClose()
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[700px]'>
				<DialogHeader>
					<DialogTitle>Gửi Thông Báo Thủ Công</DialogTitle>
					<DialogDescription>Soạn nội dung để gửi ngay lập tức đến người nhận được chọn.</DialogDescription>
				</DialogHeader>

				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmitHandler)} className='space-y-6'>
						{/* 1. Chọn người nhận (Radio Group) */}
						<FormField
							control={methods.control}
							name='recipientMode'
							render={({ field }) => (
								<FormItem className='space-y-3'>
									<FormLabel className='text-base font-semibold'>1. Chọn người nhận</FormLabel>
									<FormControl>
										<RadioGroup
											onValueChange={(value: RecipientMode) => {
												field.onChange(value)
												// Reset recipients khi chuyển sang All
												if (value !== 'custom-instructors') {
													methods.setValue('recipients', [])
												}
											}}
											defaultValue={field.value}
											className='flex flex-col space-y-1'
										>
											{/* SỬ DỤNG RECIPIENT_OPTIONS ĐÃ SỬA */}
											{RECIPIENT_OPTIONS.map((option) => (
												<FormItem
													key={option.value}
													className='flex items-center space-x-3 space-y-0'
												>
													<FormControl>
														<RadioGroupItem value={option.value} />
													</FormControl>
													<FormLabel className='font-normal'>{option.label}</FormLabel>
												</FormItem>
											))}
										</RadioGroup>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<hr />

						{/* 2. Danh sách người nhận (Component Selector) */}
						<RecipientSelector
							recipientMode={watch('recipientMode')}
							totalStudents={totalStudents}
							totalLecturers={totalLecturers}
							availableLecturers={availableLecturers}
						/>

						<hr />

						{/* 3. Soạn nội dung email (Đây là phần chính) */}
						<div className='space-y-4'>
							<h3 className='text-base font-semibold'>2. Soạn nội dung email</h3>
							<FormField
								control={methods.control}
								name='subject'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tiêu đề email</FormLabel>
										<FormControl>
											<Input
												placeholder='Nhập tiêu đề...'
												{...field}
												className='border-gray-400 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500'
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={methods.control}
								name='content'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nội dung email (HTML)</FormLabel>
										<FormControl>
											<RichTextEditor
												value={field.value}
												onChange={field.onChange}
												placeholder='Nhập nội dung email chi tiết ở đây...'
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<DialogFooter className='flex items-center space-x-2 pt-4 sm:justify-end'>
							<Button type='button' variant='ghost' onClick={onClose} disabled={isSubmitting}>
								Hủy
							</Button>
							<Button type='submit' disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<CalendarIcon className='mr-2 h-4 w-4 animate-spin' /> Đang gửi...
									</>
								) : (
									<>
										<Send className='mr-2 h-4 w-4' /> Gửi
									</>
								)}
							</Button>
						</DialogFooter>
					</form>
				</FormProvider>
			</DialogContent>
		</Dialog>
	)
}
