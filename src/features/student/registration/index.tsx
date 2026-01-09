import { ROLES } from '@/models'
import { FileText } from 'lucide-react'
import { useAppSelector } from '@/store'
import PeriodCard from './partitions/PeriodCard'
import { useGetCurrentPeriodsQuery } from '@/services/periodApi'
import { LoadingOverlay } from '@/components/ui'


// sinh viên sẽ truy cập vào đây trong khi kỳ mở pha đăng ký
export const RegistrationPeriodsPage = () => {
	const user = useAppSelector((state) => state.auth.user)
	// 👉 LẤY DATA TỪ RTK QUERY (CACHE)
	const {
		data: periods = [],
		isLoading,
		isFetching,
	} = useGetCurrentPeriodsQuery(undefined, {
		refetchOnMountOrArgChange: true,
		refetchOnFocus: true
	})
	// const [isRecommendOpen, setIsRecommendOpen] = useState(false)
	// ⛔ chưa có data thì không xử lý gì hết
	if (isLoading) {
		return <LoadingOverlay />
	}

	const activePeriods = periods.filter((p) => p.status === 'active')
	const otherPeriods = periods.filter((p) => p.status !== 'active')

	const renderActivePeriods = () => {
		if (user?.role === ROLES.LECTURER) {
			return (
				<>
					{activePeriods.length > 0 && (
						<section>
							<h2 className='mb-5 border-l-4 border-indigo-500 text-2xl font-bold text-indigo-700'>
								Hoạt động ({activePeriods.length})
								<p className='mb-8 text-sm font-medium text-gray-600'>Các đợt đăng ký còn hiệu lực</p>
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
								<p className='mb-8 text-sm font-medium text-gray-600'>
									Các đợt đăng ký đã kết thúc/không còn hiệu lực{' '}
								</p>
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

		// 🎓 STUDENT
		return (
			<>
				{activePeriods.length > 0 && (
					<section>
						<h2 className='mb-5 border-l-4 border-indigo-500 pl-3 text-2xl font-bold text-indigo-700'>
							Học kỳ / đợt đăng ký đang mở ({activePeriods.length})
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
							Các đợt khác ({otherPeriods.length})
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
		<div className='min-h-screen w-full bg-gray-100 pt-10 font-sans'>
			<div className='mx-auto max-w-6xl'>
				<h1 className='mb-2 text-3xl font-bold text-gray-900'>Đợt đăng ký đề tài của khoa</h1>

				<p className='mb-8 text-gray-600'>
					{user?.role === ROLES.STUDENT
						? 'Sinh viên: Chọn đợt đăng ký Khóa luận hoặc NCKH theo kế hoạch đào tạo.'
						: 'Giảng viên: Quản lý các đợt Khóa luận / NCKH của khoa.'}
				</p>

				<div className='space-y-12'>
					{renderActivePeriods()}

					{periods.length === 0 && !isFetching && (
						<div className='rounded-xl border-2 border-dashed bg-white py-20 text-center text-gray-500 shadow-lg'>
							<FileText className='mx-auto mb-3 h-10 w-10 text-gray-400' />
							<p className='text-lg font-medium'>Hiện tại không có đợt đề tài nào được mở</p>
						</div>
					)}
				</div>
				{/* Recommendation Panel
				<RecommendationPanel
					isOpen={isRecommendOpen}
					onClose={() => setIsRecommendOpen(false)}
					periodId={'6942e014a9da33dcf05b24f4'}
				/>

				{/* Floating Button */}
				{/* <RecommendationButton onClick={() => setIsRecommendOpen(true)} isOpen={isRecommendOpen} /> */}
			</div>
		</div>
	)
}
