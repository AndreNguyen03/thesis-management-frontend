import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { Edit, Trash2, RefreshCw, ExternalLink, FileText } from 'lucide-react'

import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge, Button } from '@/components/ui'
import ResourceDialog from './ResourceDiaglog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'
import type { ChatbotResource, CrawlProgress } from '@/models/chatbot-resource.model'

const statusColors = {
	pending: 'bg-gray-500',
	crawling: 'bg-blue-500',
	embedding: 'bg-purple-500',
	completed: 'bg-green-500',
	failed: 'bg-red-500'
}

const statusLabels = {
	pending: 'Đang chờ',
	crawling: 'Đang crawl',
	embedding: 'Đang embedding',
	completed: 'Hoàn thành',
	failed: 'Thất bại'
}

const ResourceList = () => {
	const queryClient = useQueryClient()
	const [page, setPage] = useState(1)
	const [selectedResource, setSelectedResource] = useState<ChatbotResource | null>(null)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [progressMap, setProgressMap] = useState<Map<string, CrawlProgress>>(new Map())

	const { data: resourcesData, isLoading } = useQuery({
		queryKey: ['chatbot-resources', page],
		queryFn: () => chatbotApiService.getResources({ page, limit: 10 })
	})

	const deleteMutation = useMutation({
		mutationFn: chatbotApiService.deleteResource,
		onSuccess: () => {
			toast.success('Xóa tài nguyên thành công')
			queryClient.invalidateQueries({ queryKey: ['chatbot-resources'] })
			setDeleteId(null)
		},
		onError: () => {
			toast.error('Xóa tài nguyên thất bại')
		}
	})

	const retryMutation = useMutation({
		mutationFn: chatbotApiService.retryResource,
		onSuccess: () => {
			toast.success('Đang xử lý lại tài nguyên')
			queryClient.invalidateQueries({ queryKey: ['chatbot-resources'] })
		},
		onError: () => {
			toast.error('Thử lại thất bại')
		}
	})

	useEffect(() => {
		chatbotSocketService.connect()
		chatbotSocketService.joinRoom('chatbot-admin')

		const unsubscribeCrawl = chatbotSocketService.on('crawl:progress', (data: CrawlProgress) => {
			setProgressMap((prev) => new Map(prev).set(data.resourceId, data))
		})

		const unsubscribeCompleted = chatbotSocketService.on('crawl:completed', (data: CrawlProgress) => {
			setProgressMap((prev) => {
				const newMap = new Map(prev)
				newMap.delete(data.resourceId)
				return newMap
			})
			toast.success(`Đã hoàn thành xử lý: ${data.message}`)
			queryClient.invalidateQueries({ queryKey: ['chatbot-resources'] })
		})

		const unsubscribeFailed = chatbotSocketService.on('crawl:failed', (data: CrawlProgress) => {
			setProgressMap((prev) => {
				const newMap = new Map(prev)
				newMap.delete(data.resourceId)
				return newMap
			})
			toast.error(`Xử lý thất bại: ${data.error}`)
			queryClient.invalidateQueries({ queryKey: ['chatbot-resources'] })
		})

		const unsubscribeEmbedding = chatbotSocketService.on('embedding:progress', (data: CrawlProgress) => {
			setProgressMap((prev) => new Map(prev).set(data.resourceId, data))
		})

		return () => {
			unsubscribeCrawl()
			unsubscribeCompleted()
			unsubscribeFailed()
			unsubscribeEmbedding()
			chatbotSocketService.leaveRoom('chatbot-admin')
		}
	}, [queryClient])

	const getProgress = (resource: ChatbotResource) => {
		return progressMap.get(resource.id)
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<div>
					<h3 className='text-lg font-semibold'>Danh sách tài nguyên</h3>
					<p className='text-sm text-muted-foreground'>Tổng số: {resourcesData?.total || 0} tài nguyên</p>
				</div>
				<Button onClick={() => setSelectedResource({} as ChatbotResource)}>
					<FileText className='mr-2 h-4 w-4' />
					Thêm tài nguyên
				</Button>
			</div>

			<div className='rounded-lg border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Tiêu đề</TableHead>
							<TableHead>Loại</TableHead>
							<TableHead>Trạng thái</TableHead>
							<TableHead>Tiến độ</TableHead>
							<TableHead>Cập nhật</TableHead>
							<TableHead className='text-right'>Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={6} className='py-8 text-center'>
									Đang tải...
								</TableCell>
							</TableRow>
						) : resourcesData?.data.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className='py-8 text-center'>
									Chưa có tài nguyên nào
								</TableCell>
							</TableRow>
						) : (
							resourcesData?.data.map((resource) => {
								const progress = getProgress(resource)
								return (
									<TableRow key={resource.id}>
										<TableCell>
											<div className='flex items-center gap-2'>
												<div>
													<p className='font-medium'>{resource.title}</p>
													{resource.url && (
														<a
															href={resource.url}
															target='_blank'
															rel='noopener noreferrer'
															className='flex items-center gap-1 text-xs text-blue-500 hover:underline'
														>
															{resource.url.slice(0, 50)}...
															<ExternalLink className='h-3 w-3' />
														</a>
													)}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant='outline'>{resource.type}</Badge>
										</TableCell>
										<TableCell>
											<Badge className={statusColors[resource.status]}>
												{statusLabels[resource.status]}
											</Badge>
										</TableCell>
										<TableCell>
											{progress ? (
												<div className='min-w-[150px] space-y-1'>
													<Progress value={progress.progress} className='h-2' />
													<p className='text-xs text-muted-foreground'>{progress.message}</p>
												</div>
											) : resource.metadata?.wordCount ? (
												<p className='text-sm'>{resource.metadata.wordCount} từ</p>
											) : (
												'-'
											)}
										</TableCell>
										<TableCell className='text-sm text-muted-foreground'>
											{formatDistanceToNow(new Date(resource.updatedAt), {
												addSuffix: true,
												locale: vi
											})}
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end gap-2'>
												{resource.status === 'failed' && (
													<Button
														size='sm'
														variant='outline'
														onClick={() => retryMutation.mutate(resource.id)}
													>
														<RefreshCw className='h-4 w-4' />
													</Button>
												)}
												<Button
													size='sm'
													variant='outline'
													onClick={() => setSelectedResource(resource)}
												>
													<Edit className='h-4 w-4' />
												</Button>
												<Button
													size='sm'
													variant='destructive'
													onClick={() => setDeleteId(resource.id)}
												>
													<Trash2 className='h-4 w-4' />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								)
							})
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{resourcesData && resourcesData.total > 10 && (
				<div className='flex justify-center gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
					>
						Trước
					</Button>
					<span className='flex items-center px-4'>
						Trang {page} / {Math.ceil(resourcesData.total / 10)}
					</span>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setPage((p) => p + 1)}
						disabled={page >= Math.ceil(resourcesData.total / 10)}
					>
						Sau
					</Button>
				</div>
			)}

			{/* Resource Dialog */}
			{selectedResource && (
				<ResourceDialog
					resource={selectedResource.id ? selectedResource : null}
					open={!!selectedResource}
					onClose={() => setSelectedResource(null)}
				/>
			)}

			{/* Delete Confirmation */}
			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa tài nguyên này? Hành động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
							Xóa
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}

export default ResourceList
