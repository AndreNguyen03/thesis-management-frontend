import { Badge } from '@/components/ui'
import { ROLES } from '@/models'
import { getPhaseStatus, statusMap, type GetCurrentPeriod, PeriodPhaseName } from '@/models/period.model'
import { store, useAppDispatch, useAppSelector } from '@/store'
import { Calendar, ChevronRight, Clock, Eye, FileText, FlaskConical, Users, Check, Circle } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PhaseInfo } from '@/utils/utils'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
export interface PeriodCardProps {
	period: GetCurrentPeriod
}
const PeriodCard: React.FC<PeriodCardProps> = ({ period }) => {
	const navigate = useNavigate()
	const { label, variant, icon: StatusIcon, color } = getPhaseStatus(period.currentPhaseDetail.phase)
	const PeriodIcon = period.type === 'thesis' ? FileText : FlaskConical
	const user = useAppSelector((state) => state.auth.user)
	// Define all phases in order
	const allPhases = [
		{ phase: 'submit_topic', label: PhaseInfo.submit_topic.label },
		{ phase: 'open_registration', label: PhaseInfo.open_registration.label },
		{ phase: 'execution', label: PhaseInfo.execution.label },
		{ phase: 'completion', label: PhaseInfo.completion.label }
	]

	const currentPhaseIndex = allPhases.findIndex((p) => p.phase === period.currentPhaseDetail.phase)
	const progressPercentage =
		period.currentPhaseDetail.phase === 'empty' ? 0 : ((currentPhaseIndex + 1) / allPhases.length) * 100
	// --- LOGIC QUAN TRỌNG: Xử lý nút và trạng thái ---
	const isStudentActive = user?.role === ROLES.STUDENT

	const isLecturerActive = user?.role === ROLES.LECTURER
	const isActive = isStudentActive || isLecturerActive
	// Lecturer

	// `/registration/${period._id}/submit-topics`
	let buttonIcon = <Users className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' /> // GV dùng icon Users
	// const { url, title: buttonText, isDisabled, badge } = period.navItem

	// Dùng thẻ div mô phỏng button
	const ButtonComponent = (
		<div className='flex gap-2'>
			{period.navItem.map((item, indx) => {
				const { url, title: buttonText, isDisabled, badge, note } = item
				return (
					<div className='mt-4 flex flex-col justify-center space-y-3' key={indx}>
						{badge && (
							<Badge className='w-fit text-xs font-medium' variant={badge.variant}>
								{badge.text}
							</Badge>
						)}
						<button
							disabled={isDisabled}
							onClick={() => navigate(url)}
							className={`group flex items-center justify-center rounded-lg px-4 py-2.5 text-base font-semibold shadow-md transition-all duration-200 ${
								!isDisabled
									? 'bg-indigo-700 text-white hover:bg-indigo-800 hover:shadow-lg focus:ring-4 focus:ring-indigo-300'
									: 'cursor-not-allowed border-2 border-gray-300 bg-gray-200 text-gray-500 shadow-inner'
							} `}
						>
							{buttonText}
							{/* Đảm bảo hiển thị icon chỉ khi isActive */}
							{isActive && buttonIcon}
						</button>
						{note && <p className='mt-3 text-center text-xs font-medium text-red-600'>* Lưu ý: {note}</p>}
					</div>
				)
			})}
		</div>
	)

	return (
		<div
			className={`flex h-full flex-col rounded-xl border p-6 transition-all duration-300 ${
				isActive
					? 'bg-white shadow-xl hover:border-indigo-500 hover:shadow-2xl'
					: 'border-gray-200 bg-gray-50 opacity-90 shadow-inner'
			} `}
		>
			{/* Header */}
			<div className='mb-4 flex items-start justify-between'>
				<Badge variant={variant as any} className={`text-xs font-semibold ${color}`}>
					{label}
				</Badge>
				<PeriodIcon
					className={`h-8 w-8 ${period.type === 'thesis' ? 'text-indigo-700/80' : 'text-purple-700/80'} opacity-70`}
				/>
			</div>

			{/* Title */}
			<h3 className='mb-1 text-2xl font-extrabold leading-snug text-gray-900'>
				{period.type === 'thesis' ? 'Khóa luận Tốt nghiệp' : 'Nghiên cứu Khoa học'}
			</h3>
			<p className='mb-4 text-sm font-medium text-gray-600'>
				{`Năm học: ${period.year} • Học kỳ: ${period.semester} (${period.facultyName})`}
			</p>

			{/* Progress Bar */}
			<div className='mb-6'>
				<div className='mb-3 flex items-center justify-between'>
					{allPhases.map((phase, index) => {
						const isCompleted = currentPhaseIndex > index
						const isActive = currentPhaseIndex === index
						const isPending = currentPhaseIndex < index

						return (
							<div key={phase.phase} className='relative flex flex-1 flex-col items-center'>
								{/* Phase Circle */}
								<motion.div
									className={cn(
										'z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
										isCompleted && 'border-green-500 bg-green-500',
										isActive && 'border-indigo-600 bg-indigo-600 shadow-lg shadow-indigo-300',
										isPending && 'border-gray-300 bg-white'
									)}
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: index * 0.1 }}
								>
									{isCompleted ? (
										<Check className='h-4 w-4 text-white' />
									) : isActive ? (
										<Circle className='h-4 w-4 fill-white text-white' />
									) : (
										<Circle className='h-4 w-4 text-gray-400' />
									)}
								</motion.div>

								{/* Phase Label */}
								<span
									className={cn(
										'mt-2 text-center text-xs font-medium',
										isCompleted && 'text-green-600',
										isActive && 'font-semibold text-indigo-700',
										isPending && 'text-gray-500'
									)}
								>
									{phase.label}
								</span>

								{/* Connecting Line */}
								{index < allPhases.length - 1 && (
									<div className='absolute left-1/2 top-4 h-0.5 w-full'>
										<div className='h-full w-full bg-gray-200'>
											<motion.div
												className='h-full bg-green-500'
												initial={{ width: '0%' }}
												animate={{
													width: isCompleted ? '100%' : '0%'
												}}
												transition={{ duration: 0.5, delay: index * 0.1 }}
											/>
										</div>
									</div>
								)}

								{index < allPhases.length - 1 && (
									<div className='absolute left-1/2 top-4 h-0.5 w-full'>
										<div className='h-full w-full bg-gray-200'>
											<motion.div
												className='h-full bg-green-500'
												initial={{ width: '0%' }}
												animate={{
													width: isCompleted ? '100%' : '0%'
												}}
												transition={{ duration: 0.5, delay: index * 0.1 }}
											/>
										</div>
									</div>
								)}
							</div>
						)
					})}
				</div>
			</div>

			{/* Thời gian */}
			<div className='mt-auto space-y-3 border-t border-gray-300 pt-4 text-sm text-gray-700'>
				<div className='flex items-center gap-2'>
					<Calendar className='h-4 w-4 text-indigo-600' />
					<span className='w-24 flex-shrink-0 font-medium text-gray-700'>Mở Đăng ký:</span>
					<span className='rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold'>
						{new Date(period.currentPhaseDetail.startTime).toLocaleString('vi-VN')}
					</span>
				</div>
				<div className='flex items-center gap-2'>
					<Clock className='h-4 w-4 text-indigo-600' />
					<span className='w-24 flex-shrink-0 font-medium text-gray-700'>Đóng Đăng ký:</span>
					<span className='rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold'>
						{new Date(period.currentPhaseDetail.endTime).toLocaleString('vi-VN')}
					</span>
				</div>
			</div>

			{/* Action Button */}
			{ButtonComponent}
		</div>
	)
}

export default PeriodCard
