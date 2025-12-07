import { DataTable } from './DataTable'
import { getColumns } from './Columns'
import {
	useDeleteTopicsMutation,
	useGetDraftTopicsQuery,
	useSetAllowManualApprovalMutation,
	useSubmitTopicMutation
} from '@/services/topicApi'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { CreateTopic } from '../../new_topic'
import { Eye, Pointer, Search, X } from 'lucide-react'
import { useCountdown } from '@/hooks/count-down'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button, Input } from '@/components/ui'
import { toast } from '@/hooks/use-toast'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useDebounce } from '@/hooks/useDebounce'
import { CustomPagination } from '@/components/PaginationBar'
import { useAppSelector } from '@/store'
import DeleteTopicModal from '../modal/delete-topic-modal'

const ManageTopicDraft = () => {
	const [queries, setQueries] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 5,
		search_by: 'titleVN,titleEng,lecturerName',
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: 'all',
		filter_by: 'fieldIds'
	})
	const { data: draftTopics, refetch } = useGetDraftTopicsQuery({ queries })

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
	const [selectedTopicId, setSelectedTopicId] = useState<string[] | null>(null)

	const [showSelection, setShowSelection] = useState(false)
	const [openDeleteConfirmModal, setOpenDeleteConfirmModal] = useState(false)
	//lấ thong tin của kì
	const { currentPeriod, isLoading } = useAppSelector((state) => state.period)
	const countdown = useCountdown(currentPeriod?.endTime ? new Date(currentPeriod.endTime) : null)
	const [submitTopic, { isLoading: isSubmitting, isSuccess: isSubmitSuccess, error: submitError }] =
		useSubmitTopicMutation()
	const navigate = useNavigate()

	const handleSubmitTopics = async (selectedTopics: any[]) => {
		await submitTopic({ topicId: selectedTopics[0]._id, periodId: currentPeriod?._id! })
		toast({
			title: 'Thành công',
			description: 'Bạn đã thực hiện thao tác thành công!',
			variant: 'success' // hoặc 'destructive'
		})
		setShowSelection(false)
		refetch()
	}
	const [pendingId, setPendingId] = useState<string | null>(null)

	// Thay đổi cờ allowManualApproval
	const [setAllowManualApproval] = useSetAllowManualApprovalMutation()
	const handleManualApprovalChange = async (checked: boolean, topicId: string) => {
		try {
			await setAllowManualApproval({ topicId, allow: checked })
			refetch()
		} catch {
			toast({ title: 'Thất bại', description: 'Có lỗi xảy ra!', variant: 'destructive' })
		} finally {
			setPendingId(null)
		}
	}
	const [deleteTopics] = useDeleteTopicsMutation()
	const handleDeleteTopics = async () => {
		if (!selectedTopicId || selectedTopicId.length === 0) return
		try {
			await deleteTopics({ topicIds: selectedTopicId }).unwrap()
			toast({
				title: 'Thành công',
				description: 'Xóa đề tài thành công!',
				variant: 'success'
			})
			refetch()
		} catch (error) {
			toast({
				title: 'Thất bại',

				description: 'Xóa đề tài thất bại. Vui lòng thử lại sau.',
				variant: 'destructive'
			})
		}
		setOpenDeleteConfirmModal(false)
		setSelectedTopicId(null)
	}
	const handleOpenDeleteConfirmModal = (topicId: string) => {
		setOpenDeleteConfirmModal(true)
		setSelectedTopicId([topicId])
	}
	const columns = getColumns({
		onSeeDetail: (topicId) => navigate(`/detail-topic/${topicId}`),
		showSelection,
		onManualApprovalChange: handleManualApprovalChange,
		pendingId,
		handleDeleteConfirmModal: handleOpenDeleteConfirmModal
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
		<div className='h-screen max-h-[740px] p-2'>
			<ResizablePanelGroup direction='vertical' className='h-full rounded-lg border'>
				<ResizablePanel defaultSize={65}>
					<div className='flex flex-col gap-2 p-2'>
						<div className='flex w-fit flex-row items-center gap-2'>
							<h3 className='m-4 text-xl font-semibold'>Kho đề tài của bạn</h3>
							{currentPeriod && (
								<>
									<div className='m-2 flex flex-col gap-2 rounded-md bg-blue-100 p-2 lg:flex-row'>
										<span className='font-semibold'>
											<span>{`Kì hiện tại: ${currentPeriod.name}`}</span>
										</span>
										<span className='ml-auto mr-4 font-normal'>
											Thời gian còn lại:{' '}
											<span className='font-semibold text-blue-700'>{countdown}</span>
										</span>
									</div>
									<Button
										disabled={!(draftTopics && draftTopics.data.length > 0)}
										variant={'active'}
										onClick={() => setShowSelection((prev) => !prev)}
									>
										{showSelection ? <X /> : <Pointer />}
										{showSelection ? 'Bỏ chọn' : 'Chọn đề tài nộp'}
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
						<div className='min-h-0 flex-1'>
							<DataTable
								columns={columns}
								data={data}
								onSubmitSelected={handleSubmitTopics}
								showSelection={showSelection}
								isSubmitting={isSubmitting}
							/>
						</div>
						{draftTopics?.meta && draftTopics.meta.totalPages > 1 && (
							<CustomPagination
								meta={draftTopics.meta}
								onPageChange={(p) => setQueries((prev) => ({ ...prev, page: p }))}
							/>
						)}
					</div>
				</ResizablePanel>
				<ResizableHandle withHandle />

				<ResizablePanel defaultSize={35} className='pt-2'>
					<CreateTopic refetchDraftTopics={refetch} />
				</ResizablePanel>
			</ResizablePanelGroup>
			<DeleteTopicModal
				open={openDeleteConfirmModal}
				onClose={() => setOpenDeleteConfirmModal(false)}
				onConfirm={() => handleDeleteTopics()}
				isLoading={false}
			/>
		</div>
	)
}

export default ManageTopicDraft
