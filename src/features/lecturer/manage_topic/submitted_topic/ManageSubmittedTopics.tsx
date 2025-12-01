import { getColumns } from './Columns'
import {
	useGetSubmittedTopicsQuery,
	useSetAllowManualApprovalMutation,
	useWithdrawSubmittedTopicsMutation
} from '@/services/topicApi'
import { DataTable } from './DataTable'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { Loader2, RotateCw, Search } from 'lucide-react'
import { useState } from 'react'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useDebounce } from '@/hooks/useDebounce'

import { CustomPagination } from '@/components/PaginationBar'
import { toast } from 'sonner'
import { WithdrawConfirmation } from './modal/WIthdrawConfirmation'
import type { SubmittedTopic } from '@/models'

const ManageSubmittedTopics = () => {
	const navigate = useNavigate()
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
	const { data: submittedTopics, refetch, isLoading } = useGetSubmittedTopicsQuery(queries)
	const [searchTerm, setSearchTerm] = useState('')
	const setQuery = (query: string) => {
		setQueries((prev) => ({ ...prev, query }))
	}
	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })
	const onEdit = (val: string) => {
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
	const [selectedWithdrawTopics, setSelectedWithdrawTopics] = useState<SubmittedTopic[]>([])
	const [showSelection, setShowSelection] = useState(false)
	const handleWithdraw = async (topic?: SubmittedTopic) => {
		try {
			if (topic) {
				setSelectedWithdrawTopics([topic])
				setOpenWithdrawModal(true)
				return
			} else {
				await withdrawSubmittedTopics({ topicIds: selectedWithdrawTopics.map((topic) => topic._id) })
				setPendingWithdrawId(null)
				setOpenWithdrawModal(false)
				refetch()
			}
		} catch (err: any) {
			setOpenWithdrawModal(false)
			toast('Rút đề tài thất bại. Vui lòng thử lại sau.')
		}
	}

	const columns = getColumns({
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
		<div className='flex max-h-[740px] flex-col gap-4 px-4 py-2'>
			<div className='relative flex flex-1 items-center gap-5'>
				<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
				<Input
					placeholder='Tìm kiếm theo tên đề tài, giảng viên...'
					className='pl-10'
					value={searchTerm}
					onChange={(e) => onEdit(e.target.value)}
				/>
				<Button onClick={() => refetch()}>
					{' '}
					{isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <RotateCw className='h-4 w-4' />} Tải
					lại trang
				</Button>
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
						{showSelection ? 'Ẩn lựa chọn' : 'Hiển thị chọn nhi'}
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
