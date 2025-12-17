import { ROLES } from '@/models'
import PeriodCard from './partitions/PeriodCard'
import { FileText, Users } from 'lucide-react'
import { useAppSelector } from '@/store'

//sinh viên sẽ truy cập vào đây trong khi kỳ mở pha đăng ký
export const RegistrationPeriodsPage = () => {
	const periods = useAppSelector((state) => state.period.currentPeriods)

	const activePeriods = periods.filter((p) => p.status === 'active')
	const otherPeriods = periods.filter((p) => p.status !== 'active')
	const user = useAppSelector((state) => state.auth.user)
	//có hai loại card, 1 loại không làm gì được (non-action), 1 loại có thể thao tác (action)
	//render action theo role
	const renderActivePeriods = () => {
		//nếu là giảng viên
		if (user?.role === ROLES.LECTURER) {
			return (
				<>
					{activePeriods.length > 0 && (
						<section>
							<h2 className='mb-5 border-l-4 border-indigo-500 pl-3 text-2xl font-bold text-indigo-700'>
								Hoạt động ({activePeriods.length})
								<p className='mb-8 text-sm font-medium text-gray-600'>Các đợt đăng ký còn hiệu lực </p>
							</h2>

							<div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
								{activePeriods.map((p) => (
									<PeriodCard key={p._id} period={p} />
								))}
							</div>
						</section>
					)}

					{otherPeriods.length > 0 && (
						<section>
							<h2 className='mb-5 border-l-4 border-gray-400 pl-3 text-2xl font-bold text-gray-700'>
								Khác ({otherPeriods.length})
								<p className='mb-8 text-sm font-medium text-gray-600'>Các đợt đăng ký đã kết thúc/không còn hiệu lực </p>
							</h2>
							<div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
								{otherPeriods.map((p) => (
									<PeriodCard key={p._id} period={p} />
								))}
							</div>
						</section>
					)}
				</>
			)
		}
		return (
			<>
				{activePeriods.length > 0 && (
					<section>
						<h2 className='mb-5 border-l-4 border-indigo-500 pl-3 text-2xl font-bold text-indigo-700'>
							Đợt Đăng ký Đang Mở ({activePeriods.length})
						</h2>
						<div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
							{activePeriods.map((p) => (
								<PeriodCard key={p._id} period={p} />
							))}
						</div>
					</section>
				)}

				{otherPeriods.length > 0 && (
					<section>
						<h2 className='mb-5 border-l-4 border-gray-400 pl-3 text-2xl font-bold text-gray-700'>
							Các Đợt Khác (Đã/Chờ thực hiện) ({otherPeriods.length})
						</h2>
						<div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
							{otherPeriods.map((p) => (
								<PeriodCard key={p._id} period={p} />
							))}
						</div>
					</section>
				)}
			</>
		)
	}
	return (
		<div className='min-h-screen w-full bg-gray-100 p-8 font-sans'>
			<div className='mx-auto max-w-6xl'>
				<h1 className='mb-2 text-3xl font-bold text-gray-900'>Đợt đăng ký đề tài của khoa</h1>
				<p className='text-md mb-8 text-gray-600'>
					{user?.role === ROLES.STUDENT
						? 'Sinh viên: Chọn đợt đăng ký Khóa luận Tốt nghiệp hoặc Nghiên cứu Khoa học theo kế hoạch đào tạo.'
						: `Giảng viên: Xem và quản lý các đợt Khóa luận/NCKH của khoa, thực hiện các nhiệm vụ như: nộp đề tài, theo dõi trạng thái của kì, xem danh sách đề tài của mình	`}
				</p>

				<div className='space-y-12'>
					{renderActivePeriods()}
					{periods.length === 0 && (
						<div className='rounded-xl border-2 border-dashed bg-white py-20 text-center text-gray-500 shadow-lg'>
							<FileText className='mx-auto mb-3 h-10 w-10 text-gray-400' />
							<p className='text-lg font-medium'>
								Hiện tại không có đợt đề tài nào được mở cho sinh viên
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
