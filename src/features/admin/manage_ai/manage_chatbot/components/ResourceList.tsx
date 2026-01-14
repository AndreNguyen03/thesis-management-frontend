/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Edit, Trash2, ExternalLink, FileText, Plus } from 'lucide-react'
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

import { useDeleteResourceMutation } from '@/services/chatbotApi'
import type { CrawlProgress } from '@/models/chatbot-resource.model'
import ResourceDialog from './ResourceDialog'
import { mapKnowledgeType } from '@/models/knowledge-source.model'
import { CustomPagination } from '@/components/PaginationBar'
import type { RequestKnowledgeSourceDto } from '@/models'
import { useGetKnowledgeSourcesQuery } from '@/services/knowledgeSourceApi'
import { cn, downloadFileWithURL } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { useChatbotSocket } from '@/hooks/useChatbot'

// Map processing status to UI status
const statusMap: Record<string, string> = {
	pending: 'pending',
	processing: 'crawling',
	completed: 'completed',
	failed: 'failed'
}

const statusColors: Record<string, string> = {
	pending: 'bg-gray-500',
	crawling: 'bg-blue-500',
	embedding: 'bg-purple-500',
	completed: 'bg-green-500',
	failed: 'bg-red-500'
}

const statusLabels: Record<string, string> = {
	pending: 'Chờ xử lý',
	crawling: 'Đang crawl',
	embedding: 'Đang embedding',
	completed: 'Hoàn thành',
	failed: 'Thất bại'
}
const MINIO_DOWNLOAD_URL_BASE = import.meta.env.VITE_MINIO_DOWNLOAD_URL_BASE
const ResourceList = () => {
	const [selectedResource, setSelectedResource] = useState<any | null>(null)
	const [deleteId, setDeleteId] = useState<string | null>(null)
	const [progressMap, setProgressMap] = useState<Map<string, CrawlProgress>>(new Map())
	const [dialogOpen, setDialogOpen] = useState(false)
	const [queryParams, setQueryParams] = useState<RequestKnowledgeSourceDto>({
		limit: 15,
		page: 1,
		query: ''
	})
	const { data: resourcesData, isLoading, refetch } = useGetKnowledgeSourcesQuery({ queries: queryParams })
	console.log('resourcesData', resourcesData)
	const [deleteResource, { isLoading: isDeleting }] = useDeleteResourceMutation()
	const navigate = useNavigate()
	const {
		isConnected,
		onCrawlProgress,
		onCrawlCompleted,
		onCrawlFailed,
		onEmbeddingProgress,
		onEmbeddingCompleted
	} = useChatbotSocket()


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
			refetch()
		} catch (error) {
			toast.error('Xóa tài nguyên thất bại' + error)
		}
	}

	const handleOpenDialog = (resource?: any) => {
		setSelectedResource(resource || null)
		setDialogOpen(true)
	}

	const handleCloseDialog = () => {
		setDialogOpen(false)
		setSelectedResource(null)
		refetch() // Refetch sau khi đóng dialog
	}

	const getProgress = (resource: any) => {
		return progressMap.get(resource._id)
	}

	const getMappedStatus = (processingStatus: string) => {
		return statusMap[processingStatus.toLowerCase()] || 'pending'
	}

	const handleGoto = (resource: any) => {
		switch (resource.source_type) {
			case 'FILE': {
				const fileUrl = `${MINIO_DOWNLOAD_URL_BASE}/${resource.source_location}`
				downloadFileWithURL(fileUrl, resource.name)
				break
			}
			case 'URL': {
				window.open(resource.source_location, '_blank')
				break
			}
			case 'TOPIC-REGISTERING': {
				navigate(`/detail-topic/${resource.source_location}`)
				break
			}
			case 'TOPIC-LIBRARY': {
				navigate(`/detail-topic/${resource.source_location}`)
				break
			}
			case 'LECTURER-PROFILE': {
				navigate(`/profile/lecturer/${resource.source_location}`)
				break
			}
			default: {
				window.open(resource.source_location, '_blank')
			}
		}
	}
	return (
		<>
			<Card className='p-0'>
				<CardHeader>
					<div className='flex items-center justify-between gap-1'>
						<div className='flex flex-col gap-1'>
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
							Tổng: {resourcesData?.meta.totalItems || 0} tài nguyên
						</span>
					</div>

					<div className='rounded-lg border'>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Tiêu đề</TableHead>
									<TableHead className='text-center'>Loại</TableHead>
									<TableHead className='text-center'>Trạng thái</TableHead>
									<TableHead className='text-center'>Tiến độ</TableHead>
									<TableHead className='text-center'>Cập nhật</TableHead>
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
										const mappedStatus = getMappedStatus(resource.processing_status)
										return (
											<TableRow key={resource._id}>
												<TableCell>
													<div className='flex items-center gap-2'>
														<div className='max-w-xs'>
															<p className='truncate font-medium'>{resource.name}</p>
															{resource.source_location && (
																<a
																	onClick={() => {
																		handleGoto(resource)
																	}}
																	target='_blank'
																	rel='noopener noreferrer'
																	className={cn(
																		'flex items-center gap-1 truncate text-xs text-blue-500 hover:underline',
																		'cursor-pointer'
																	)}
																>
																	{resource.source_location.slice(0, 50)}
																	{resource.source_location.length > 50 && '...'}
																	<ExternalLink className='h-3 w-3 flex-shrink-0' />
																</a>
															)}
														</div>
													</div>
												</TableCell>
												<TableCell className='flex justify-center'>
													<Badge variant='outline' className='text-center'>
														{mapKnowledgeType[resource.source_type] || 'FILE'}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge className={`${statusColors[mappedStatus]} text-center`}>
														{statusLabels[mappedStatus]}
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
												<TableCell className='text-center text-sm text-muted-foreground'>
													{formatDistanceToNow(
														new Date(resource.updatedAt || resource.createdAt),
														{
															addSuffix: true,
															locale: vi
														}
													)}
												</TableCell>
												<TableCell className='text-right'>
													<div className='flex justify-end gap-2'>
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
					{isLoading ? (
						''
					) : (
						<CustomPagination
							meta={resourcesData!.meta!}
							onPageChange={(page) => setQueryParams((prev) => ({ ...prev, page }))}
						/>
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
