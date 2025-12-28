import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2, Save } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

import {
	useGetChatbotVersionQuery,
	useUpdateChatbotVersionMutation,
	useCreateQuerySuggestionMutation,
	useUpdateQuerySuggestionMutation,
	useDeleteQuerySuggestionMutation
} from '@/services/chatbotApi'
import type { GetChatbotVerDto, GetQuerySuggestionDto } from '@/models/chatbot-version'

const formSchema = z.object({
	name: z.string().min(1, 'Tên không được để trống'),
	description: z.string().min(1, 'Mô tả không được để trống'),
	status: z.enum(['ENABLED', 'DISABLED'])
})

type FormValues = z.infer<typeof formSchema>

const ChatbotConfig = () => {
	const { data: config, isLoading } = useGetChatbotVersionQuery()
	const [updateConfig, { isLoading: isUpdating }] = useUpdateChatbotVersionMutation()
	const [createSuggestion, { isLoading: isCreating }] = useCreateQuerySuggestionMutation()
	const [updateSuggestion] = useUpdateQuerySuggestionMutation()
	const [deleteSuggestion] = useDeleteQuerySuggestionMutation()

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			description: '',
			status: 'ENABLED'
		}
	})

	useEffect(() => {
		if (config) {
			form.reset({
				name: config.name,
				description: config.description,
				status: config.status as 'ENABLED' | 'DISABLED'
			})
		}
	}, [config, form])

	const onSubmit = async (values: FormValues) => {
		try {
			await updateConfig(values).unwrap()
			toast.success('Cập nhật cấu hình thành công')
		} catch (error) {
			toast.error('Cập nhật cấu hình thất bại')
		}
	}

	const handleAddSuggestion = async () => {
		const content = prompt('Nhập nội dung câu hỏi gợi ý:')
		if (!content || content.trim() === '') return

		try {
			await createSuggestion({ content: content.trim() }).unwrap()
			toast.success('Thêm câu hỏi gợi ý thành công')
		} catch (error) {
			toast.error('Thêm câu hỏi gợi ý thất bại')
		}
	}

	const handleToggleSuggestion = async (suggestion: GetQuerySuggestionDto) => {
		try {
			await updateSuggestion({
				id: suggestion._id,
				content: suggestion.content,
				enabled: !suggestion.enabled
			}).unwrap()
			toast.success(suggestion.enabled ? 'Đã tắt câu hỏi gợi ý' : 'Đã bật câu hỏi gợi ý')
		} catch (error) {
			toast.error('Cập nhật câu hỏi gợi ý thất bại')
		}
	}

	const handleEditSuggestion = async (suggestion: GetQuerySuggestionDto) => {
		const content = prompt('Chỉnh sửa nội dung câu hỏi gợi ý:', suggestion.content)
		if (!content || content.trim() === '' || content === suggestion.content) return

		try {
			await updateSuggestion({
				id: suggestion._id,
				content: content.trim(),
				enabled: suggestion.enabled
			}).unwrap()
			toast.success('Cập nhật câu hỏi gợi ý thành công')
		} catch (error) {
			toast.error('Cập nhật câu hỏi gợi ý thất bại')
		}
	}

	const handleDeleteSuggestion = async (suggestionId: string) => {
		if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi gợi ý này?')) return

		try {
			await deleteSuggestion(suggestionId).unwrap()
			toast.success('Xóa câu hỏi gợi ý thành công')
		} catch (error) {
			toast.error('Xóa câu hỏi gợi ý thất bại')
		}
	}

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-8'>
				<p className='text-muted-foreground'>Đang tải...</p>
			</div>
		)
	}

	const enabledSuggestions = config?.query_suggestions || []
	const disabledSuggestions = config?.query_unenable_suggestions || []

	return (
		<div className='space-y-6'>
			{/* Basic Config */}
			<Card>
				<CardHeader>
					<CardTitle>Cấu hình Chatbot</CardTitle>
					<CardDescription>Tùy chỉnh thông tin hiển thị của chatbot</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tên Chatbot</FormLabel>
										<FormControl>
											<Input placeholder='Trợ lý AI hỗ trợ luận văn' {...field} />
										</FormControl>
										<FormDescription>Tên hiển thị của chatbot trong giao diện</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='description'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mô tả</FormLabel>
										<FormControl>
											<Textarea
												placeholder='Mô tả về chatbot...'
												className='min-h-[100px]'
												{...field}
											/>
										</FormControl>
										<FormDescription>Giới thiệu ngắn gọn về chatbot</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='status'
								render={({ field }) => (
									<FormItem className='flex items-center justify-between rounded-lg border p-4'>
										<div className='space-y-0.5'>
											<FormLabel className='text-base'>Kích hoạt Chatbot</FormLabel>
											<FormDescription>Bật/tắt chatbot cho người dùng</FormDescription>
										</div>
										<FormControl>
											<Switch
												checked={field.value === 'ENABLED'}
												onCheckedChange={(checked) =>
													field.onChange(checked ? 'ENABLED' : 'DISABLED')
												}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<Button type='submit' disabled={isUpdating} className='w-full'>
								<Save className='mr-2 h-4 w-4' />
								{isUpdating ? 'Đang lưu...' : 'Lưu cấu hình'}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

			{/* Query Suggestions */}
			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle>Câu hỏi gợi ý</CardTitle>
							<CardDescription>Quản lý các câu hỏi gợi ý hiển thị cho người dùng</CardDescription>
						</div>
						<Button onClick={handleAddSuggestion} disabled={isCreating} size='sm'>
							<Plus className='mr-2 h-4 w-4' />
							Thêm câu hỏi
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{/* Enabled Suggestions */}
						<div>
							<h4 className='mb-2 text-sm font-medium'>Đang hiển thị ({enabledSuggestions.length})</h4>
							{enabledSuggestions.length === 0 ? (
								<p className='text-sm text-muted-foreground'>Chưa có câu hỏi gợi ý nào</p>
							) : (
								<div className='space-y-2'>
									{enabledSuggestions.map((suggestion) => (
										<div
											key={suggestion._id}
											className='flex items-center justify-between rounded-lg border p-3 hover:bg-accent'
										>
											<div className='flex items-center gap-2'>
												<Badge variant='default'>Đang hiển thị</Badge>
												<p className='text-sm'>{suggestion.content}</p>
											</div>
											<div className='flex items-center gap-2'>
												<Button
													size='sm'
													variant='ghost'
													onClick={() => handleEditSuggestion(suggestion)}
												>
													Sửa
												</Button>
												<Button
													size='sm'
													variant='ghost'
													onClick={() => handleToggleSuggestion(suggestion)}
												>
													Tắt
												</Button>
												<Button
													size='sm'
													variant='ghost'
													onClick={() => handleDeleteSuggestion(suggestion._id)}
												>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Disabled Suggestions */}
						{disabledSuggestions.length > 0 && (
							<div>
								<h4 className='mb-2 text-sm font-medium'>Đã tắt ({disabledSuggestions.length})</h4>
								<div className='space-y-2'>
									{disabledSuggestions.map((suggestion) => (
										<div
											key={suggestion._id}
											className='flex items-center justify-between rounded-lg border p-3 opacity-60 hover:bg-accent'
										>
											<div className='flex items-center gap-2'>
												<Badge variant='secondary'>Đã tắt</Badge>
												<p className='text-sm'>{suggestion.content}</p>
											</div>
											<div className='flex items-center gap-2'>
												<Button
													size='sm'
													variant='ghost'
													onClick={() => handleEditSuggestion(suggestion)}
												>
													Sửa
												</Button>
												<Button
													size='sm'
													variant='ghost'
													onClick={() => handleToggleSuggestion(suggestion)}
												>
													Bật
												</Button>
												<Button
													size='sm'
													variant='ghost'
													onClick={() => handleDeleteSuggestion(suggestion._id)}
												>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default ChatbotConfig
