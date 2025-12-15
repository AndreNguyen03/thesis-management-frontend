import React, { useState } from 'react'
import { ListChecks, BarChart3, FolderOpen } from 'lucide-react'
import { MilestonePanel } from './MilestonePanel'
import { ProgressPanel } from './ProgressPanel'
import { DocumentsPanel } from './DocumentsPanel'
import { cn } from '@/lib/utils'
import type { Task } from '@/models/todolist.model'

interface Milestone {
	id: number
	title: string
	dueDate: string
	progress: number
	status: string
	submission?: {
		date: string
		files: { name: string; size: string }[]
		score: number | null
		feedback: string
	} | null
}


interface WorkPanelProps {
	milestones: Milestone[]
	totalProgress: number
	updateMilestone: (id: number, progress: number, status: string, score?: number, feedback?: string) => void
}

type TabType = 'milestone' | 'progress' | 'documents'

export const WorkPanel = ({ milestones, totalProgress, updateMilestone }: WorkPanelProps) => {
	const [activeTab, setActiveTab] = useState<TabType>('milestone')

	const tabs = [
		{ id: 'milestone' as TabType, label: 'Milestone', icon: ListChecks },
		{ id: 'progress' as TabType, label: 'Progress', icon: BarChart3 },
		{ id: 'documents' as TabType, label: 'Tài liệu', icon: FolderOpen }
	]

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
			<div className='h-[calc(100vh-2rem)] flex-1 overflow-y-auto'>
				{activeTab === 'milestone' && (
					<MilestonePanel
						milestones={milestones}
						totalProgress={totalProgress}
						updateMilestone={updateMilestone}
					/>
				)}
				{activeTab === 'progress' && (
					<ProgressPanel
						milestones={milestones}
						totalProgress={totalProgress}
					/>
				)}
				{activeTab === 'documents' && <DocumentsPanel />}
			</div>
		</div>
	)
}
