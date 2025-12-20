import { useEffect, useMemo, useState } from 'react'
import { ListChecks, BarChart3, FolderOpen } from 'lucide-react'
import { MilestonePanel } from './milestone/MilestonePanel'
import { ProgressPanel } from './ProgressPanel'
import { DocumentsPanel } from './DocumentsPanel'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store'
import { useGetMilestonesOfGroupQuery } from '@/services/milestoneApi'
import type { MilestoneStatus, ResponseMilestone } from '@/models/milestone.model'

type TabType = 'milestone' | 'progress' | 'documents'

export const WorkPanel = () => {
	const [activeTab, setActiveTab] = useState<TabType>('milestone')
	const group = useAppSelector((state) => state.group)
	const tabs = [
		{ id: 'milestone' as TabType, label: 'Cột mốc', icon: ListChecks },
		{ id: 'progress' as TabType, label: 'Tiến độ', icon: BarChart3 },
		{ id: 'documents' as TabType, label: 'Tài liệu', icon: FolderOpen }
	]
	//gọi API lấy danh sách các milestone
	const { data: milestonesData } = useGetMilestonesOfGroupQuery(
		{ groupId: group.activeGroup?._id! },
		{ skip: !group.activeGroup?._id }
	) // Thay 'example-group-id' bằng ID nhóm thực tế
	const [milestones, setMilestones] = useState<ResponseMilestone[]>([]) // Empty array ban đầu, thay bằng real data sau
	//console.log('milestonesData', milestonesData)
	useEffect(() => {
		if (milestonesData) setMilestones(milestonesData)
	}, [milestonesData])

	const totalProgress = useMemo(() => {
		if (milestones.length === 0) return 0
		const completedProgress = milestones.reduce((sum, m) => sum + m.progress, 0)
		return Math.round(completedProgress / milestones.length)
	}, [milestones])
	return (
		<div className='flex flex-col bg-work'>
			{/* Tab Header */}
			<div className='flex border-b border-border bg-work-header'>
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={cn('work-tab flex items-center gap-2', activeTab === tab.id && 'work-tab-active')}
					>
						<tab.icon className='h-4 w-4' />
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab Content */}
			<div className='h-[calc(100dvh-2rem)] flex-1 overflow-y-auto'>
				{activeTab === 'milestone' && (
					<MilestonePanel
						setMilestones={setMilestones}
						milestones={milestones}
						totalProgress={totalProgress}
					/>
				)}
				{activeTab === 'progress' && <ProgressPanel milestones={milestones} totalProgress={totalProgress} />}
				{activeTab === 'documents' && <DocumentsPanel />}
			</div>
		</div>
	)
}
