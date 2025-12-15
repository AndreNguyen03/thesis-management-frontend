import React, { useState, useMemo, useEffect } from 'react'
import { GroupSidebar } from './components/GroupSidebar'
import { ChatPanel } from './components/ChatPanel'
import { WorkPanel } from './components/WorkPanel'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { useGetStaskQuery } from '@/services/todolistApi'
import type { Task } from '@/models/todolist.model'

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

// const initialTasks: Task[] = [
// 	{
// 		groupId: 'GROUP-001',
// 		title: 'Thiết kế Wireframe Trang chủ',
// 		description: 'Tạo wireframe chi tiết cho trang chủ của ứng dụng E-commerce',
// 		columns: [
// 			{
// 				title: 'Todo',
// 				color: '#ef4444',
// 				items: [
// 					{ title: 'Nghiên cứu UI/UX các trang tương tự', isCompleted: false },
// 					{ title: 'Xác định các thành phần chính', isCompleted: false }
// 				]
// 			},
// 			{
// 				title: 'In Progress',
// 				color: '#f59e0b',
// 				items: [
// 					{ title: 'Vẽ bản nháp cơ bản trên Figma', isCompleted: false },
// 					{ title: 'Thiết kế responsive cho mobile', isCompleted: false }
// 				]
// 			},
// 			{
// 				title: 'Done',
// 				color: '#10b981',
// 				items: [
// 					{ title: 'Thêm tương tác cơ bản', isCompleted: true },
// 					{ title: 'Review với nhóm', isCompleted: true }
// 				]
// 			}
// 		]
// 	},
// 	{
// 		groupId: 'GROUP-001',
// 		title: 'Cài đặt Database PostgreSQL',
// 		description: 'Thiết lập và cấu hình database cho hệ thống',
// 		columns: [
// 			{
// 				title: 'Todo',
// 				color: '#ef4444',
// 				items: [{ title: 'Viết migration scripts', isCompleted: false }]
// 			},
// 			{
// 				title: 'In Progress',
// 				color: '#f59e0b',
// 				items: [
// 					{ title: 'Kết nối API với DB', isCompleted: false },
// 					{ title: 'Test CRUD operations', isCompleted: false }
// 				]
// 			},
// 			{
// 				title: 'Done',
// 				color: '#10b981',
// 				items: [
// 					{ title: 'Chọn dịch vụ Hosting (Supabase)', isCompleted: true },
// 					{ title: 'Tạo Schema ban đầu', isCompleted: true },
// 					{ title: 'Setup connection pooling', isCompleted: true }
// 				]
// 			}
// 		]
// 	},
// 	{
// 		groupId: 'GROUP-001',
// 		title: 'Viết API cho Đăng nhập/Đăng ký',
// 		description: 'Phát triển authentication endpoints với JWT',
// 		columns: [
// 			{
// 				title: 'Todo',
// 				color: '#ef4444',
// 				items: [
// 					{ title: 'Thiết kế API Endpoint', isCompleted: false },
// 					{ title: 'Viết validation middleware', isCompleted: false },
// 					{ title: 'Implement JWT token refresh', isCompleted: false },
// 					{ title: 'Viết unit tests', isCompleted: false }
// 				]
// 			},
// 			{
// 				title: 'In Progress',
// 				color: '#f59e0b',
// 				items: []
// 			},
// 			{
// 				title: 'Done',
// 				color: '#10b981',
// 				items: []
// 			}
// 		]
// 	},
// 	{
// 		groupId: 'GROUP-001',
// 		title: 'Xây dựng Trang sản phẩm',
// 		description: 'Tạo giao diện hiển thị danh sách và chi tiết sản phẩm',
// 		columns: [
// 			{
// 				title: 'Todo',
// 				color: '#ef4444',
// 				items: [
// 					{ title: 'Design product card component', isCompleted: false },
// 					{ title: 'Implement filter & search', isCompleted: false }
// 				]
// 			},
// 			{
// 				title: 'In Progress',
// 				color: '#f59e0b',
// 				items: [
// 					{ title: 'Code product listing page', isCompleted: false },
// 					{ title: 'Add pagination', isCompleted: false }
// 				]
// 			},
// 			{
// 				title: 'Done',
// 				color: '#10b981',
// 				items: [{ title: 'Setup routing', isCompleted: true }]
// 			}
// 		]
// 	},
// 	{
// 		groupId: 'TOPIC-001',
// 		title: 'Tích hợp Thanh toán Online',
// 		description: 'Kết nối với cổng thanh toán VNPay/Momo',
// 		columns: [
// 			{
// 				title: 'Todo',
// 				color: '#ef4444',
// 				items: [
// 					{ title: 'Đăng ký tài khoản sandbox VNPay', isCompleted: false },
// 					{ title: 'Đọc tài liệu API', isCompleted: false },
// 					{ title: 'Tạo payment flow diagram', isCompleted: false },
// 					{ title: 'Implement payment callback handler', isCompleted: false },
// 					{ title: 'Test với sandbox', isCompleted: false }
// 				]
// 			},
// 			{
// 				title: 'In Progress',
// 				color: '#f59e0b',
// 				items: []
// 			},
// 			{
// 				title: 'Done',
// 				color: '#10b981',
// 				items: []
// 			}
// 		]
// 	}
// ]

export const GroupWorkspacePage = () => {
	const [selectedGroupId, setSelectedGroupId] = useState(mockGroups[0].id)
	const [milestones, setMilestones] = useState(initialMilestones)

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
		<div className='flex w-full overflow-hidden'>
			{/* Sidebar */}
			<GroupSidebar groups={mockGroups} selectedGroupId={selectedGroupId} onSelectGroup={handleSelectGroup} />

			{/* Main Content - Resizable Panels */}
			<div className='h-100dvh flex-1'>
				<ResizablePanelGroup direction='horizontal' className='max-h-[100dvh]'>
					{/* Chat Panel */}
					<ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
						<ChatPanel groupName={activeGroup?.name || ''} />
					</ResizablePanel>

					<ResizableHandle withHandle />

					{/* Work Panel */}
					<ResizablePanel defaultSize={60} minSize={40}>
						<WorkPanel
							milestones={milestones}
							totalProgress={totalProgress}
							updateMilestone={updateMilestone}
						/>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	)
}
