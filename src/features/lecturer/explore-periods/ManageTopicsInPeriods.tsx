import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Badge, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { CustomPagination } from '@/components/PaginationBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetTopicsInPhaseQuery, useLecturerGetTopicsInPhaseQuery } from '@/services/topicApi'
import {
	topicStatusLabels,
	type ApiError,
	type GeneralTopic,
	type PaginationLecturerGetTopicsInPhaseParams,
	type PaginationTopicsQueryParams,
	type Topic
} from '@/models'
import { PhaseInfo } from '@/utils/utils'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
	Loader2,
	XCircle,
	Eye,
	Edit,
	Users,
	BookOpen,
	Calendar,
	GraduationCap,
	Check,
	Circle,
	ChevronRight
} from 'lucide-react'
//cần được bảo vệ bởi role giảng viên
const ManageTopicsInPeriods = () => {
	const { periodId } = useParams<{ periodId: string }>()
	const navigate = useNavigate()
	const [queryParams, setQueryParams] = useState<PaginationLecturerGetTopicsInPhaseParams>({
		page: 1,
		limit: 10,
		search_by: ['titleVN', 'titleEng'],
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		status: 'all'
	})

	const [searchTerm, setSearchTerm] = useState('')

	const setQuery = (query: string) => {
		setQueryParams((prev) => ({ ...prev, query }))
	}

	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })

	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}

	const {
		data: topicsData,
		isLoading,
		error
	} = useLecturerGetTopicsInPhaseQuery(
		{
			periodId: periodId!,
			params: queryParams
		},
		{ skip: !periodId }
	)

	const [topics, setTopics] = useState<GeneralTopic[] | undefined>()

	useEffect(() => {
		if (topicsData) {
			setTopics(topicsData.data)
		}
	}, [topicsData])

	// Định nghĩa các phase để hiển thị progress
	const allPhases = [
		{ phase: 'submit_topic', label: PhaseInfo.submit_topic.label },
		{ phase: 'open_registration', label: PhaseInfo.open_registration.label },
		{ phase: 'execution', label: PhaseInfo.execution.label },
		{ phase: 'completion', label: PhaseInfo.completion.label }
	]

	const getPhaseIndex = (phase: string) => {
		return allPhases.findIndex((p) => p.phase === phase)
	}

	return (
		<>
			<Button variant='outline' size='sm' onClick={() => navigate(-1)} className='mb-4'>
				<ChevronRight className='mr-2 h-4 w-4 rotate-180' />
				Quay lại
			</Button>
			<div className='container mx-auto px-4 py-6'>
				<div className='mb-6'>
					<h1 className='text-3xl font-bold text-gray-900'>Quản lý Đề tài trong Kỳ</h1>
					<p className='mt-2 text-sm text-gray-600'>Theo dõi và quản lý các đề tài đã nộp trong kỳ học</p>
				</div>

				{/* Filters & Search */}
				<div className='mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center'>
					<Input
						placeholder='Tìm kiếm theo tên đề tài...'
						value={searchTerm}
						onChange={(e) => onEdit(e.target.value)}
						className='w-full border-gray-300 sm:w-96'
					/>

					<div className='flex items-center gap-3'>
						<Select
							onValueChange={(newValue) => {
								setQueryParams((prev) => ({ ...prev, phase: newValue }))
							}}
						>
							<SelectTrigger className='w-48 border-gray-300'>
								<SelectValue placeholder='Lọc theo pha' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Tất cả các pha</SelectItem>
								<SelectItem value='submit_topic'>Nộp đề tài</SelectItem>
								<SelectItem value='open_registration'>Mở đăng ký</SelectItem>
								<SelectItem value='execution'>Thực hiện</SelectItem>
								<SelectItem value='completion'>Hoàn thành</SelectItem>
							</SelectContent>
						</Select>

						<Select
							onValueChange={(newValue) => {
								setQueryParams((prev) => ({ ...prev, status: newValue }))
							}}
						>
							<SelectTrigger className='w-48 border-gray-300'>
								<SelectValue placeholder='Lọc theo trạng thái' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Tất cả trạng thái</SelectItem>
								<SelectItem value='draft'>Bản nháp</SelectItem>
								<SelectItem value='submitted'>Đã nộp</SelectItem>
								<SelectItem value='under_review'>Đang xét duyệt</SelectItem>
								<SelectItem value='approved'>Đã duyệt</SelectItem>
								<SelectItem value='rejected'>Bị từ chối</SelectItem>
								<SelectItem value='pending_registration'>Mở đăng ký</SelectItem>
								<SelectItem value='registered'>Đã có đăng ký</SelectItem>
								<SelectItem value='in_progress'>Đang thực hiện</SelectItem>
								<SelectItem value='graded'>Đã chấm điểm</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Topics Grid */}
				<div className='space-y-4'>
					{isLoading && (
						<div className='flex flex-col items-center justify-center py-20'>
							<Loader2 className='h-12 w-12 animate-spin text-blue-500' />
							<span className='mt-4 text-gray-500'>Đang tải dữ liệu...</span>
						</div>
					)}

					{error && (
						<div className='flex flex-col items-center justify-center py-20'>
							<XCircle className='h-12 w-12 text-red-500' />
							<span className='mt-4 text-gray-500'>
								{(error as ApiError).data?.message || 'Đã có lỗi xảy ra khi tải dữ liệu'}
							</span>
						</div>
					)}

					{!isLoading && !error && topics?.length === 0 && (
						<div className='py-20'>
							<EmptyState
								title='Không có đề tài nào'
								description='Chưa có đề tài nào được nộp trong kỳ này'
							/>
						</div>
					)}

					{!isLoading && !error && topics && topics.length > 0 && (
						<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
							{topics.map((topic) => {
								const currentPhaseIndex = getPhaseIndex(topic.currentPhase)
								const statusInfo =
									topicStatusLabels[topic.currentStatus as keyof typeof topicStatusLabels]

								return (
									<motion.div
										key={topic._id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										className='flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md'
									>
										{/* Header with Status Badge */}
										<div className='mb-3 flex items-start justify-between'>
											<Badge className={cn('text-xs font-semibold', statusInfo.css)}>
												{statusInfo.name}
											</Badge>
											<BookOpen className='h-5 w-5 text-indigo-600' />
										</div>

										{/* Topic Title */}
										<h3 className='mb-2 line-clamp-2 text-lg font-bold text-gray-900'>
											{topic.titleVN}
										</h3>

										{/* Topic Info */}
										<div className='mb-4 space-y-2 text-sm text-gray-600'>
											<div className='flex items-center gap-2'>
												<GraduationCap className='h-4 w-4 text-gray-400' />
												<span className='truncate'>{topic.major.name}</span>
											</div>
											<div className='flex items-center gap-2'>
												<Users className='h-4 w-4 text-gray-400' />
												<span>
													{topic.students?.approvedStudents.length || 0}/{topic.maxStudents}{' '}
													sinh viên
												</span>
											</div>
											<div className='flex items-center gap-2'>
												<Calendar className='h-4 w-4 text-gray-400' />
												<span>{new Date(topic.createdAt).toLocaleDateString('vi-VN')}</span>
											</div>
										</div>

										{/* Phase Progress Bar */}
										<div className='mb-4 border-t border-gray-100 pt-4'>
											<div className='mb-2 text-xs font-semibold text-gray-700'>
												Tiến độ thực hiện
											</div>
											<div className='flex items-center justify-between'>
												{allPhases.map((phase, index) => {
													const isCompleted = currentPhaseIndex > index
													const isActive = currentPhaseIndex === index
													const isPending = currentPhaseIndex < index

													return (
														<div
															key={phase.phase}
															className='relative flex flex-1 flex-col items-center'
														>
															{/* Phase Circle */}
															<div
																className={cn(
																	'z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all',
																	isCompleted && 'border-green-500 bg-green-500',
																	isActive && 'border-indigo-600 bg-indigo-600',
																	isPending && 'border-gray-300 bg-white'
																)}
															>
																{isCompleted ? (
																	<Check className='h-3 w-3 text-white' />
																) : isActive ? (
																	<Circle className='h-3 w-3 fill-white text-white' />
																) : (
																	<Circle className='h-3 w-3 text-gray-400' />
																)}
															</div>

															{/* Connecting Line */}
															{index < allPhases.length - 1 && (
																<div className='absolute left-1/2 top-3 h-0.5 w-full'>
																	<div className='h-full w-full bg-gray-200'>
																		<div
																			className={cn(
																				'h-full transition-all',
																				isCompleted
																					? 'w-full bg-green-500'
																					: 'w-0'
																			)}
																		/>
																	</div>
																</div>
															)}
														</div>
													)
												})}
											</div>
											<div className='mt-2 text-center text-xs text-gray-500'>
												{PhaseInfo[topic.currentPhase as keyof typeof PhaseInfo]?.label ||
													topic.currentPhase}
											</div>
										</div>

										{/* Lecturers */}
										{topic.lecturers && topic.lecturers.length > 0 && (
											<div className='mb-4 text-xs text-gray-600'>
												<span className='font-semibold'>Giảng viên HD:</span>{' '}
												{topic.lecturers.map((l) => l.fullName).join(', ')}
											</div>
										)}

										{/* Actions */}
										<div className='mt-auto flex items-center gap-2 border-t border-gray-100 pt-4'>
											<Button
												variant='outline'
												size='sm'
												className='flex-1'
												onClick={() => navigate(`/topics/${topic._id}`)}
											>
												<Eye className='mr-1 h-4 w-4' />
												Xem chi tiết
											</Button>
											<Button
												variant='default'
												size='sm'
												className='flex-1 bg-indigo-600 hover:bg-indigo-700'
												onClick={() => navigate(`/topics/${topic._id}/edit`)}
											>
												<Edit className='mr-1 h-4 w-4' />
												Chỉnh sửa
											</Button>
										</div>
									</motion.div>
								)
							})}
						</div>
					)}

					{/* Pagination */}
					{topicsData?.meta && topicsData.meta.totalPages > 1 && (
						<div className='mt-6'>
							<CustomPagination
								meta={topicsData.meta}
								onPageChange={(p) => setQueryParams((prev) => ({ ...prev, page: p }))}
							/>
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default ManageTopicsInPeriods
