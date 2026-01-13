import {
	CouncilMemberRole,
	type CouncilMemberRoleType,
	type GetTopicsInBatchMilestoneDto
} from '@/models/milestone.model'

import { councilMemberRoleMap, type CouncilMemberDto, type TopicAssignment } from '@/models/defenseCouncil.model'
import { Badge } from '@/components/ui/badge'
import { Eye, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { useNavigate } from 'react-router-dom'

interface TopicRowProps {
	index?: number
	topic: TopicAssignment
	councilMembers: CouncilMemberDto[]
}

const EditTopicRow = ({ topic, councilMembers, index }: TopicRowProps) => {
	const navigate = useNavigate()
	return (
		<tr key={topic.topicId} className='border-b last:border-b-0 hover:bg-gray-50'>
			{/* Số thứ tự */}
			<td className='px-4 py-3' style={{ minWidth: '30px', maxWidth: '50px', width: '50px' }}>
				<div>
					<p className='text-wrap text-[14px] font-medium text-gray-900'>{index}</p>
				</div>
			</td>
			{/* Tên đề tài */}
			<td className='px-4 py-3' style={{ minWidth: '180px', maxWidth: '220px', width: '200px' }}>
				<div>
					<p className='text-wrap text-[14px] font-medium text-gray-900'>{topic.titleVN}</p>
					{topic.titleEng && <p className='text-wrap text-[12px] text-gray-500'>{topic.titleEng}</p>}
				</div>
			</td>
			{/* Tên sinh viên */}
			<td className='px-4 py-3' style={{ minWidth: '150px', maxWidth: '180px', width: '200px' }}>
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
			<td className='px-4 py-3' style={{ minWidth: '150px', maxWidth: '180px', width: '200px' }}>
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
			<td className='px-4 py-3'>
				<div className='flex gap-2'>
					{(['reviewer'] as CouncilMemberRoleType[]).map((role) => {
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
			<td className='px-4 py-3'>
				<div className='flex flex-col gap-2'>
					{(['chairperson', 'secretary', 'member'] as CouncilMemberRoleType[]).map((role) => {
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
			<td className='gap-2 px-4 py-3' style={{ minWidth: '90px', maxWidth: '120px', width: '200px' }}>
				<Button variant='ghost' onClick={() => navigate(`/detail-topic/${topic.topicId}`)}>
					<Eye className='h-4 w-4' />
				</Button>
			</td>
		</tr>
	)
}

export default EditTopicRow
