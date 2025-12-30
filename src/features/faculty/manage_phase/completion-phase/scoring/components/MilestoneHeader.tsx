import { defenseStatusMap, type ResponseMilestoneWithTemplate } from '@/models/milestone.model'
import { formatDate } from '@/utils/utils'
interface MilestoneHeaderProps {
	milestone: ResponseMilestoneWithTemplate
}

const MilestoneHeader = ({ milestone }: MilestoneHeaderProps) => {
	return (
		<div className='flex flex-col gap-2'>
			<h2 className='text-xl font-bold'>Đợt bảo vệ: {milestone.title}</h2>
			<div className='flex gap-2 text-md'>
				<span className='font-semibold'>Trạng thái:</span>
				<span className={defenseStatusMap[milestone.status as string].color}>
					{defenseStatusMap[milestone.status as string].label}
				</span>
			</div>
			<div className='flex gap-2'>
				<span className='font-semibold'>Ngày bảo vệ:</span>
				{formatDate(milestone.dueDate)}
			</div>
		</div>
	)
}

export default MilestoneHeader
