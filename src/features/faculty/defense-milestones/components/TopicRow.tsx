import { type GetTopicsInBatchMilestoneDto } from '@/models/milestone.model'
import LecturersCombobox from './combobox/LecturerCombobox'
import { councilMemberRoleMap, type CouncilMemberDto, type CouncilMemberRole } from '@/models/defenseCouncil.model'
import { Badge } from '@/components/ui/badge'
import { Eye, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { useNavigate } from 'react-router-dom'

interface TopicRowProps {
	topic: GetTopicsInBatchMilestoneDto
	reviewer: CouncilMemberDto | null
	supervisors: CouncilMemberDto[]
	councilMembers: CouncilMemberDto[]
	onAddMember: (lecturer: any, role: CouncilMemberRole) => void
	onRemoveMember: (memberId: string, role: CouncilMemberRole) => void
	onRemoveTopic: () => void
}

const TopicRow = ({
	topic,
	reviewer,
	supervisors,
	councilMembers,
	onAddMember,
	onRemoveMember,
	onRemoveTopic
}: TopicRowProps) => {
	const navigate = useNavigate()
	return (
		<tr key={topic._id} className='border-b last:border-b-0 hover:bg-gray-50'>
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
							onClick={() => onRemoveMember(reviewer.memberId, reviewer.role)}
						/>
					</Badge>
				) : (
					<LecturersCombobox onSelect={(lecturer) => onAddMember(lecturer, 'reviewer')} />
				)}
			</td>
			<td className='px-4 py-3' style={{ minWidth: '140px', maxWidth: '180px', width: '200px' }}>
				<Badge variant='outline' className='flex items-center gap-1'>
					<span className='text-xs'>{supervisors.map((s) => `${s.title} ${s.fullName}`).join(', ')}</span>
				</Badge>
			</td>
			<td className='flex flex-col gap-2 px-4 py-3'>
				{(['chairperson', 'secretary', 'member'] as CouncilMemberRole[]).map((role) => {
					const member = councilMembers.find((m) => m.role === role)
					return (
						<div key={role} className='flex items-center justify-between gap-2'>
							<span className='block min-w-[60px] text-sm font-semibold text-blue-800'>
								{councilMemberRoleMap[role]}
							</span>
							{member ? (
								<Badge variant='outline' className='flex items-center gap-1'>
									<span className='text-xs'>
										{member.title} {member.fullName}
									</span>
									<X
										className='h-3 w-3 cursor-pointer hover:text-red-500'
										onClick={() => onRemoveMember(member.memberId, role)}
									/>
								</Badge>
							) : (
								<LecturersCombobox onSelect={(lecturer) => onAddMember(lecturer, role)} />
							)}
						</div>
					)
				})}
			</td>
			<td className='gap-2 px-4 py-3' style={{ minWidth: '90px', maxWidth: '120px', width: '200px' }}>
				<button
					title='Loại bỏ đề tài khỏi danh sách'
					className='rounded-lg bg-red-600 text-white hover:bg-red-500'
					onClick={onRemoveTopic}
				>
					<X />
				</button>
				<Button variant='ghost' onClick={() => navigate(`/detail-topic/${topic._id}`)}>
					<Eye className='h-4 w-4' />
				</Button>
			</td>
		</tr>
	)
}

export default TopicRow
