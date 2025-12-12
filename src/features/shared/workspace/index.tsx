import React, { useState, useMemo } from 'react'
import { GroupSidebar } from './components/GroupSidebar'
import { ChatPanel } from './components/ChatPanel'
import { WorkPanel } from './components/WorkPanel'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'

// Mock Data
const mockGroups = [
	{ id: 1, name: 'Nhóm Dự án Web E-commerce', lastMessage: 'Họp vào 10h sáng mai.' },
	{ id: 2, name: 'Nhóm Xử lý Ngôn ngữ Tự nhiên', lastMessage: 'Đã nộp báo cáo tuần 2.' },
	{ id: 3, name: 'Nhóm Thiết kế UI/UX App', lastMessage: 'Cần phản hồi về wireframe.' }
]

const initialMilestones = [
	{
		id: 101,
		title: 'Phân tích Yêu cầu',
		dueDate: '2025-10-15',
		progress: 100,
		status: 'Đã Hoàn thành',
		submission: {
			date: '2025-10-14',
			files: [{ name: 'YeuCau_Final.docx', size: '1.2MB' }],
			score: 9.5,
			feedback: 'Phân tích rất chi tiết, đáp ứng yêu cầu.'
		}
	},
	{
		id: 102,
		title: 'Xây dựng Prototype (MVP)',
		dueDate: '2025-11-01',
		progress: 75,
		status: 'Đang Chờ Duyệt',
		submission: {
			date: '2025-11-01',
			files: [
				{ name: 'Prototype_v1.zip', size: '50MB' },
				{ name: 'DemoVideo.mp4', size: '12MB' }
			],
			score: null,
			feedback: ''
		}
	},
	{
		id: 103,
		title: 'Kiểm thử và Tối ưu',
		dueDate: '2025-11-20',
		progress: 0,
		status: 'Đang Tiến hành',
		submission: null
	},
	{
		id: 104,
		title: 'Báo cáo Cuối kỳ',
		dueDate: '2025-12-05',
		progress: 0,
		status: 'Quá Hạn',
		submission: null
	}
]

const initialTasks = [
	{
		id: 'TASK-1',
		title: 'Thiết kế Wireframe Trang chủ',
		subtasks: [
			{ id: 1, title: 'Nghiên cứu UI/UX', status: 'Todo' as const },
			{ id: 2, title: 'Vẽ bản nháp cơ bản', status: 'In Progress' as const },
			{ id: 3, title: 'Thêm tương tác cơ bản', status: 'Done' as const }
		]
	},
	{
		id: 'TASK-2',
		title: 'Cài đặt Database PostgreSQL',
		subtasks: [
			{ id: 4, title: 'Chọn dịch vụ Hosting', status: 'Done' as const },
			{ id: 5, title: 'Tạo Schema ban đầu', status: 'Done' as const },
			{ id: 6, title: 'Kết nối API với DB', status: 'In Progress' as const }
		]
	},
	{
		id: 'TASK-3',
		title: 'Viết API cho Đăng nhập/Đăng ký',
		subtasks: [{ id: 7, title: 'Thiết kế Endpoint', status: 'Todo' as const }]
	}
]

export const GroupWorkspacePage = () => {
	const [selectedGroupId, setSelectedGroupId] = useState(mockGroups[0].id)
	const [milestones, setMilestones] = useState(initialMilestones)
	const [tasks, setTasks] = useState(initialTasks)

	const activeGroup = mockGroups.find((g) => g.id === selectedGroupId)

	// Update milestone function
	const updateMilestone = (
		id: number,
		newProgress: number,
		newStatus: string,
		newScore?: number,
		newFeedback?: string
	) => {
		setMilestones((prevMilestones) =>
			prevMilestones.map((m) => {
				if (m.id === id) {
					const updatedMilestone = {
						...m,
						progress: newProgress,
						status: newStatus
					}

					if (newScore !== undefined || newFeedback !== undefined) {
						updatedMilestone.submission = updatedMilestone.submission
							? { ...updatedMilestone.submission }
							: { date: new Date().toISOString().slice(0, 10), files: [], score: null, feedback: '' }

						if (newScore !== undefined) updatedMilestone.submission.score = newScore
						if (newFeedback !== undefined) updatedMilestone.submission.feedback = newFeedback
					}

					return updatedMilestone
				}
				return m
			})
		)
	}

	// Calculate total progress
	const totalProgress = useMemo(() => {
		if (milestones.length === 0) return 0
		const completedProgress = milestones.reduce((sum, m) => sum + m.progress, 0)
		return Math.round(completedProgress / milestones.length)
	}, [milestones])

	const handleSelectGroup = (id: number) => {
		setSelectedGroupId(id)
	}

	return (
		<div className='flex  w-full overflow-hidden'>
			{/* Sidebar */}
			<GroupSidebar groups={mockGroups} selectedGroupId={selectedGroupId} onSelectGroup={handleSelectGroup} />

			{/* Main Content - Resizable Panels */}
			<div className='h-full flex-1'>
				<ResizablePanelGroup direction='horizontal' className='h-full'>
					{/* Chat Panel */}
					<ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
						<ChatPanel groupName={activeGroup?.name || ''} />
					</ResizablePanel>

					<ResizableHandle withHandle />

					{/* Work Panel */}
					<ResizablePanel defaultSize={60} minSize={40}>
						<WorkPanel
							milestones={milestones}
							tasks={tasks}
							setTasks={setTasks}
							totalProgress={totalProgress}
							updateMilestone={updateMilestone}
						/>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	)
}
