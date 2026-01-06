import { DataTable } from './DataTable'
import { getColumns } from './Columns'
import {
	useDeleteTopicsMutation,
	useGetDraftTopicsQuery,
	useSetAllowManualApprovalMutation,
	useSubmitTopicMutation
} from '@/services/topicApi'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui'
import { toast } from '@/hooks/use-toast'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useDebounce } from '@/hooks/useDebounce'
import { CustomPagination } from '@/components/PaginationBar'
import DeleteTopicModal from '../modal/delete-topic-modal'
import { CreateTopic2 } from '../../new_topic/new_topic'
import { CreateTopic } from '../../new_topic'

const ManageTopicDraft2 = () => {
	const [queries, setQueries] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 5,
		search_by: ['titleVN', 'titleEng', 'lecturerName'],
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: 'all',
		filter_by: ['fieldIds']
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
	const [showCreate, setShowCreate] = useState(false)
	const [showSelection, setShowSelection] = useState(false)
	const [openDeleteConfirmModal, setOpenDeleteConfirmModal] = useState(false)
	//lấ thong tin của kì
	//const { currentPeriods, isLoading } = useAppSelector((state) => state.period)
	const [submitTopic, { isLoading: isSubmitting, isSuccess: isSubmitSuccess, error: submitError }] =
		useSubmitTopicMutation()
	const navigate = useNavigate()
	const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null)
	const handleSubmitTopics = async (selectedTopics: any[]) => {
		await submitTopic({ topicId: selectedTopics[0]._id, periodId: selectedPeriodId! })
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
		<div className='h-full'>
			{!showCreate ? (
				<>
					<div className='flex flex-col gap-2 p-2'>
						<div className='flex w-fit flex-row items-center gap-2'>
							<h3 className='mx-2 text-xl font-semibold'>Kho đề tài của bạn</h3>
						</div>
						<div className='relative flex flex-1 items-center gap-4'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
							<Input
								placeholder='Tìm kiếm theo tên đề tài, giảng viên...'
								className='bg-white pl-10'
								value={searchTerm}
								onChange={(e) => onEdit(e.target.value)}
							/>

							<button
								onClick={() => setShowCreate(true)}
								className='whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90'
							>
								+ Tạo đề tài mới
							</button>
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
					<DeleteTopicModal
						open={openDeleteConfirmModal}
						onClose={() => setOpenDeleteConfirmModal(false)}
						onConfirm={() => handleDeleteTopics()}
						isLoading={false}
					/>
				</>
			) : (
				<CreateTopic2 refetchDraftTopics={refetch} onBack={() => setShowCreate(false)} />
			)}
		</div>
	)
}

export default ManageTopicDraft2
