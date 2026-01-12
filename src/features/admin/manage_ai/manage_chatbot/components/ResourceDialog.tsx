import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/textarea'

import { useCreateResourceMutation, useUpdateResourceMutation } from '@/services/chatbotApi'
import type { ChatbotResource, ResourceType } from '@/models/chatbot-resource.model'

const formSchema = z.object({
	title: z.string().min(1, 'Tiêu đề không được để trống'),
	url: z
		.string()
		.optional()
		.refine((val) => !val || val === '' || /^https?:\/\/.+/.test(val), {
			message: 'URL không hợp lệ (phải bắt đầu bằng http:// hoặc https://)'
		}),
	type: z.enum(['url', 'file', 'text']),
	content: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

interface ResourceDialogProps {
	resource: ChatbotResource | null
	open: boolean
	onClose: () => void
}

const ResourceDialog = ({ resource, open, onClose }: ResourceDialogProps) => {
	const isEdit = !!resource?._id

	const [createResource, { isLoading: isCreating }] = useCreateResourceMutation()
	const [updateResource, { isLoading: isUpdating }] = useUpdateResourceMutation()

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
			url: '',
			type: 'url' as ResourceType,
			content: ''
		}
	})

	useEffect(() => {
		if (resource?._id) {
			form.reset({
				title: resource.title,
				url: resource.url || '',
				type: resource.type,
				content: resource.content || ''
			})
		} else {
			form.reset({
				title: '',
				url: '',
				type: 'url',
				content: ''
			})
		}
	}, [resource, form])

	const onSubmit = async (values: FormValues) => {
		try {
			if (isEdit) {
				await updateResource({ id: resource._id, data: values }).unwrap()
				toast.success('Cập nhật tài nguyên thành công')
			} else {
				await createResource(values).unwrap()
				toast.success('Thêm tài nguyên thành công. Hệ thống đang xử lý...')
			}
			onClose()
		} catch (error: any) {
			const errorMsg =
				error?.data?.message || (isEdit ? 'Cập nhật tài nguyên thất bại' : 'Thêm tài nguyên thất bại')
			toast.error(errorMsg)
		}
	}

	const watchType = form.watch('type')

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[600px]'>
				<DialogHeader>
					<DialogTitle>{isEdit ? 'Chỉnh sửa tài nguyên' : 'Thêm tài nguyên mới'}</DialogTitle>
					<DialogDescription>
						{isEdit
							? 'Cập nhật thông tin tài nguyên cho chatbot'
							: 'Thêm tài nguyên mới để huấn luyện chatbot RAG'}
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
						<FormField
							control={form.control}
							name='title'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tiêu đề</FormLabel>
									<FormControl>
										<Input placeholder='Nhập tiêu đề tài nguyên' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='type'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Loại tài nguyên</FormLabel>
									<Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder='Chọn loại tài nguyên' />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value='url'>URL (Website)</SelectItem>
											<SelectItem value='text'>Văn bản</SelectItem>
											<SelectItem value='file'>File (Coming soon)</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										{watchType === 'url' && 'Hệ thống sẽ tự động crawl nội dung từ URL'}
										{watchType === 'text' && 'Nhập trực tiếp nội dung văn bản'}
										{watchType === 'file' && 'Upload file PDF, DOCX, TXT (Sắp ra mắt)'}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{watchType === 'url' && (
							<FormField
								control={form.control}
								name='url'
								render={({ field }) => (
									<FormItem>
										<FormLabel>URL</FormLabel>
										<FormControl>
											<Input type='url' placeholder='https://example.com/page' {...field} />
										</FormControl>
										<FormDescription>
											Paste URL của trang web cần crawl. Hệ thống sẽ tự động trích xuất nội dung.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{watchType === 'text' && (
							<FormField
								control={form.control}
								name='content'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nội dung</FormLabel>
										<FormControl>
											<Textarea
												placeholder='Nhập nội dung văn bản...'
												className='min-h-[200px]'
												{...field}
											/>
										</FormControl>
										<FormDescription>Nhập nội dung văn bản trực tiếp vào đây</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						{watchType === 'file' && (
							<FormField
								control={form.control}
								name='content'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mô tả (Tùy chọn)</FormLabel>
										<FormControl>
											<Textarea placeholder='Mô tả ngắn về file...' {...field} />
										</FormControl>
										<FormDescription>
											Thêm mô tả về nội dung file để dễ quản lý. (Tính năng upload file sẽ sớm ra
											mắt)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
						<DialogFooter>
							<Button
								type='button'
								variant='outline'
								onClick={onClose}
								disabled={isCreating || isUpdating}
							>
								Hủy
							</Button>
							<Button type='submit' disabled={isCreating || isUpdating}>
								{isCreating || isUpdating ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}

export default ResourceDialog
