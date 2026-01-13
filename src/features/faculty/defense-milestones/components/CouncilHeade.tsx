import { Badge, Button } from '@/components/ui'
import type { ResDefenseCouncil } from '@/models/defenseCouncil.model'
import type { Period } from '@/models/period.model'
import { useGetPeriodDetailQuery } from '@/services/periodApi'
import { formatPeriodInfo2 } from '@/utils/utils'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
interface MilestoneHeaderProps {
	council: ResDefenseCouncil
}

const CouncilHeader = ({ council }: MilestoneHeaderProps) => {
	const navigate = useNavigate()
	const { councilId, periodId, templateId } = useParams<{ councilId: string; periodId: string; templateId: string }>()
		const { data: period, isLoading: isPeriodLoading } = useGetPeriodDetailQuery(periodId!)
	return (
		<div className='w-full'>
			{/* Milestone Info */}
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<Button
						variant='ghost'
						size='icon'
						className='border border-gray-200 hover:bg-gray-100'
						onClick={() => navigate(`/period/${periodId}/defense-milestones-in-period/${templateId}`)}
					>
						<ArrowLeft className='h-5 w-5' />
					</Button>
					<div className='flex flex-col gap-2'>
						<h1 className='text-3xl font-bold tracking-tight'>{council.name}</h1>
						{!isPeriodLoading && (
							<span className='text-[20px] font-semibold text-blue-600'>
								{formatPeriodInfo2(period!)}
							</span>
						)}
						<p className='text-muted-foreground'>Chi tiết hội đồng bảo vệ, phân công và tổ chức</p>
					</div>
				</div>
				<div className='flex gap-2'>
					{council.isCompleted ? (
						<Badge variant='secondary' className='bg-green-600 text-white'>
							Đã hoàn thành
						</Badge>
					) : council.isPublished ? (
						<Badge variant='default' className='bg-blue-600'>
							Đã công bố
						</Badge>
					) : (
						<Badge variant='outline'>Chờ xử lý</Badge>
					)}
				</div>
			</div>
		</div>
	)
}

export default CouncilHeader
