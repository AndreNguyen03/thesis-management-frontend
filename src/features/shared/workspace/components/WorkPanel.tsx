import { useEffect, useMemo, useState } from 'react'
import { ListChecks, BarChart3, FolderOpen, MessageSquare } from 'lucide-react'
import { MilestonePanel } from './milestone/MilestonePanel'
import { ProgressPanel } from './ProgressPanel'
import { DocumentsPanel } from './DocumentsPanel'
import { cn } from '@/lib/utils'
import { useGetMilestonesOfGroupQuery } from '@/services/milestoneApi'
import type { ResponseMilestone } from '@/models/milestone.model'
import { useParams } from 'react-router-dom'
import { ChatPanel } from './ChatPanel'
import type { Participant } from '@/models/groups.model'
import { useChat } from '@/hooks'
import { useAppSelector } from '@/store'
import { getUserIdFromAppUser } from '@/utils/utils'

type TabType = 'milestone' | 'progress' | 'documents' | 'chat'

interface WorkPanelProps {
	groupName?: string
	participants: Participant[]
}

export const WorkPanel = ({ groupName, participants }: WorkPanelProps) => {
	const [activeTab, setActiveTab] = useState<TabType>('milestone')
	const { groupId } = useParams<{ groupId: string }>()
	const { messagesByGroup } = useChat()
	const user = useAppSelector((state) => state.auth.user)
	const userId = getUserIdFromAppUser(user)

	const tabs = [
		{ id: 'milestone' as TabType, label: 'Cột mốc', icon: ListChecks },
		{ id: 'progress' as TabType, label: 'Tiến độ', icon: BarChart3 },
		{ id: 'documents' as TabType, label: 'Tài liệu', icon: FolderOpen },
		{ id: 'chat' as TabType, label: 'Chat', icon: MessageSquare }
	]

	// Kiểm tra tin nhắn chưa đọc cho group hiện tại
	const hasUnreadMessages = useMemo(() => {
		if (!groupId || !messagesByGroup) return false
		const msgs = messagesByGroup[groupId] ?? []
		return msgs.some((m) => m.senderId !== userId && (!m.lastSeenAtByUser || !m.lastSeenAtByUser[userId]))
	}, [groupId, messagesByGroup, userId])

	//gọi API lấy danh sách các milestone
	const { data: milestonesData, refetch: refetchMilestones } = useGetMilestonesOfGroupQuery(
		{ groupId: groupId! },
		{ skip: !groupId }
	)

	// Thay 'example-group-id' bằng ID nhóm thực tế
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
		<div className='flex h-full flex-col bg-work'>
			{/* Tab Header */}
			<div className='flex border-b border-border bg-work-header'>
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={cn(
							'work-tab relative flex items-center gap-2',
							activeTab === tab.id && 'work-tab-active'
						)}
					>
						<tab.icon className='h-4 w-4' />
						{tab.label}
						{tab.id === 'chat' && hasUnreadMessages && activeTab !== 'chat' && (
							<span className='absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500' />
						)}
					</button>
				))}
			</div>

			{/* Tab Content */}
			<div className='h-[calc(100dvh-2rem)] flex-1 overflow-y-auto'>
				{activeTab === 'milestone' && <MilestonePanel setMilestones={setMilestones} milestones={milestones} />}
				{activeTab === 'progress' && (
					<ProgressPanel
						milestones={milestones}
						totalProgress={totalProgress}
						refetchMilestones={() => refetchMilestones()}
					/>
				)}
				{activeTab === 'documents' && <DocumentsPanel />}
				{activeTab === 'chat' && (
					<ChatPanel groupName={groupName || ''} groupId={groupId ?? ''} participants={participants} />
				)}
			</div>
		</div>
	)
}
