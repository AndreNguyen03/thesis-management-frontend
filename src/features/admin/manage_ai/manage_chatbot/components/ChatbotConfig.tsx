import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

import {
	useGetChatbotVersionQuery,
	useUpdateChatbotVersionMutation,
	useCreateQuerySuggestionMutation,
	useUpdateQuerySuggestionMutation,
	useDeleteQuerySuggestionsMutation,
	useToggleChatbotStatusMutation
} from '@/services/chatbotApi'
import type { GetQuerySuggestionDto } from '@/models/chatbot-version'
import type { PayloadSuggestion } from '@/models/chatbot-resource.model'
import ManageSuggestion from './manage-suggestions/ManageSuggestion'

const formSchema = z.object({
	name: z.string().min(1, 'Tên không được để trống'),
	description: z.string().min(1, 'Mô tả không được để trống'),
	status: z.enum(['enabled', 'disabled'])
})

type FormValues = z.infer<typeof formSchema>

const ChatbotConfig = () => {
	const { data: config, isLoading, refetch: refetchConfig } = useGetChatbotVersionQuery()
	const [updateConfig, { isLoading: isUpdating }] = useUpdateChatbotVersionMutation()
	const [createSuggestion, { isLoading: isCreatingResource }] = useCreateQuerySuggestionMutation()
	const [updateSuggestion, { isLoading: isLoadingEditting }] = useUpdateQuerySuggestionMutation()
	const [deleteSuggestion, { isLoading: isDeletingSuggestions }] = useDeleteQuerySuggestionsMutation()
	const [isMultiChoice, setIsMultiChoice] = useState(false)
	const [selectionIds, setSelectionIds] = useState<string[]>([])
	const [newSuggestionContents, setNewSuggestionContents] = useState<PayloadSuggestion[]>([])
	const [isAddingNew, setIsAddingNew] = useState(false)
	// gọi endpoint dể thay đổi trạng thái bằng cách toggle
	const [toggleChatbotStatus, { isLoading: isTogglingStatus }] = useToggleChatbotStatusMutation()
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			description: '',
			status: 'enabled'
		}
	})

	useEffect(() => {
		if (config) {
			form.reset({
				name: config.name,
				description: config.description,
				status: config.status as 'enabled' | 'disabled'
			})
		}
	}, [config, form])

	const isChanged = useMemo(() => {
		if (!config) return false
		return (
			form.getValues('name') !== config.name ||
			form.getValues('description') !== config.description ||
			form.getValues('status') !== config.status
		)
	}, [config, form.getValues()])

	const onSubmit = async (values: FormValues) => {
		try {
			await updateConfig({ updatePayload: values, id: config!._id }).unwrap()
			toast.success('Cập nhật cấu hình thành công', { richColors: true })
		} catch (error) {
			toast.error('Cập nhật cấu hình thất bại', {
				richColors: true
			})
		}
	}

	const handleAddSuggestions = async () => {
		try {
			await createSuggestion({ suggestions: newSuggestionContents, chatbotVersionId: config!._id }).unwrap()
			setNewSuggestionContents([])
			toast.success('Thêm câu hỏi gợi ý thành công')
		} catch (error) {
			toast.error('Thêm câu hỏi gợi ý thất bại')
		}
	}

	const handleToggleSuggestion = async (suggestion: GetQuerySuggestionDto) => {
		try {
			await toggleChatbotStatus({
				id: config?._id!,
				suggestionId: suggestion._id,
				status: !suggestion.enabled
			}).unwrap()
			refetchConfig()
			toast.success(suggestion.enabled ? 'Đã tắt câu hỏi gợi ý' : 'Đã bật câu hỏi gợi ý')
		} catch (error) {
			toast.error('Cập nhật câu hỏi gợi ý thất bại')
		}
	}

	const handleEditSuggestion = async (suggestionId: string, content: string): Promise<boolean> => {
		try {
			await updateSuggestion({
				id: config!._id,
				suggestionId,
				content: content.trim()
			}).unwrap()
			toast.success('Cập nhật câu hỏi gợi ý thành công')
			return true
		} catch (error) {
			toast.error('Cập nhật câu hỏi gợi ý thất bại')
		}
		return false
	}

	const handleDeleteSuggestion = async (suggestionId?: string) => {
		if (!suggestionId && selectionIds.length === 0) return
		if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi gợi ý này?')) return
		try {
			await deleteSuggestion({
				id: config!._id,
				suggestionIds: suggestionId ? [suggestionId] : selectionIds
			}).unwrap()
			setSelectionIds([])
			setIsMultiChoice(false)
			toast.success(`Xóa ${suggestionId ? 1 : selectionIds.length} câu hỏi gợi ý thành công`)
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
	const handleAddNewInput = () => {
		setNewSuggestionContents([...newSuggestionContents, { content: '', enabled: true }])
	}

	const handleRemoveInput = (index: number) => {
		setNewSuggestionContents(newSuggestionContents.filter((_, i) => i !== index))
	}

	const handleInputChange = (index: number, value: string) => {
		const updated = [...newSuggestionContents]
		updated[index] = { ...updated[index], content: value }
		setNewSuggestionContents(updated)
	}

	const handleSwitchChange = (index: number, value: boolean) => {
		const updated = [...newSuggestionContents]
		updated[index] = { ...updated[index], enabled: value }
		setNewSuggestionContents(updated)
	}
	return (
		<div className='space-y-6 pb-16'>
			{/* Basic Config */}
			<Card className='p-1'>
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
										{form.getValues('name') !== config?.name && (
											<Button
												className='px-2 py-1'
												variant='gray'
												type='button'
												onClick={() => form.setValue('name', config?.name || '')}
											>
												Hủy bỏ
											</Button>
										)}
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
												className='h-fit min-h-[50px]'
												{...field}
											/>
										</FormControl>
										<FormDescription>Giới thiệu ngắn gọn về chatbot</FormDescription>
										<FormMessage />
										{form.getValues('description') !== config?.description && (
											<Button
												className='px-2 py-1'
												variant='gray'
												type='button'
												onClick={() => form.setValue('description', config?.description || '')}
											>
												Hủy bỏ
											</Button>
										)}
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
												checked={field.value === 'enabled'}
												onCheckedChange={(checked) =>
													field.onChange(checked ? 'enabled' : 'disabled')
												}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<Button
								type='submit'
								disabled={isUpdating || !isChanged}
								className='w-full disabled:opacity-50'
							>
								<Save className='mr-2 h-4 w-4' />
								{isUpdating ? 'Đang lưu...' : 'Lưu cấu hình'}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

			{/* Query Suggestions */}
			<Card className='p-1'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle>Câu hỏi gợi ý</CardTitle>
							<CardDescription>Quản lý các câu hỏi gợi ý hiển thị cho người dùng</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{/* Enabled Suggestions */}
						<div>
							<div className='flex justify-between py-2'>
								<h4 className='mb-2 text-sm font-medium'>
									Đang hiển thị ({enabledSuggestions.filter((sg) => sg.enabled === true).length})
								</h4>
								<div className='flex gap-2'>
									{selectionIds.length > 0 && (
										<button
											className='rounded-lg bg-red-500 px-2 py-1 text-sm font-semibold text-white'
											onClick={() => handleDeleteSuggestion()}
										>
											{isDeletingSuggestions && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
											Xóa ({selectionIds.length})
										</button>
									)}
									<button
										className='rounded-lg bg-blue-600 px-2 py-1 text-sm font-semibold text-white hover:bg-blue-500'
										onClick={() => {
											setIsMultiChoice(!isMultiChoice)
											if (isMultiChoice) setSelectionIds([])
										}}
									>
										{isMultiChoice ? 'Hủy chọn nhiều' : 'Chọn nhiều'}
									</button>
								</div>
							</div>
							{enabledSuggestions.length === 0 ? (
								<p className='text-sm text-muted-foreground'>Chưa có câu hỏi gợi ý nào</p>
							) : (
								<div className='space-y-2'>
									{enabledSuggestions.map((suggestion) => {
										return (
											<ManageSuggestion
												suggestion={suggestion}
												isMultiChoice={isMultiChoice}
												selectionIds={selectionIds}
												setSelectionIds={setSelectionIds}
												handleToggleSuggestion={handleToggleSuggestion}
												handleDeleteSuggestion={handleDeleteSuggestion}
												handleEditSuggestion={handleEditSuggestion}
												isLoadingEditting={isLoadingEditting}
											/>
										)
									})}
								</div>
							)}
						</div>

						{/* Add New Suggestions Section */}
						{!isAddingNew ? (
							<Button
								variant='outline'
								size='sm'
								onClick={() => {
									setIsAddingNew(true)
									setNewSuggestionContents([{ content: '', enabled: true }])
								}}
								className='w-fit'
							>
								<Plus className='mr-2 h-4 w-4' />
								Thêm câu hỏi gợi ý mới
							</Button>
						) : (
							<div className='space-y-3 rounded-lg border p-4'>
								<div className='flex items-center justify-between'>
									<h4 className='text-sm font-medium'>Thêm câu hỏi mới</h4>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => {
											setIsAddingNew(false)
											setNewSuggestionContents([])
										}}
									>
										Hủy
									</Button>
								</div>

								<div className='space-y-2'>
									{newSuggestionContents.map((suggestion, index) => (
										<div key={index} className='flex items-center gap-2'>
											<Switch
												checked={suggestion.enabled}
												onCheckedChange={(checked) => handleSwitchChange(index, checked)}
											/>
											<Input
												placeholder='Nhập câu hỏi gợi ý...'
												value={suggestion.content}
												onChange={(e) => handleInputChange(index, e.target.value)}
												className='flex-1'
											/>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleRemoveInput(index)}
												disabled={newSuggestionContents.length === 1}
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									))}
								</div>

								<div className='flex items-center justify-between'>
									<Button variant='outline' size='sm' onClick={handleAddNewInput}>
										<Plus className='mr-2 h-4 w-4' />
										Thêm câu hỏi khác
									</Button>

									<Button onClick={handleAddSuggestions} disabled={isCreatingResource} size='sm'>
										<Save className='mr-2 h-4 w-4' />
										{isCreatingResource ? 'Đang lưu...' : 'Lưu tất cả'}
									</Button>
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
