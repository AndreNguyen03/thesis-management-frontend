import { getColumns } from './Columns'
import {
	useCopyToDraftMutation,
	useGetSubmittedTopicsQuery,
	useSetAllowManualApprovalMutation,
	useWithdrawSubmittedTopicsMutation
} from '@/services/topicApi'
import { DataTable } from './DataTable'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { Loader2, RotateCw, Search } from 'lucide-react'
import { useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { CustomPagination } from '@/components/PaginationBar'
import { toast } from 'sonner'
import { WithdrawConfirmation } from './modal/WIthdrawConfirmation'
import type { PaginatedSubmittedTopics, SubmittedTopic, SubmittedTopicParamsDto } from '@/models'

const ManageSubmittedTopics = ({ dataInernal }: { dataInernal?: PaginatedSubmittedTopics }) => {
	const navigate = useNavigate()
	const [queries, setQueries] = useState<SubmittedTopicParamsDto>({
		page: 1,
		limit: 5,
		search_by: ['titleVN', 'titleEng', 'lecturerName'],
		query: '',
		sort_by: 'submittedAt',
		sort_order: 'desc',
		filter: undefined,
		filter_by: 'fieldIds'
	})
	const {
		data: submittedTopicsData,
		refetch,
		isLoading
	} = useGetSubmittedTopicsQuery(queries, { skip: !!dataInernal })
	const submittedTopics = dataInernal || submittedTopicsData
	const [searchTerm, setSearchTerm] = useState('')
	const setQuery = (query: string) => {
		setQueries((prev) => ({ ...prev, query }))
	}
	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })
	const onEdit = (val: string) => {
		console.log(val)
		setSearchTerm(val)
		debounceOnChange(val)
	}
	// Thay đổi cờ allowManualApproval
	const [setAllowManualApproval] = useSetAllowManualApprovalMutation()
	const handleManualApprovalChange = async (checked: boolean, topicId: string) => {
		try {
			await setAllowManualApproval({ topicId, allow: checked })
			refetch()
		} catch {
			toast('Đã có lỗi xảy ra, vui lòng thử lại sau.')
		} finally {
			setPendingId(null)
		}
	}
	const [openWithdrawModal, setOpenWithdrawModal] = useState(false)
	const [withdrawSubmittedTopics, { isLoading: isWithdrawing }] = useWithdrawSubmittedTopicsMutation()
	const [pendingWithdrawId, setPendingWithdrawId] = useState<string | null>(null)
	const [pendingId, setPendingId] = useState<string | null>(null)
	const [pendingCopyId, setPendingCopyId] = useState<string | null>(null)
	const [selectedWithdrawTopics, setSelectedWithdrawTopics] = useState<SubmittedTopic[]>([])
	const [showSelection, setShowSelection] = useState(false)
	const [copyToDraftMutation] = useCopyToDraftMutation()

	const handleWithdraw = async (topic?: SubmittedTopic) => {
		console.log('withdrawing topic:', topic)
		try {
			if (topic) {
				setSelectedWithdrawTopics([topic])
				setOpenWithdrawModal(true)
			} else {
				await withdrawSubmittedTopics({ topicIds: selectedWithdrawTopics.map((topic) => topic._id) })
				setPendingWithdrawId(null)
				setOpenWithdrawModal(false)
				refetch()
			}
		} catch (err: any) {
			console.log('Withdraw error:', err)
			setOpenWithdrawModal(false)
			toast('Rút đề tài thất bại. Vui lòng thử lại sau.')
		}
	}
	const handleCopyTodraft = async (topic: SubmittedTopic) => {
		try {
			setPendingCopyId(topic._id)
			await copyToDraftMutation({ topicId: topic._id })
			setTimeout(() => {
				setPendingCopyId(null)
				toast('Sao chép đề tài thành công vào bản nháp.')
			}, 1000)
		} catch (err: any) {
			setPendingCopyId(null)
			toast('Sao chép đề tài thất bại. Vui lòng thử lại sau.')
		}
	}
	// const isAbleInSubmitPhase =
	// 	currentPeriod?.currentPhaseDetail.phase === PeriodPhaseName.SUBMIT_TOPIC &&
	// 	currentPeriod.currentPhaseDetail.status === PeriodPhaseStatus.ACTIVE
	const columns = getColumns({
		onCopyToDraft: handleCopyTodraft,
		pendingCopyId,
		onSeeDetail: (topicId) => navigate(`/detail-topic/${topicId}`),
		showSelection: showSelection,
		onManualApprovalChange: handleManualApprovalChange,
		pendingId,
		pendingWithdrawId,
		onWithdraw: handleWithdraw
	})
	const data =
		submittedTopics?.data.map((topic, index) => ({
			...topic,
			index: index + 1
		})) || []

	return (
		<div className='flex flex-col gap-4 px-4 py-2'>
			<div className='relative flex flex-1 items-center gap-5'>
				{!dataInernal && (
					<>
						<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
						<Input
							placeholder='Tìm kiếm theo tên đề tài, giảng viên...'
							className='bg-white pl-10'
							value={searchTerm}
							onChange={(e) => onEdit(e.target.value)}
						/>
						<Button onClick={() => refetch()}>
							{' '}
							{isLoading ? (
								<Loader2 className='h-4 w-4 animate-spin' />
							) : (
								<RotateCw className='h-4 w-4' />
							)}{' '}
							Tải lại trang
						</Button>
					</>
				)}
				{showSelection && (
					<>
						<Button
							variant='destructive'
							disabled={selectedWithdrawTopics.length === 0}
							onClick={() => setOpenWithdrawModal(true)}
						>
							Rút {selectedWithdrawTopics.length} đề tài
						</Button>
					</>
				)}
				{/* Khi mà có record có thể ứng dụng nhiều selection cùng lúc */}
				{/* Tồn tại đề tài có trạng thái là "đã nộp" */}
				{submittedTopics && submittedTopics.data.some((topic) => topic.currentStatus === 'submitted') && (
					<Button
						onClick={() => {
							setShowSelection((prev) => !prev)
						}}
					>
						{showSelection ? 'Ẩn lựa chọn' : 'Chọn nhiều'}
					</Button>
				)}
			</div>
			<DataTable
				columns={columns}
				data={data}
				isLoading={isLoading}
				onChangeSelectedTopicIds={setSelectedWithdrawTopics}
			/>
			{submittedTopics?.meta && submittedTopics.meta.totalPages > 1 && (
				<CustomPagination
					meta={submittedTopics.meta}
					onPageChange={(p) => setQueries((prev) => ({ ...prev, page: p }))}
				/>
			)}
			<WithdrawConfirmation
				isWithdrawing={isWithdrawing}
				onWithdraw={() => handleWithdraw()}
				amounts={selectedWithdrawTopics.length}
				onClose={() => setOpenWithdrawModal(false)}
				open={openWithdrawModal}
			/>
		</div>
	)
}

export default ManageSubmittedTopics
