import React, { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// Icons
import { Loader2, FileText, Search, PanelLeftOpen, PanelLeftClose } from 'lucide-react'

// Shadcn UI Components
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
// Custom/Utils
import { CustomPagination } from '@/components/PaginationBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// API & Models
import {
	useGetDraftTopicsQuery,
	useGetSubmittedTopicsQuery,
	useSubmitTopicMutation,
	useWithdrawSubmittedTopicsMutation
} from '@/services/topicApi'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { CreateTopic } from '../new_topic'

const SubmitTopicInPeriod = () => {
	const { periodId } = useParams<{ periodId: string }>()
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState<'draft' | 'submitted'>('draft')

	// Panel Layout State
	// Using simple boolean to toggle panel size.
	// 0 = Collapsed, 30 = Expanded (30% width)
	const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false)
	const panelRef = useRef<any>(null)

	// Data Fetching & State (Simplified for brevity)
	const [draftQueries, setDraftQueries] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 8,
		search_by: ['titleVN'],
		query: '',
		sort_by: 'updatedAt',
		sort_order: 'desc'
	})
	const [submittedQueries, setSubmittedQueries] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 8,
		search_by: ['titleVN'],
		query: '',
		sort_by: 'submittedAt',
		sort_order: 'desc'
	})
	const {
		data: draftTopics,
		isLoading: isDraftLoading,
		refetch: refetchDraft
	} = useGetDraftTopicsQuery({ queries: draftQueries })
	const {
		data: submittedTopics,
		isLoading: isSubmittedLoading,
		refetch: refetchSubmitted
	} = useGetSubmittedTopicsQuery(submittedQueries)
	const [submitTopic] = useSubmitTopicMutation()
	const [withdrawTopic] = useWithdrawSubmittedTopicsMutation()

	// Handlers
	const handleSubmitTopic = async (topic: any) => {
		if (!periodId) return
		try {
			await submitTopic({ topicId: topic._id, periodId }).unwrap()
			toast.success('Nộp đề tài thành công!')
			refetchDraft()
			refetchSubmitted()
		} catch (error) {
			toast.error('Lỗi khi nộp đề tài')
		}
	}

	const handleWithdrawTopic = async (topic: any) => {
		try {
			await withdrawTopic({ topicIds: [topic._id] }).unwrap()
			toast.success('Rút đề tài thành công!')
			refetchDraft()
			refetchSubmitted()
		} catch (error) {
			toast.error('Lỗi khi rút đề tài')
		}
	}

	const toggleCreatePanel = () => {
		const panel = panelRef.current
		if (panel) {
			if (isCreatePanelOpen) {
				panel.collapse()
			} else {
				panel.resize(35) // Expand to 35%
			}
			setIsCreatePanelOpen(!isCreatePanelOpen)
		}
	}

	return (
		<div className='flex h-[calc(100dvh-6rem)] w-full flex-col overflow-hidden bg-slate-50/50 font-sans'>
			{/* Header Area */}
			<div className='z-10 flex flex-none items-center justify-between border-b bg-white px-6 py-4 shadow-sm'>
				<div className='flex items-center gap-4'>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={isCreatePanelOpen ? 'secondary' : 'default'}
									size='icon'
									onClick={toggleCreatePanel}
									className={cn(
										'transition-all',
										isCreatePanelOpen
											? 'bg-slate-200 hover:bg-slate-300'
											: 'bg-indigo-600 hover:bg-indigo-700'
									)}
								>
									{isCreatePanelOpen ? (
										<PanelLeftClose className='h-5 w-5 text-slate-700' />
									) : (
										<PanelLeftOpen className='h-5 w-5' />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent side='right'>
								{isCreatePanelOpen ? 'Đóng bảng tạo đề tài' : 'Mở bảng tạo đề tài nhanh'}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>

					<div>
						<h1 className='text-xl font-bold tracking-tight text-slate-900'>Quản lý Đề tài</h1>
						<p className='mt-0.5 text-xs text-slate-500'>Học kỳ 1 - Năm học 2024-2025</p>
					</div>
				</div>

				<div className='flex items-center gap-2'>
					<Button variant='outline' size='sm' onClick={() => navigate('/manage-topics/draft')}>
						<FileText className='mr-2 h-4 w-4' /> Quản lý chi tiết
					</Button>
				</div>
			</div>

			{/* Main Resizable Layout */}
			<ResizablePanelGroup direction='horizontal' className='h-full flex-1'>
				{/* LEFT PANEL: CREATE TOPIC FORM */}
				<ResizablePanel
					ref={panelRef}
					defaultSize={30}
					collapsedSize={0}
					collapsible={true}
					minSize={0}
					maxSize={50}
					className={cn(
						'border-r bg-white transition-all duration-100 ease-in-out',
						isCreatePanelOpen ? 'opacity-100' : 'w-0 border-none opacity-0'
					)}
					onCollapse={() => setIsCreatePanelOpen(false)}
					onExpand={() => setIsCreatePanelOpen(true)}
				>
					<CreateTopic />
				</ResizablePanel>

				<ResizableHandle withHandle={isCreatePanelOpen} />

				{/* RIGHT PANEL: LIST & MANAGEMENT */}
				<ResizablePanel defaultSize={100} className='bg-slate-50/50'>
					<div className='h-full overflow-y-auto p-6'>
						<Tabs
							value={activeTab}
							onValueChange={(v) => setActiveTab(v as any)}
							className='w-full space-y-6'
						>
							<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
								<TabsList className='h-10 w-fit border bg-white p-1 shadow-sm'>
									<TabsTrigger
										value='draft'
										className='px-4 data-[state=active]:bg-slate-100 data-[state=active]:text-indigo-700'
									>
										Bản nháp
										{draftTopics?.meta.totalItems ? (
											<Badge
												variant='secondary'
												className='ml-2 h-5 bg-slate-200 px-1.5 text-slate-700'
											>
												{draftTopics.meta.totalItems}
											</Badge>
										) : null}
									</TabsTrigger>
									<TabsTrigger
										value='submitted'
										className='px-4 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700'
									>
										Đã nộp
										{submittedTopics?.meta.totalItems ? (
											<Badge
												variant='secondary'
												className='ml-2 h-5 bg-emerald-200 px-1.5 text-emerald-800'
											>
												{submittedTopics.meta.totalItems}
											</Badge>
										) : null}
									</TabsTrigger>
								</TabsList>

								<div className='relative w-full sm:w-72'>
									<Search className='absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
									<Input
										placeholder='Tìm kiếm...'
										className='border-slate-200 bg-white pl-9 focus-visible:ring-indigo-500'
										onChange={(e) => {
											const val = e.target.value
											if (activeTab === 'draft') setDraftQueries((p) => ({ ...p, query: val }))
											else setSubmittedQueries((p) => ({ ...p, query: val }))
										}}
									/>
								</div>
							</div>

							<TabsContent value='draft' className='mt-0 space-y-4'>
								{isDraftLoading ? (
									<div className='flex h-64 items-center justify-center'>
										<Loader2 className='h-8 w-8 animate-spin text-indigo-500' />
									</div>
								) : !draftTopics?.data.length ? (
									<EmptyState
										title='Không có bản nháp nào'
										description='Mở bảng bên trái để tạo đề tài mới.'
									/>
								) : (
									<>
										<div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
											{draftTopics.data.map((topic) => (
												<div>{topic.description}</div>
											))}
										</div>
										<CustomPagination
											meta={draftTopics.meta}
											onPageChange={(p) => setDraftQueries((prev) => ({ ...prev, page: p }))}
										/>
									</>
								)}
							</TabsContent>

							<TabsContent value='submitted' className='mt-0 space-y-4'>
								{isSubmittedLoading ? (
									<div className='flex h-64 items-center justify-center'>
										<Loader2 className='h-8 w-8 animate-spin text-emerald-500' />
									</div>
								) : !submittedTopics?.data.length ? (
									<EmptyState
										title='Chưa nộp đề tài nào'
										description='Vui lòng nộp đề tài từ danh sách nháp.'
									/>
								) : (
									<>
										<div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
											{submittedTopics.data.map((topic) => (
												<div>{topic.description}</div>
											))}
										</div>
										<CustomPagination
											meta={submittedTopics.meta}
											onPageChange={(p) => setSubmittedQueries((prev) => ({ ...prev, page: p }))}
										/>
									</>
								)}
							</TabsContent>
						</Tabs>
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	)
}

export default SubmitTopicInPeriod
