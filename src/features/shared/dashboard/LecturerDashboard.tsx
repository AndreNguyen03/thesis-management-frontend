import { useAppSelector } from '@/store'
import { LecturerSubmissionCard } from './component/LecturerSubmissionCard'

export function LecturerDashboard() {
	const { currentPeriod } = useAppSelector((state) => state.period)
	return (
		<div className='min-h-screen w-full bg-gray-50 p-4'>
			{/* Tiêu đề */}
			<h1 className='mb-6 text-2xl font-bold text-gray-800'>Dashboard</h1>

			{/* --- KHU VỰC HIỂN THỊ ĐỢT NỘP (QUAN TRỌNG NHẤT) --- */}
			<div className='mb-8'>
				{currentPeriod && (
					<LecturerSubmissionCard period={currentPeriod} submittedCount={5} requiredCount={6} />
				)}
			</div>

			{/* Các phần khác của Dashboard (Menu nhanh, Thống kê...) */}
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{/* ... Render các thẻ menu "Đăng đề tài", "Quản lý"... như cũ */}
			</div>
		</div>
	)
}
