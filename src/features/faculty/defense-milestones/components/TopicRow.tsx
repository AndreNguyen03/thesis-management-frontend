import type { CouncilMemberRole, GetTopicsInBatchMilestoneDto } from '@/models/milestone.model'
import LecturersCombobox from './combobox/LecturerCombobox'
import { councilMemberRoleMap, type CouncilMemberInfo } from '@/models/defenseCouncil.model'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface TopicRowProps {
	topic: GetTopicsInBatchMilestoneDto
	reviewer: CouncilMemberInfo | null
	councilMembers: CouncilMemberInfo[]
	onAddMember: (lecturer: any, role: CouncilMemberRole) => void
	onRemoveMember: (memberId: string) => void
}

const TopicRow = ({ topic, reviewer, councilMembers, onAddMember, onRemoveMember }: TopicRowProps) => {
	return (
		<tr key={topic._id} className='border-b last:border-b-0 hover:bg-gray-50'>
			{/* Tên đề tài */}
			<td className='px-4 py-3' style={{ minWidth: '180px', maxWidth: '220px', width: '200px' }}>
				<div>
					<p className='text-wrap text-[14px] font-medium text-gray-900'>{topic.titleVN}</p>
					{topic.titleEng && <p className='text-wrap text-[12px] text-gray-500'>{topic.titleEng}</p>}
				</div>
			</td>
			{/* Tên chuyên ngành */}
			<td className='px-4 py-3' style={{ minWidth: '100px', maxWidth: '120px', width: '200px' }}>
				<span className='text-sm text-gray-700'>{topic.majorName || 'N/A'}</span>
			</td>
			{/* Tên sinh viên */}
			<td className='px-4 py-3' style={{ minWidth: '150px', maxWidth: '180px', width: '200px' }}>
				<div className='space-y-1'>
					{topic.students && topic.students.length > 0 ? (
						topic.students.map((student, idx) => (
							<p key={idx} className='text-sm text-gray-700'>
								{student.fullName}
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
					{topic.lecturers && topic.lecturers.length > 0 ? (
						topic.lecturers.map((lecturer, idx) => (
							<p key={idx} className='text-sm text-gray-700'>
								{lecturer.title} {lecturer.fullName}
							</p>
						))
					) : (
						<span className='text-sm text-gray-400'>Chưa có GV</span>
					)}
				</div>
			</td>
			<td className='px-4 py-3' style={{ minWidth: '140px', maxWidth: '180px', width: '200px' }}>
				{reviewer ? (
					<Badge variant='outline' className='flex items-center gap-1'>
						<span className='text-xs'>
							{reviewer.title} {reviewer.fullName}
						</span>
						<X
							className='h-3 w-3 cursor-pointer hover:text-red-500'
							onClick={() => onRemoveMember(reviewer.memberId)}
						/>
					</Badge>
				) : (
					<LecturersCombobox onSelect={(lecturer) => onAddMember(lecturer, 'reviewer')} />
				)}
			</td>
			<td className='flex flex-col gap-2 px-4 py-3'>
				{(['chairperson', 'secretary', 'member'] as CouncilMemberRole[]).map((role) => {
					const member = councilMembers.find((m) => m.role === role)
					return (
						<div key={role} className='flex items-center justify-between gap-2'>
							<span className='block min-w-[60px] text-sm text-gray-700'>
								{councilMemberRoleMap[role]}
							</span>
							{member ? (
								<Badge variant='outline' className='flex items-center gap-1'>
									<span className='text-xs'>
										{member.title} {member.fullName}
									</span>
									<X
										className='h-3 w-3 cursor-pointer hover:text-red-500'
										onClick={() => onRemoveMember(member.memberId)}
									/>
								</Badge>
							) : (
								<LecturersCombobox onSelect={(lecturer) => onAddMember(lecturer, role)} />
							)}
						</div>
					)
				})}
			</td>
		</tr>
	)
}

export default TopicRow
