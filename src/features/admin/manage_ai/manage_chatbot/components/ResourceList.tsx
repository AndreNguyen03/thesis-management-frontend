import { useEffect, useState } from 'react'
import { Edit, Trash2, RefreshCw, ExternalLink, FileText, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { useGetResourcesQuery, useDeleteResourceMutation, useRetryResourceMutation } from '@/services/chatbotApi'
import { useChatbotSocket } from '@/contexts/ChatbotSocketContext'
import type { ChatbotResource, CrawlProgress, ResourceStatus } from '@/models/chatbot-resource.model'
import { ResourceStatusLabels, ResourceTypeLabels } from '@/models/chatbot-resource.model'
import ResourceDialog from './ResourceDialog'

const statusColors: Record<ResourceStatus, string> = {
	pending: 'bg-gray-500',
	crawling: 'bg-blue-500',
	embedding: 'bg-purple-500',
	completed: 'bg-green-500',
	failed: 'bg-red-500'
}

const ResourceList = () => {
	const [page, setPage] = useState(1)
	const [selectedResource, setSelectedResource] = useState<ChatbotResource | null>(null)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [progressMap, setProgressMap] = useState<Map<string, CrawlProgress>>(new Map())
	const [dialogOpen, setDialogOpen] = useState(false)

	const { data: resourcesData, isLoading, refetch } = useGetResourcesQuery({ page, limit: 10 })
	const [deleteResource, { isLoading: isDeleting }] = useDeleteResourceMutation()
	const [retryResource, { isLoading: isRetrying }] = useRetryResourceMutation()

	const {
		isConnected,
		joinAdminRoom,
		leaveAdminRoom,
		onCrawlProgress,
		onCrawlCompleted,
		onCrawlFailed,
		onEmbeddingProgress,
		onEmbeddingCompleted
	} = useChatbotSocket()

	// Join admin room on mount
	useEffect(() => {
		if (isConnected) {
			joinAdminRoom()
		}
		return () => {
			leaveAdminRoom()
		}
	}, [isConnected, joinAdminRoom, leaveAdminRoom])

	// Socket event listeners
	useEffect(() => {
		const unsubscribeCrawl = onCrawlProgress((data: CrawlProgress) => {
			console.log('📥 Crawl progress:', data)
			setProgressMap((prev) => new Map(prev).set(data.resourceId, data))
		})

		const unsubscribeCompleted = onCrawlCompleted((data: CrawlProgress) => {
			console.log('✅ Crawl completed:', data)
			setProgressMap((prev) => {
				const newMap = new Map(prev)
				newMap.delete(data.resourceId)
				return newMap
			})
			toast.success(`Hoàn thành: ${data.message}`)
			refetch()
		})

		const unsubscribeFailed = onCrawlFailed((data: CrawlProgress) => {
			console.log('❌ Crawl failed:', data)
			setProgressMap((prev) => {
				const newMap = new Map(prev)
				newMap.delete(data.resourceId)
				return newMap
			})
			toast.error(`Thất bại: ${data.error || 'Lỗi không xác định'}`)
			refetch()
		})

		const unsubscribeEmbedding = onEmbeddingProgress((data: CrawlProgress) => {
			console.log('🔄 Embedding progress:', data)
			setProgressMap((prev) => new Map(prev).set(data.resourceId, data))
		})

		const unsubscribeEmbeddingCompleted = onEmbeddingCompleted((data: CrawlProgress) => {
			console.log('✅ Embedding completed:', data)
			setProgressMap((prev) => {
				const newMap = new Map(prev)
				newMap.delete(data.resourceId)
				return newMap
			})
			toast.success(`Hoàn thành embedding: ${data.message}`)
			refetch()
		})

		return () => {
			unsubscribeCrawl()
			unsubscribeCompleted()
			unsubscribeFailed()
			unsubscribeEmbedding()
			unsubscribeEmbeddingCompleted()
		}
	}, [onCrawlProgress, onCrawlCompleted, onCrawlFailed, onEmbeddingProgress, onEmbeddingCompleted, refetch])

	const handleDelete = async () => {
		if (!deleteId) return

		try {
			await deleteResource(deleteId).unwrap()
			toast.success('Xóa tài nguyên thành công')
			setDeleteId(null)
		} catch (error) {
			toast.error('Xóa tài nguyên thất bại')
		}
	}

	const handleRetry = async (id: string) => {
		try {
			await retryResource(id).unwrap()
			toast.success('Đang xử lý lại tài nguyên...')
		} catch (error) {
			toast.error('Thử lại thất bại')
		}
	}

	const handleOpenDialog = (resource?: ChatbotResource) => {
		setSelectedResource(resource || null)
		setDialogOpen(true)
	}

	const handleCloseDialog = () => {
		setDialogOpen(false)
		setSelectedResource(null)
	}

	const getProgress = (resource: ChatbotResource) => {
		return progressMap.get(resource._id)
	}

	return (
		<>
			<Card className='p-0'>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<div>
							<CardTitle>Danh sách tài nguyên</CardTitle>
							<CardDescription>Quản lý tài nguyên cho chatbot RAG</CardDescription>
						</div>
						<Button onClick={() => handleOpenDialog()}>
							<Plus className='mr-2 h-4 w-4' />
							Thêm tài nguyên
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className='mb-4 flex items-center gap-2'>
						<div className='flex items-center gap-2'>
							<div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
							<span className='text-sm text-muted-foreground'>
								{isConnected ? 'Đã kết nối socket' : 'Mất kết nối socket'}
							</span>
						</div>
						<span className='text-sm text-muted-foreground'>•</span>
						<span className='text-sm text-muted-foreground'>
							Tổng: {resourcesData?.total || 0} tài nguyên
						</span>
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
											<div className='flex flex-col items-center gap-2'>
												<FileText className='h-12 w-12 text-muted-foreground' />
												<p className='text-sm text-muted-foreground'>Chưa có tài nguyên nào</p>
												<Button variant='outline' size='sm' onClick={() => handleOpenDialog()}>
													<Plus className='mr-2 h-4 w-4' />
													Thêm tài nguyên đầu tiên
												</Button>
											</div>
										</TableCell>
									</TableRow>
								) : (
									resourcesData?.data.map((resource) => {
										const progress = getProgress(resource)
										return (
											<TableRow key={resource._id}>
												<TableCell>
													<div className='flex items-center gap-2'>
														<div className='max-w-xs'>
															<p className='truncate font-medium'>{resource.title}</p>
															{resource.url && (
																<a
																	href={resource.url}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='flex items-center gap-1 truncate text-xs text-blue-500 hover:underline'
																>
																	{resource.url.slice(0, 50)}
																	{resource.url.length > 50 && '...'}
																	<ExternalLink className='h-3 w-3 flex-shrink-0' />
																</a>
															)}
														</div>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant='outline'>{ResourceTypeLabels[resource.type]}</Badge>
												</TableCell>
												<TableCell>
													<Badge className={statusColors[resource.status]}>
														{ResourceStatusLabels[resource.status]}
													</Badge>
												</TableCell>
												<TableCell>
													{progress ? (
														<div className='min-w-[150px] space-y-1'>
															<Progress value={progress.progress} className='h-2' />
															<p className='text-xs text-muted-foreground'>
																{progress.message}
															</p>
														</div>
													) : resource.metadata?.wordCount ? (
														<div className='text-sm'>
															<p>{resource.metadata.wordCount.toLocaleString()} từ</p>
															{resource.metadata.chunkCount && (
																<p className='text-xs text-muted-foreground'>
																	{resource.metadata.chunkCount} chunks
																</p>
															)}
														</div>
													) : (
														<span className='text-muted-foreground'>-</span>
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
																onClick={() => handleRetry(resource._id)}
																disabled={isRetrying}
															>
																<RefreshCw className='h-4 w-4' />
															</Button>
														)}
														<Button
															size='sm'
															variant='outline'
															onClick={() => handleOpenDialog(resource)}
														>
															<Edit className='h-4 w-4' />
														</Button>
														<Button
															size='sm'
															variant='destructive'
															onClick={() => setDeleteId(resource._id)}
															disabled={isDeleting}
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
						<div className='mt-4 flex justify-center gap-2'>
							<Button
								variant='outline'
								size='sm'
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
							>
								Trước
							</Button>
							<span className='flex items-center px-4 text-sm'>
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
				</CardContent>
			</Card>

			{/* Resource Dialog */}
			<ResourceDialog resource={selectedResource} open={dialogOpen} onClose={handleCloseDialog} />

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
						<AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
							{isDeleting ? 'Đang xóa...' : 'Xóa'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}

export default ResourceList
