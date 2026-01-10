import { FilterBar } from './components/FilterBar'
import { TopicList } from './components/TopicList'
import type { RejectPayload } from './types'
import { RejectStudentDialog } from './components/RejectStudentDialog'
import { usePageBreadcrumb } from '@/hooks'
import { useEffect, useState } from 'react'
import { useGetTopicApprovalRegistrationQuery } from '@/services/topicApi'
import { useGetAllMiniPeriodInfoQuery, useGetCurrentPeriodsQuery } from '@/services/periodApi'
import type { ApprovalTopicQueryParams, LecturerProfile, QueryReplyRegistration, StudentRegistration } from '@/models'
import { ManageApproveRegistrationSkeleton } from './utils/Skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { PeriodPhaseName } from '@/models/period.model'
import { RegistrationStatus } from '@/features/student/TopicList/utils/registration'
import { toast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/utils/catch-error'
import { useReplyRegistrationMutation } from '@/services/registrationApi'
import { socketService } from '@/services/socket.service'
import { useAppSelector } from '@/store'

export function ManageApproveRegistration() {
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Xét duyệt đăng kí' }])

	const [periodId, setPeriodId] = useState<string>('')
	const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null)
	const [rejectingStudent, setRejectingStudent] = useState<RejectPayload | null>(null)
	const [currentTab, setCurrentTab] = useState<'thesis' | 'scientific_research'>('thesis')
	const [searchTerm, setSearchTerm] = useState('')

	const [queryParams, setQueryParams] = useState<ApprovalTopicQueryParams>({
		limit: 10,
		page: 1,
		sort_by: 'titleVN',
		search_by: ['titleVN'],
		allowManualApproval: 'all',
		type: currentTab,
		onlyPending: 'all',
		periodId: '',
		query: '' // Thêm field query để sync search
	})

	const { data: topicApprovalRegistrationData, isLoading: topicLoading, refetch } =
		useGetTopicApprovalRegistrationQuery(queryParams)

	console.log(topicApprovalRegistrationData)

	const { data: allMiniPeriodInfo, isLoading: periodInfoLoading } = useGetAllMiniPeriodInfoQuery({
		type: currentTab,
		status: 'all'
	})

	const { data: currentPeriod, isLoading: periodLoading } = useGetCurrentPeriodsQuery()

	const userId = useAppSelector((state) => (state.auth.user as LecturerProfile)?.userId)


	useEffect(() => {
		if (!userId) return
		socketService.connect(userId, '/period')

		const cleanup = socketService.on('/period', 'periodDashboard:update', () => {
			console.log('Received periodDashboard:update event, refetching lecturer dashboard data...')
			refetch()
		})

		return () => {
			cleanup()
			socketService.disconnect('/period')
		}
	}, [userId, refetch])

	useEffect(() => {
		if ((allMiniPeriodInfo?.data?.length ?? 0) > 0 && !periodId && allMiniPeriodInfo) {
			const initialPeriod = allMiniPeriodInfo.data[0]
			setPeriodId(initialPeriod._id)
		}
	}, [allMiniPeriodInfo, periodId])

	console.log('currentPeriod , period id :::', currentPeriod, periodId)

	// readonly neu la ky hien tai khong phai la dang ki hoặc là khác kì hiện tại
	const isReadOnly =
		currentPeriod?.filter((p) => p._id === periodId && p.currentPhaseDetail.status !== 'active').length === 1

	// readonly dung de test
	// const isReadOnly = false

	// lecturer action approve, reject
	const [rejectModalOpen, setRejectModalOpen] = useState(false)
	const [selectedStudentRequest, setSelectedStudentRequest] = useState<StudentRegistration>({} as StudentRegistration)
	//hàm chấp nhận yêu cầu đăng ký của sinh viên
	const [replyRegistration, { isError: isErrorRegistration }] = useReplyRegistrationMutation()
	// State form từ chối

	const handleApprove = async (registrationId: string) => {
		const replyPayload: QueryReplyRegistration = {
			status: RegistrationStatus.APPROVED,
			lecturerResponse: 'Chúc mừng bạn đã được duyệt vào đề tài!'
		}
		// Call API Approve
		await replyRegistration({ registrationId: registrationId, body: replyPayload })
		if (isErrorRegistration) {
			toast({
				variant: 'destructive',
				title: 'Lỗi',
				description: getErrorMessage(isErrorRegistration)
			})
		} else {
			toast({
				variant: 'success',
				title: 'Duyệt thành công!'
			})
		}
	}

	const handleOpenReject = (student: StudentRegistration) => {
		setSelectedStudentRequest(student)
		setRejectModalOpen(true)
	}
	//

	// Hàm xử lý thay đổi tab - đây chính là onTabChange
	const handleTabChange = (tab: 'thesis' | 'scientific_research') => {
		setCurrentTab(tab)
		setPeriodId('') // Reset để load periods mới
		// Reset search và page
		setSearchTerm('')
		setQueryParams((prev) => ({ ...prev, type: tab, page: 1 }))
	}

	const setQuery = (query: string) => {
		setQueryParams((prev) => ({ ...prev, query, page: 1 }))
	}

	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })

	const onSearch = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}

	const handlePeriodChange = (newPeriodId: string) => {
		setPeriodId(newPeriodId)
		setQueryParams((prev) => ({ ...prev, periodId: newPeriodId, page: 1 }))
	}

	if (topicLoading || periodInfoLoading || periodLoading) return <ManageApproveRegistrationSkeleton />

	return (
		<div className='w-full space-y-6 p-4'>
			<p className='text-2xl font-semibold'>Xét duyệt đăng kí</p>
			<FilterBar
				periodId={periodId}
				searchTerm={searchTerm}
				onPeriodChange={handlePeriodChange}
				onSearchChange={onSearch}
				isReadOnly={isReadOnly}
				currentTab={currentTab}
				onTabChange={handleTabChange}
				periodInfo={allMiniPeriodInfo?.data || []}
			/>

			<TopicList
				topics={topicApprovalRegistrationData?.data || []}
				expandedTopicId={expandedTopicId}
				onToggleExpand={setExpandedTopicId}
				isReadOnly={isReadOnly}
				onReject={handleOpenReject}
				isLoading={topicLoading}
				onApprove={handleApprove}
			/>

			<RejectStudentDialog
				student={selectedStudentRequest}
				open={rejectModalOpen}
				onRejectModalOpen={(val) => setRejectModalOpen(val)}
			/>
		</div>
	)
}
