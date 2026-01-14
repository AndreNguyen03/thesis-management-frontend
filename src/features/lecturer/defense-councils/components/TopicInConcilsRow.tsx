import {
	councilMemberRoleMap,
	type CouncilMemberDto,
	type CouncilMemberRole,
	type TopicAssignment
} from '@/models/defenseCouncil.model'
import { Badge } from '@/components/ui/badge'
import { Eye, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { useLocation, useNavigate } from 'react-router-dom'

interface TopicRowProps {
	index?: number
	topic: TopicAssignment
	councilMembers: CouncilMemberDto[]
}

const TopicInConcilsRow = ({ topic, councilMembers, index }: TopicRowProps) => {
	const navigate = useNavigate()
	const location = useLocation()

	return (
		<tr key={topic.topicId} className='border-b border-t bg-white last:border-b-0 hover:bg-gray-100'>
			{/* Số thứ tự */}
			<td className='px-4 py-3' style={{ minWidth: '30px', maxWidth: '50px', width: '50px' }}>
				<div>
					<p className='text-wrap text-[14px] font-medium text-gray-900'>{index}</p>
				</div>
			</td>
			{/* Tên đề tài */}
			<td
				className='border-l border-t px-4 py-3'
				style={{ minWidth: '180px', maxWidth: '220px', width: '250px' }}
			>
				<div>
					<p className='text-wrap text-[14px] font-medium text-gray-900'>{topic.titleVN}</p>
					{topic.titleEng && <p className='text-wrap text-[12px] text-gray-500'>{topic.titleEng}</p>}
				</div>
			</td>
			{/* Tên sinh viên */}
			<td
				className='border-l border-t px-4 py-3'
				style={{ minWidth: '150px', maxWidth: '180px', width: '200px' }}
			>
				<div className='space-y-1'>
					{topic.studentNames && topic.studentNames.length > 0 ? (
						topic.studentNames.map((student, idx) => (
							<p key={idx} className='text-sm text-gray-700'>
								{student}
							</p>
						))
					) : (
						<span className='text-sm text-gray-400'>Chưa có SV</span>
					)}
				</div>
			</td>
			{/* Tên giảng viên */}
			<td
				className='border-l border-t px-4 py-3'
				style={{ minWidth: '150px', maxWidth: '180px', width: '200px' }}
			>
				<div className='space-y-1'>
					{topic.lecturerNames && topic.lecturerNames.length > 0 ? (
						topic.lecturerNames.map((lecturer, idx) => (
							<p key={idx} className='text-sm text-gray-700'>
								{lecturer}
							</p>
						))
					) : (
						<span className='text-sm text-gray-400'>Chưa có GV</span>
					)}
				</div>
			</td>
			{/* phản biện */}
			<td className='border-l border-t px-4 py-3'>
				<div className='flex gap-2'>
					{(['reviewer'] as CouncilMemberRole[]).map((role) => {
						const member = councilMembers.find((m) => m.role === role)
						return (
							<div key={role} className='flex items-center justify-between gap-2'>
								{member && (
									<Badge variant='outline' className='flex items-center gap-1'>
										<span className='text-xs'>
											{member.title} {member.fullName}
										</span>
									</Badge>
								)}
							</div>
						)
					})}
				</div>
			</td>
			{/* Hội đồng  */}
			<td className='border-l border-t px-4 py-3'>
				<div className='flex flex-col gap-2'>
					{(['chairperson', 'secretary', 'member'] as CouncilMemberRole[]).map((role) => {
						const member = councilMembers.find((m) => m.role === role)
						return (
							<div key={role} className='flex items-center justify-between gap-2'>
								<span className='block min-w-[60px] text-sm font-semibold text-blue-800'>
									{councilMemberRoleMap[role]}
								</span>
								{member && (
									<Badge variant='outline' className='flex items-center gap-1'>
										<span className='text-xs'>
											{member.title} {member.fullName}
										</span>
									</Badge>
								)}
							</div>
						)
					})}
				</div>
			</td>
			<td
				className='gap-2 border-l border-t px-4 py-3'
				style={{ minWidth: '90px', maxWidth: '120px', width: '200px' }}
			>
				<div className='flex flex-col items-center justify-center gap-2'>
					<Button
						variant='ghost'
						className='w-fit border border-gray-200 bg-gray-100 hover:bg-gray-200'
						onClick={() =>
							navigate(
								`/detail-topic/${topic.topicId}?from=${encodeURIComponent(location.pathname + location.search)}`
							)
						}
					>
						<Eye className='h-4 w-4' />
					</Button>
				</div>
			</td>
		</tr>
	)
}

export default TopicInConcilsRow
