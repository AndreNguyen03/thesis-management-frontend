import { DataTable } from './DataTable'
import { getColumns } from './Columns'
import { useGetDraftTopicsQuery, useSubmitTopicMutation } from '@/services/topicApi'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { CreateTopic } from '../../new_topic'
import { Eye, Search } from 'lucide-react'
import { useCountdown } from '@/hooks/count-down'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button, Input } from '@/components/ui'
import { toast } from '@/hooks/use-toast'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useDebounce } from '@/hooks/useDebounce'

const ManageTopicDraft = () => {
	const [queries, setQueries] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 8,
		search_by: 'titleVN,titleEng,lecturerName',
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: 'all',
		filter_by: 'fieldIds'
	})
	const { data: draftTopics, refetch } = useGetDraftTopicsQuery(queries)

	const [topics, setTopics] = useState(draftTopics ? draftTopics.data : [])
	// search input handler
	const [searchTerm, setSearchTerm] = useState('')
	const setQuery = (query: string) => {
		setQueries((prev) => ({ ...prev, query }))
	}
	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })
	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}
	useEffect(() => {
		if (JSON.stringify(draftTopics) !== JSON.stringify(draftTopics?.data)) {
			setTopics(draftTopics ? draftTopics.data : [])
			setQueries((prev) => ({
				...prev,
				page: draftTopics ? draftTopics.meta.currentPage : 1
			}))
		}
	}, [draftTopics])
	const [showSelection, setShowSelection] = useState(false)
	//lấ thong tin của kì
	const currentPeriodId = localStorage.getItem('currentPeriodId')
	const currentPeriodName = localStorage.getItem('currentPeriodName')
	const currentPeriodEndTime = localStorage.getItem('currentPeriodEndTime')
	const countdown = useCountdown(currentPeriodEndTime ? new Date(currentPeriodEndTime) : null)
	const [submitTopic, { isLoading: isSubmitting, isSuccess: isSubmitSuccess, error: submitError }] =
		useSubmitTopicMutation()
	const navigate = useNavigate()

	const handleSubmitTopics = async (selectedTopics: any[]) => {
		await submitTopic({ topicId: selectedTopics[0]._id, periodId: currentPeriodId! })
		toast({
			title: 'Thành công',
			description: 'Bạn đã thực hiện thao tác thành công!',
			variant: 'success' // hoặc 'destructive'
		})
		setShowSelection(false)
		refetch()
	}
	const columns = getColumns({
		onSeeDetail: (topicId) => navigate(`/detail-topic/${topicId}`),
		showSelection
	})
	const data =
		draftTopics?.data.map((topic, index) => ({
			...topic,
			index: index + 1,
			time: {
				createdAt: topic.createdAt,
				updatedAt: topic.updatedAt
			}
		})) || []
	useEffect(() => {
		if (submitError) {
			toast({
				title: 'Thất bại',
				description: 'Đã có lỗi xảy ra, không thể nộp đề tài!',
				variant: 'destructive' // hoặc 'destructive'
			})
		}
	}, [submitError])
	return (
		<div className='h-screen'>
			<ResizablePanelGroup direction='vertical' className='rounded-lg border'>
				<ResizablePanel defaultSize={65}>
					<div className='flex w-fit flex-row items-center gap-2'>
						<h3 className='m-4 text-xl font-semibold'>Kho đề tài của bạn</h3>
						{currentPeriodId && (
							<>
								<div className='m-2 flex flex-col gap-2 rounded-md bg-blue-100 p-2 lg:flex-row'>
									<span className='font-semibold'>
										<span>{`Kì hiện tại: `}</span>
										{currentPeriodName}
									</span>
									<span className='ml-auto mr-4 font-normal'>
										Thời gian còn lại:{' '}
										<span className='font-semibold text-blue-700'>{countdown}</span>
									</span>
								</div>
								<Button variant={'active'} onClick={() => setShowSelection((prev) => !prev)}>
									{showSelection ? 'Ẩn chọn' : 'Chọn đề tài nộp'}
								</Button>
							</>
						)}
					</div>
					<div className='relative flex flex-1 items-center'>
						<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
						<Input
							placeholder='Tìm kiếm theo tên đề tài, giảng viên...'
							className='pl-10'
							value={searchTerm}
							onChange={(e) => onEdit(e.target.value)}
						/>
					</div>
					<div>
						<DataTable
							columns={columns}
							data={data}
							onSubmitSelected={handleSubmitTopics}
							showSelection={showSelection}
							isSubmitting={isSubmitting}
						/>
					</div>
				</ResizablePanel>
				<ResizableHandle>
					<Eye className='h-4 w-4 text-gray-500' />
				</ResizableHandle>

				<ResizablePanel defaultSize={35}>
					<CreateTopic refetchDraftTopics={refetch} />
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	)
}

export default ManageTopicDraft
