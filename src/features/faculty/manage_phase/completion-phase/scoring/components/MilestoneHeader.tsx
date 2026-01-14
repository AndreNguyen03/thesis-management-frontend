// import {
// 	defenseStatusMap,
// } from '@/models/milestone.model'
// import { formatDate } from '@/utils/utils'
// import { useNavigate } from 'react-router-dom'
// interface MilestoneHeaderProps {
// 	milestone: ResponseMilestoneWithTemplate
// 	periodFacultyName: string
// }

// const MilestoneHeader = ({ milestone, periodFacultyName }: MilestoneHeaderProps) => {
// 	const navigate = useNavigate()
// 	return (
// 		<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
// 			{/* Milestone Info */}
// 			<div className='col-span-1 flex h-fit flex-col gap-3 rounded-lg border border-gray-200 bg-white p-6 shadow'>
// 				<h2 className='text-2xl font-bold text-blue-700'>{milestone.title}</h2>
// 				<div className='flex items-center gap-2'>
// 					<span className='font-semibold text-gray-600'>Trạng thái:</span>
// 					<span className={`rounded px-2 py-1 ${defenseStatusMap[milestone.status as string].color}`}>
// 						{defenseStatusMap[milestone.status as string].label}
// 					</span>
// 				</div>
// 				<div className='flex items-center gap-2'>
// 					<span className='font-semibold text-gray-600'>Ngày bảo vệ:</span>
// 					<span>{formatDate(milestone.dueDate)}</span>
// 				</div>
// 				{milestone.location && (
// 					<div className='flex items-center gap-2'>
// 						<span className='font-semibold text-gray-600'>Địa điểm:</span>
// 						<span>{milestone.location}</span>
// 					</div>
// 				)}
// 			</div>

// 			{/* Council Info */}
// 			<div className='col-span-2 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow'>
// 				<h3 className='mb-2 text-lg font-semibold text-gray-900'>Thông tin hội đồng chấm điểm</h3>
// 				<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
// 					<div className='flex items-center gap-2'>
// 						<span className='text-sm font-medium text-gray-600'>Tên hội đồng:</span>
// 						<span className='text-sm text-gray-900'>{`${milestone.title} - ${periodFacultyName}`}</span>
// 					</div>
// 					<div className='flex items-center gap-2'>
// 						<span className='text-sm font-medium text-gray-600'>Ngày bảo vệ:</span>
// 						<span className='text-sm text-gray-900'>
// 							{new Date(milestone.dueDate).toLocaleDateString('vi-VN')}
// 						</span>
// 					</div>
// 					<div className='flex items-center gap-2'>
// 						<span className='text-sm font-medium text-gray-600'>Địa điểm:</span>
// 						<span className='text-sm text-gray-900'>{milestone.location || 'Chưa cập nhật'}</span>
// 					</div>
// 					<div className='flex items-center gap-2'>
// 						<span className='text-sm font-medium text-gray-600'>Số lượng thành viên:</span>
// 						<span className='text-sm text-gray-900'>{milestone.defenseCouncil?.length || 0}</span>
// 						<span
// 							className='cursor-pointer text-sm font-semibold text-blue-800 hover:underline'
// 							onClick={() => navigate(`/period/${milestone.periodId}/manage-defense-assignment`)}
// 						>
// 							Đi tới phân công
// 						</span>
// 					</div>
// 				</div>
// 				{/* Council Members */}
// 				{milestone.defenseCouncil && milestone.defenseCouncil.length > 0 && (
// 					<div>
// 						<span className='text-sm font-medium text-gray-600'>Thành viên hội đồng:</span>
// 						<div className='mt-2 grid grid-cols-1 gap-2 md:grid-cols-2'>
// 							{milestone.defenseCouncil.map((member, idx) => (
// 								<div
// 									key={idx}
// 									className='flex cursor-pointer items-center gap-3 rounded border border-gray-100 bg-gray-50 px-3 py-2 hover:border-blue-700' onClick={()=>navigate(`/profile/lecturer/${member.memberId}`)}
// 								>
// 									<span className='text-sm font-medium text-gray-700'>{`(GV${idx + 1})`}</span>
// 									<span className='text-sm font-medium text-gray-700'>{member.title}</span>
// 									<span className='text-sm font-medium text-gray-700'>{member.fullName}</span>
// 									<span className='rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700'>
// 										{CouncilMemberRoleOptions[member.role].label}
// 									</span>
// 								</div>
// 							))}
// 						</div>
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	)
// }

// export default MilestoneHeader
