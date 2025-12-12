import React, { useState, useMemo, useEffect, type JSX } from 'react'
import {
	MessageSquare,
	ListChecks,
	Users,
	CheckCircle,
	Clock,
	XCircle,
	ChevronRight,
	Download,
	Send,
	Zap,
	GitCommit,
	Settings,
	Plus,
	LayoutDashboard
} from 'lucide-react'

// ===============================================
// 1. INTERFACES (Định nghĩa Kiểu Dữ liệu)
// ===============================================

interface Group {
	id: number
	name: string
	lastMessage: string
}

interface FileDetail {
	name: string
	size: string
}

interface Submission {
	date: string
	files: FileDetail[]
	score: number | null
	feedback: string
}

interface Milestone {
	id: number
	title: string
	dueDate: string
	progress: number
	status: 'Đã Hoàn thành' | 'Đang Chờ Duyệt' | 'Đang Tiến hành' | 'Quá Hạn' | 'Mới'
	submission: Submission | null
}

interface Subtask {
	id: number
	title: string
	status: 'Todo' | 'In Progress' | 'Done'
}

interface Task {
	id: string
	title: string
	subtasks: Subtask[]
}

interface Activity {
	id: number
	user: string
	action: string
	target: string
	type: 'Milestone' | 'Subtask' | 'Giảng viên'
	time: string
}

// Props cho các Component
interface MilestoneDetailProps {
	milestone: Milestone
	onClose: () => void
	updateMilestone: (
		id: number,
		newProgress: number,
		newStatus: Milestone['status'],
		newScore?: number | null,
		newFeedback?: string
	) => void
}

interface MilestoneManagerProps {
	milestones: Milestone[]
	totalProgress: number
	updateMilestone: (
		id: number,
		newProgress: number,
		newStatus: Milestone['status'],
		newScore?: number | null,
		newFeedback?: string
	) => void
}

interface TaskManagerProps {
	tasks: Task[]
	setTasks: React.Dispatch<React.SetStateAction<Task[]>>
}

interface OverviewDashboardProps {
	totalProgress: number
	milestones: Milestone[]
	tasks: Task[]
}

// ===============================================
// 2. CONSTANTS & MOCK DATA
// ===============================================

const API_URL =
	'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key='
const API_KEY = '' // Placeholder for Canvas environment

const mockGroups: Group[] = [
	{ id: 1, name: 'Nhóm Dự án Web E-commerce', lastMessage: 'Họp vào 10h sáng mai.' },
	{ id: 2, name: 'Nhóm Xử lý Ngôn ngữ Tự nhiên', lastMessage: 'Đã nộp báo cáo tuần 2.' },
	{ id: 3, name: 'Nhóm Thiết kế UI/UX App', lastMessage: 'Cần phản hồi về wireframe.' }
]

const initialMilestones: Milestone[] = [
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

const initialTasks: Task[] = [
	{
		id: 'TASK-1',
		title: 'Thiết kế Wireframe Trang chủ',
		subtasks: [
			{ id: 1, title: 'Nghiên cứu UI/UX (Todo)', status: 'Todo' },
			{ id: 2, title: 'Vẽ bản nháp cơ bản', status: 'In Progress' },
			{ id: 3, title: 'Thêm tương tác cơ bản', status: 'Done' }
		]
	},
	{
		id: 'TASK-2',
		title: 'Cài đặt Database PostgreSQL',
		subtasks: [
			{ id: 4, title: 'Chọn dịch vụ Hosting', status: 'Done' },
			{ id: 5, title: 'Tạo Schema ban đầu', status: 'Done' },
			{ id: 6, title: 'Kết nối API với DB', status: 'In Progress' }
		]
	},
	{
		id: 'TASK-3',
		title: 'Viết API cho Đăng nhập/Đăng ký',
		subtasks: [{ id: 7, title: 'Thiết kế Endpoint', status: 'Todo' }]
	}
]

const mockActivities: Activity[] = [
	{
		id: 1,
		user: 'Nguyễn Văn A',
		action: 'đã hoàn thành',
		target: 'Phân tích Yêu cầu',
		type: 'Milestone',
		time: '5 phút trước'
	},
	{
		id: 2,
		user: 'Trần Thị B',
		action: 'đã chuyển',
		target: 'Kết nối API với DB',
		type: 'Subtask',
		time: '1 giờ trước'
	},
	{
		id: 3,
		user: 'Giảng viên',
		action: 'đã đánh giá',
		target: 'Phân tích Yêu cầu',
		type: 'Giảng viên',
		time: '2 giờ trước'
	}
]

// ===============================================
// 3. UTILITY FUNCTIONS (Các hàm tiện ích)
// ===============================================

// Hàm xử lý gọi API với cơ chế exponential backoff
async function callApiWithBackoff(url: string, options: RequestInit): Promise<any> {
	let delay = 1000
	const maxRetries = 5

	for (let i = 0; i < maxRetries; i++) {
		try {
			const response = await fetch(url, options)
			if (response.status === 429 && i < maxRetries - 1) {
				console.warn(`API Rate limit exceeded. Retrying in ${delay}ms...`)
				await new Promise((resolve) => setTimeout(resolve, delay))
				delay *= 2
				continue
			}
			if (!response.ok) {
				const errorBody = await response.text()
				throw new Error(`API call failed with status: ${response.status}. Details: ${errorBody}`)
			}
			return response.json()
		} catch (error) {
			if (i === maxRetries - 1) {
				console.error('API call failed after multiple retries:', error)
				throw error
			}
			await new Promise((resolve) => setTimeout(resolve, delay))
			delay *= 2
		}
	}
}

// Hàm lấy icon và màu sắc dựa trên trạng thái (Milestone Status)
const getStatusProps = (status: Milestone['status']) => {
	switch (status) {
		case 'Đã Hoàn thành':
			return { icon: CheckCircle, color: 'text-green-600 bg-green-100', text: 'Đã Hoàn thành' }
		case 'Đang Chờ Duyệt':
			return { icon: Clock, color: 'text-blue-600 bg-blue-100', text: 'Đang Chờ Duyệt' }
		case 'Đang Tiến hành':
			return { icon: Clock, color: 'text-yellow-600 bg-yellow-100', text: 'Đang Tiến hành' }
		case 'Quá Hạn':
			return { icon: XCircle, color: 'text-red-600 bg-red-100', text: 'Quá Hạn' }
		default:
			return { icon: Clock, color: 'text-gray-600 bg-gray-100', text: 'Mới' }
	}
}

// Hàm lấy icon và màu sắc dựa trên trạng thái (Subtask Status)
const getSubtaskStatusProps = (status: Subtask['status']) => {
	switch (status) {
		case 'Done':
			return { icon: CheckCircle, color: 'text-green-600 bg-green-100', text: 'Done' }
		case 'In Progress':
			return { icon: Zap, color: 'text-yellow-600 bg-yellow-100', text: 'In Progress' }
		case 'Todo':
		default:
			return { icon: Clock, color: 'text-gray-600 bg-gray-100', text: 'Todo' }
	}
}

// ===============================================
// 4. COMPONENTS
// ===============================================

// Component Tag Trạng thái
const StatusTag: React.FC<{ status: Milestone['status'] | Subtask['status']; type?: 'milestone' | 'subtask' }> = ({
	status,
	type = 'milestone'
}) => {
	const {
		icon: Icon,
		color,
		text
	} = type === 'milestone'
		? getStatusProps(status as Milestone['status'])
		: getSubtaskStatusProps(status as Subtask['status'])

	return (
		<div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${color}`}>
			<Icon className='mr-1 h-3 w-3' />
			{text}
		</div>
	)
}

// Component Thanh Tiến độ
const ProgressBar: React.FC<{ progress: number; status: Milestone['status'] }> = ({ progress, status }) => {
	let colorClass = 'bg-gray-200'
	if (status === 'Đã Hoàn thành') colorClass = 'bg-green-500'
	else if (status === 'Đang Chờ Duyệt') colorClass = 'bg-blue-500'
	else if (status === 'Quá Hạn') colorClass = 'bg-red-500'
	else colorClass = 'bg-yellow-500'

	return (
		<div className='h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
			<div
				className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`}
				style={{ width: `${progress}%` }}
			></div>
		</div>
	)
}

// Component Chi tiết Tài liệu nộp (Giảng viên đánh giá)
const SubmissionDetails: React.FC<{
	milestone: Milestone
	onSaveEvaluation: (id: number, score: number | null, feedback: string, status: Milestone['status']) => void
}> = ({ milestone, onSaveEvaluation }) => {
	// Check if submission is null before accessing properties
	const submission = milestone.submission || ({} as Submission)
	const [score, setScore] = useState<number | string>(submission.score !== null ? submission.score : '')
	const [feedback, setFeedback] = useState<string>(submission.feedback || '')

	const handleSave = (): void => {
		const finalScore: number | null = score !== '' ? parseFloat(score as string) : null
		let newStatus: Milestone['status'] = milestone.status

		// Logic cập nhật trạng thái
		if (finalScore !== null) {
			newStatus = 'Đã Hoàn thành'
		} else if (feedback.trim() !== '') {
			newStatus = 'Đang Chờ Duyệt' // Giả sử Giảng viên gửi feedback nhưng chưa chấm điểm
		} else if (milestone.progress === 100 && milestone.status === 'Đang Chờ Duyệt') {
			newStatus = 'Đang Chờ Duyệt' // Giữ nguyên nếu chưa có gì mới
		}

		onSaveEvaluation(milestone.id, finalScore, feedback, newStatus)

		console.log(
			`Đã lưu đánh giá thành công! Milestone ${milestone.title} đã được cập nhật trạng thái thành: ${newStatus}.`
		)
	}

	// Vô hiệu hóa nút Save nếu Milestone đã hoàn thành và có điểm số
	const isCompletedByInstructor = milestone.status === 'Đã Hoàn thành' && milestone.submission?.score !== null

	return (
		<div className='mt-4 rounded-lg border-t border-gray-200 bg-white p-4 shadow-sm'>
			<h4 className='mb-3 text-lg font-semibold text-gray-800'>Tài liệu đã nộp</h4>
			<p className='mb-3 text-sm text-gray-500'>Ngày nộp: {submission.date || 'Chưa rõ'}</p>

			<ul className='mb-4 space-y-2'>
				{submission.files && submission.files.length > 0 ? (
					submission.files.map((file, index) => (
						<li key={index} className='flex items-center justify-between rounded-md border bg-gray-50 p-2'>
							<span className='truncate text-sm font-medium text-gray-700'>{file.name}</span>
							<div className='flex items-center space-x-2'>
								<span className='text-xs text-gray-500'>{file.size}</span>
								<button className='rounded-full bg-blue-100 p-1 text-blue-500 transition duration-150 hover:text-blue-700'>
									<Download className='h-4 w-4' />
								</button>
							</div>
						</li>
					))
				) : (
					<li className='text-sm italic text-gray-500'>Không có tệp đính kèm.</li>
				)}
			</ul>

			<div className='space-y-4'>
				{/* Khu vực Nhập Điểm */}
				<div>
					<label htmlFor='score' className='block text-sm font-medium text-gray-700'>
						Điểm số (0-10)
					</label>
					<input
						type='number'
						id='score'
						value={score}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScore(e.target.value)}
						className='mt-1 block w-full rounded-md border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
						min='0'
						max='10'
						placeholder='Nhập điểm'
						disabled={isCompletedByInstructor}
					/>
				</div>

				{/* Khu vực Phản hồi */}
				<div>
					<label htmlFor='feedback' className='block text-sm font-medium text-gray-700'>
						Phản hồi của Giảng viên
					</label>
					<textarea
						id='feedback'
						rows={4}
						value={feedback}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
						className='mt-1 block w-full rounded-md border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500'
						placeholder='Viết nhận xét và hướng dẫn cải thiện...'
						disabled={isCompletedByInstructor}
					></textarea>
				</div>

				{/* Nút Hành động */}
				<div className='flex justify-end space-x-3 pt-2'>
					<button
						onClick={handleSave}
						className='flex items-center rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow-md transition duration-150 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50'
						disabled={isCompletedByInstructor}
					>
						<Send className='mr-2 h-4 w-4' />
						{isCompletedByInstructor ? 'Đã Đánh giá' : 'Lưu Đánh giá & Duyệt'}
					</button>
				</div>
			</div>
		</div>
	)
}

// Component mô phỏng Sinh viên tự cập nhật tiến độ
const StudentProgressUpdate: React.FC<{
	milestone: Milestone
	updateMilestone: MilestoneDetailProps['updateMilestone']
	onUpdateComplete: () => void
}> = ({ milestone, updateMilestone, onUpdateComplete }) => {
	const [currentProgress, setCurrentProgress] = useState<string>(milestone.progress.toString())
	const [currentStatus, setCurrentStatus] = useState<Milestone['status']>(milestone.status)

	// Kiểm tra xem Giảng viên đã hoàn thành chấm điểm chưa
	const isFinalized = milestone.status === 'Đã Hoàn thành' && milestone.submission?.score !== null

	const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value, 10)
		if (!isNaN(value) && value >= 0 && value <= 100) {
			setCurrentProgress(value.toString())
		}
	}

	const handleUpdate = (): void => {
		if (isFinalized) {
			console.log('Không thể thay đổi Tiến độ Milestone đã được Giảng viên đánh giá và hoàn thành.')
			return
		}

		const newProgress = parseInt(currentProgress, 10)
		let statusToUpdate: Milestone['status'] = milestone.status

		// Logic tự động điều chỉnh trạng thái
		if (newProgress === 100) {
			statusToUpdate = 'Đang Chờ Duyệt' // 100% -> Chờ duyệt
		} else if (newProgress < 100 && statusToUpdate !== 'Quá Hạn') {
			statusToUpdate = 'Đang Tiến hành' // < 100% -> Đang Tiến hành
		}

		// Giữ nguyên Quá Hạn nếu không phải 100%
		if (milestone.status === 'Quá Hạn' && newProgress < 100) {
			statusToUpdate = 'Quá Hạn'
		}

		updateMilestone(milestone.id, newProgress, statusToUpdate)
		onUpdateComplete()
	}

	// Logic hiển thị trạng thái dự kiến
	const nextStatusText: Milestone['status'] = useMemo(() => {
		const progressNum = parseInt(currentProgress, 10)
		if (isFinalized) return 'Đã Hoàn thành' // Không thay đổi nếu đã chốt
		if (progressNum === 100) return 'Đang Chờ Duyệt'
		if (milestone.status === 'Quá Hạn') return 'Quá Hạn' // Giữ nguyên Quá Hạn
		return 'Đang Tiến hành'
	}, [currentProgress, milestone.status, isFinalized])

	return (
		<div
			className={`mt-6 rounded-xl border p-4 shadow-lg ${isFinalized ? 'border-gray-300 bg-gray-100' : 'border-blue-300 bg-blue-50'}`}
		>
			<h4 className='mb-3 text-lg font-bold text-blue-800'>[MÔ PHỎNG SINH VIÊN] Cập nhật Tiến độ</h4>

			{isFinalized && (
				<p className='mb-3 text-sm font-medium text-red-500'>
					Milestone này đã được Giảng viên đánh giá và hoàn thành, không thể thay đổi tiến độ.
				</p>
			)}

			{/* Input Progress */}
			<div className='mb-4'>
				<label className='mb-1 block text-sm font-medium text-gray-700'>Phần trăm hoàn thành:</label>
				<div className='flex items-center'>
					<input
						type='range'
						min='0'
						max='100'
						step='5'
						value={currentProgress}
						onChange={handleProgressChange}
						className={`range-lg h-2 w-full cursor-pointer appearance-none rounded-lg ${isFinalized ? 'bg-gray-400' : 'bg-blue-200'}`}
						disabled={isFinalized}
					/>
					<input
						type='number'
						min='0'
						max='100'
						value={currentProgress}
						onChange={handleProgressChange}
						className='ml-3 w-16 rounded-md border border-gray-300 p-1 text-center font-semibold'
						disabled={isFinalized}
					/>
					<span className='ml-1 text-lg text-gray-700'>%</span>
				</div>
			</div>

			{/* Trạng thái hiện tại sau khi cập nhật */}
			<div className='mb-4'>
				<p className='text-sm font-medium text-gray-700'>
					Trạng thái mới (Dự kiến): <StatusTag status={nextStatusText} type='milestone' />
				</p>
			</div>

			{/* Update Button */}
			<button
				onClick={handleUpdate}
				disabled={isFinalized}
				className='flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-md transition duration-150 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
			>
				Lưu Thay đổi
			</button>
		</div>
	)
}

// Component Chi tiết Milestone
const MilestoneDetail: React.FC<MilestoneDetailProps> = ({ milestone, onClose, updateMilestone }) => {
	//const { icon: Icon, color } = getStatusProps(milestone.status)

	// Ép kiểu `Milestone['status']` sang kiểu string để dùng trong `getStatusProps`
	const colorClass = getStatusProps(milestone.status as Milestone['status']).color
	const colorHex = colorClass.split(' ')[0].split('-')[1] // Lấy màu sắc Tailwind (e.g., 600)

	// Hàm xử lý việc Giảng viên chấm điểm
	const handleSaveEvaluation = (
		id: number,
		newScore: number | null,
		newFeedback: string,
		newStatus: Milestone['status']
	): void => {
		updateMilestone(id, milestone.progress, newStatus, newScore, newFeedback)
		onClose()
	}

	// Hàm xử lý việc Sinh viên tự cập nhật (mô phỏng)
	const handleStudentUpdateComplete = (): void => {
		onClose()
	}

	return (
		<div className='fixed right-0 top-0 z-20 h-full w-full overflow-y-auto border-l border-gray-200 bg-gray-50 p-6 shadow-2xl lg:w-1/2 xl:w-1/3'>
			<div className='mb-6 flex items-start justify-between'>
				<h2 className='text-2xl font-bold text-gray-900'>{milestone.title}</h2>
				<button onClick={onClose} className='p-2 text-gray-500 transition duration-150 hover:text-gray-900'>
					<XCircle className='h-6 w-6' />
				</button>
			</div>

			<div className='mb-6 space-y-4 rounded-xl bg-white p-4 shadow-md'>
				<div className='flex justify-between text-sm font-medium'>
					<p className='text-gray-600'>Ngày Hết hạn:</p>
					<p className='text-gray-800'>{milestone.dueDate}</p>
				</div>
				<div className='flex justify-between text-sm font-medium'>
					<p className='text-gray-600'>Tiến độ:</p>
					<p className='font-semibold' style={{ color: `var(--tw-colors-text-${colorHex})` }}>
						{milestone.progress}%
					</p>
				</div>
				<StatusTag status={milestone.status} type='milestone' />
				<ProgressBar progress={milestone.progress} status={milestone.status} />
			</div>

			{/* Khu vực Giảng viên đánh giá và xem tài liệu nộp */}
			{milestone.submission && (
				<SubmissionDetails milestone={milestone} onSaveEvaluation={handleSaveEvaluation} />
			)}

			{/* Khu vực Sinh viên cập nhật tiến độ (Mô phỏng) */}
			<StudentProgressUpdate
				milestone={milestone}
				updateMilestone={updateMilestone}
				onUpdateComplete={handleStudentUpdateComplete}
			/>
		</div>
	)
}

// Component chính: Quản lý Milestone
const MilestoneManager: React.FC<MilestoneManagerProps> = ({ milestones, totalProgress, updateMilestone }) => {
	const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)

	return (
		<div className='min-h-screen bg-gray-100 p-6'>
			{/* 1. Tổng quan Tiến độ Dự án */}
			<div className='mb-8 rounded-lg border-l-4 border-indigo-600 bg-indigo-50 p-6 shadow-lg'>
				<h3 className='mb-3 text-xl font-bold text-indigo-800'>Tổng quan Dự án Nhóm</h3>
				<div className='flex items-center justify-between'>
					<p className='font-medium text-gray-700'>Tiến độ chung:</p>
					<span className='text-2xl font-extrabold text-indigo-600'>{totalProgress}%</span>
				</div>
				<ProgressBar
					progress={totalProgress}
					status={totalProgress === 100 ? 'Đã Hoàn thành' : 'Đang Tiến hành'}
				/>
			</div>

			{/* 2. Danh sách các Milestone */}
			<h3 className='mb-4 text-2xl font-bold text-gray-900'>Các Milestone chi tiết</h3>
			<div className='space-y-4'>
				{milestones.map((milestone) => (
					<div
						key={milestone.id}
						className='flex cursor-pointer items-center rounded-xl border border-gray-200 bg-white p-4 shadow-md transition duration-200 hover:shadow-lg'
						onClick={() => setSelectedMilestone(milestone)}
					>
						<div className='min-w-0 flex-1'>
							<p className='truncate text-lg font-semibold text-gray-800'>{milestone.title}</p>
							<div className='mt-1 flex items-center space-x-4 text-sm'>
								<p className='text-gray-500'>
									Hạn chót: <span className='font-medium text-gray-700'>{milestone.dueDate}</span>
								</p>
							</div>
						</div>

						<div className='hidden w-1/4 md:block'>
							<ProgressBar progress={milestone.progress} status={milestone.status} />
						</div>

						<div className='mx-4'>
							<StatusTag status={milestone.status} type='milestone' />
						</div>

						<ChevronRight className='h-5 w-5 text-gray-400' />
					</div>
				))}
			</div>

			{/* 3. Sidebar Chi tiết Milestone (Modal/Drawer) */}
			{selectedMilestone && (
				<>
					<div
						className='fixed inset-0 z-10 bg-black opacity-30'
						onClick={() => setSelectedMilestone(null)}
					></div>
					<MilestoneDetail
						milestone={selectedMilestone}
						onClose={() => setSelectedMilestone(null)}
						updateMilestone={updateMilestone}
					/>
				</>
			)}
		</div>
	)
}

// Component quản lý Tasks (Jira Style) - Đã thêm tính năng Gemini API
const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks }) => {
	const [newTaskTitle, setNewTaskTitle] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string>('')

	// LLM API Call to generate Subtasks
	const generateSubtasks = async () => {
		if (!newTaskTitle.trim()) {
			setErrorMessage('Vui lòng nhập tiêu đề Công việc trước.')
			return
		}
		setErrorMessage('')
		setIsLoading(true)

		const systemPrompt: string =
			"You are a professional project manager AI. Your task is to break down a high-level task title into a list of 3 to 6 actionable, technical subtasks. You must respond ONLY with a JSON array object following the provided schema. Ensure all subtask statuses are 'Todo'. Respond in Vietnamese for the subtask titles."
		const userQuery: string = `Task: ${newTaskTitle}. Break this task down into actionable subtasks.`

		const payload = {
			contents: [{ parts: [{ text: userQuery }] }],
			systemInstruction: { parts: [{ text: systemPrompt }] },
			generationConfig: {
				responseMimeType: 'application/json',
				responseSchema: {
					type: 'ARRAY',
					items: {
						type: 'OBJECT',
						properties: {
							title: { type: 'STRING', description: 'The title of the subtask.' },
							status: { type: 'STRING', description: "Must be 'Todo'." }
						},
						required: ['title', 'status']
					}
				}
			}
		}

		try {
			const response = await callApiWithBackoff(API_URL + API_KEY, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			})

			const jsonText = response.candidates?.[0]?.content?.parts?.[0]?.text

			if (jsonText) {
				// Sử dụng Subtask tạm thời để parse JSON
				const subtaskArray: Array<{ title: string; status: string }> = JSON.parse(jsonText)

				if (Array.isArray(subtaskArray) && subtaskArray.length > 0) {
					const newTaskId: string = `TASK-${Date.now()}`
					const newSubtasks: Subtask[] = subtaskArray.map((subtask, index) => ({
						id: Date.now() + index,
						title: subtask.title,
						status: (subtask.status as Subtask['status']) || 'Todo' // Ép kiểu string sang Subtask['status']
					}))

					const newTask: Task = {
						id: newTaskId,
						title: newTaskTitle,
						subtasks: newSubtasks
					}

					setTasks((prevTasks) => [newTask, ...prevTasks])
					setNewTaskTitle('') // Clear input
				} else {
					setErrorMessage('Gemini không thể tạo Subtask. Vui lòng thử lại với tiêu đề cụ thể hơn.')
				}
			} else {
				setErrorMessage('Phản hồi API không hợp lệ. Vui lòng kiểm tra console.')
			}
		} catch (error: any) {
			console.error('Lỗi khi gọi API Gemini:', error)
			setErrorMessage(`Đã xảy ra lỗi khi tạo Subtask: ${error.message}`)
		} finally {
			setIsLoading(false)
		}
	}

	// Hàm tính tiến độ tổng của một Task
	const calculateTaskProgress = (subtasks: Subtask[]): number => {
		if (!subtasks || subtasks.length === 0) return 0
		const doneCount = subtasks.filter((s) => s.status === 'Done').length
		return Math.round((doneCount / subtasks.length) * 100)
	}

	// Cập nhật trạng thái Subtask (chỉ mô phỏng việc chuyển cột, không gọi API)
	const updateSubtaskStatus = (taskId: string, subtaskId: number, newStatus: Subtask['status']): void => {
		setTasks((prevTasks) =>
			prevTasks.map((task) => {
				if (task.id === taskId) {
					return {
						...task,
						subtasks: task.subtasks.map((subtask) =>
							subtask.id === subtaskId ? { ...subtask, status: newStatus } : subtask
						)
					}
				}
				return task
			})
		)
	}

	return (
		<div className='min-h-screen bg-gray-100 p-6'>
			<h3 className='mb-6 text-2xl font-bold text-gray-900'>Quản lý Công Việc (Tasks)</h3>

			{/* Khu vực tạo Task mới - GEMINI FEATURE */}
			<div className='mb-8 rounded-xl border border-indigo-200 bg-white p-4 shadow-lg'>
				<h4 className='mb-3 flex items-center text-lg font-semibold text-indigo-700'>
					<Plus className='mr-2 h-5 w-5 text-indigo-500' /> Tạo Công Việc Mới
				</h4>
				<div className='flex flex-col space-y-3 md:flex-row md:space-x-3 md:space-y-0'>
					<input
						type='text'
						placeholder='Nhập tiêu đề công việc (ví dụ: Tích hợp thanh toán PayPal)...'
						value={newTaskTitle}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTaskTitle(e.target.value)}
						className='flex-1 rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-indigo-500'
						disabled={isLoading}
					/>
					<button
						onClick={generateSubtasks}
						disabled={isLoading}
						className='flex min-w-[180px] items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white shadow-md transition duration-150 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50'
					>
						{isLoading ? (
							<svg
								className='mr-2 h-5 w-5 animate-spin text-white'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
							>
								<circle
									className='opacity-25'
									cx='12'
									cy='12'
									r='10'
									stroke='currentColor'
									strokeWidth='4'
								></circle>
								<path
									className='opacity-75'
									fill='currentColor'
									d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
								></path>
							</svg>
						) : (
							<>✨ Đề xuất Subtask</>
						)}
					</button>
				</div>
				{errorMessage && <p className='mt-2 text-sm font-medium text-red-600'>{errorMessage}</p>}
				<p className='mt-3 text-sm italic text-gray-500'>
					Nhập một công việc lớn và Gemini sẽ tự động chia nhỏ thành các bước thực hiện chi tiết.
				</p>
			</div>

			{/* Danh sách Tasks */}
			<div className='space-y-6'>
				{tasks.map((task) => {
					const progress = calculateTaskProgress(task.subtasks)
					const totalSubtasks = task.subtasks.length

					// Xác định trạng thái chung của Task
					let taskStatusText: Subtask['status'] = 'Todo'
					if (progress === 100 && totalSubtasks > 0) {
						taskStatusText = 'Done'
					} else if (progress > 0) {
						taskStatusText = 'In Progress'
					}

					return (
						<div key={task.id} className='rounded-xl border border-gray-200 bg-white p-5 shadow-lg'>
							{/* Task Header */}
							<div className='mb-3 flex items-start justify-between border-b pb-3'>
								<h4 className='flex-1 text-xl font-bold text-gray-800'>{task.title}</h4>
								<StatusTag status={taskStatusText} type='subtask' />
							</div>

							{/* Progress Bar & Summary */}
							<div className='mb-4'>
								<ProgressBar
									progress={progress}
									status={progress === 100 ? 'Đã Hoàn thành' : 'Đang Tiến hành'}
								/>
								<p className='mt-1 text-sm text-gray-500'>
									{progress}% hoàn thành ({task.subtasks.filter((s) => s.status === 'Done').length}/
									{totalSubtasks} Subtask đã xong)
								</p>
							</div>

							{/* Subtasks List - Kanban Simulation */}
							<div className='mt-5 grid grid-cols-1 gap-4 md:grid-cols-3'>
								{(['Todo', 'In Progress', 'Done'] as Array<Subtask['status']>).map((statusKey) => (
									<div key={statusKey} className='rounded-lg border bg-gray-50 p-3'>
										<h5
											className={`mb-3 text-sm font-semibold ${getSubtaskStatusProps(statusKey).color}`}
										>
											{statusKey} ({task.subtasks.filter((s) => s.status === statusKey).length})
										</h5>
										<div className='space-y-2'>
											{task.subtasks
												.filter((s) => s.status === statusKey)
												.map((subtask) => (
													<div
														key={subtask.id}
														className='cursor-pointer rounded-md border border-gray-200 bg-white p-3 text-sm font-medium text-gray-700 shadow-sm transition duration-100 hover:shadow-lg'
													>
														<p>{subtask.title}</p>
														{/* Thêm nút chuyển trạng thái mô phỏng */}
														<div className='mt-2 flex space-x-2'>
															{statusKey !== 'Done' && (
																<button
																	onClick={() =>
																		updateSubtaskStatus(task.id, subtask.id, 'Done')
																	}
																	className='text-xs font-semibold text-green-600 hover:text-green-800'
																>
																	Hoàn thành
																</button>
															)}
															{statusKey === 'Todo' && (
																<button
																	onClick={() =>
																		updateSubtaskStatus(
																			task.id,
																			subtask.id,
																			'In Progress'
																		)
																	}
																	className='text-xs font-semibold text-yellow-600 hover:text-yellow-800'
																>
																	Bắt đầu
																</button>
															)}
															{(statusKey === 'In Progress' || statusKey === 'Done') && (
																<button
																	onClick={() =>
																		updateSubtaskStatus(task.id, subtask.id, 'Todo')
																	}
																	className='text-xs font-semibold text-gray-500 hover:text-gray-700'
																>
																	Quay lại Todo
																</button>
															)}
														</div>
													</div>
												))}
											{task.subtasks.filter((s) => s.status === statusKey).length === 0 && (
												<p className='text-xs italic text-gray-400'>Không có công việc nào.</p>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)
				})}
			</div>
			{tasks.length === 0 && (
				<div className='rounded-xl bg-white p-10 text-center text-gray-500 shadow-lg'>
					<p className='text-lg'>Không có công việc nào được giao cho nhóm này. Hãy thử tạo một Task mới!</p>
				</div>
			)}
		</div>
	)
}

// Component Dashboard Tổng quan (Workspace Lớn)
const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ totalProgress, milestones, tasks }) => {
	// 1. Tính toán Milestone Stats
	const milestoneStats = useMemo(() => {
		const stats = { completed: 0, pendingReview: 0, inProgress: 0, overdue: 0, total: milestones.length }
		milestones.forEach((m) => {
			switch (m.status) {
				case 'Đã Hoàn thành':
					stats.completed++
					break
				case 'Đang Chờ Duyệt':
					stats.pendingReview++
					break
				case 'Đang Tiến hành':
					stats.inProgress++
					break
				case 'Quá Hạn':
					stats.overdue++
					break
			}
		})
		return stats
	}, [milestones])

	// 2. Tính toán Task Stats
	const taskStats = useMemo(() => {
		const stats = { todo: 0, inProgress: 0, done: 0, total: 0 }
		tasks.forEach((task) => {
			task.subtasks.forEach((subtask) => {
				stats.total++
				switch (subtask.status) {
					case 'Done':
						stats.done++
						break
					case 'In Progress':
						stats.inProgress++
						break
					case 'Todo':
						stats.todo++
						break
				}
			})
		})
		return stats
	}, [tasks])

	// 3. Tìm Milestone sắp đến hạn nhất
	const nextDueDate: string = useMemo(() => {
		const upcoming = milestones
			.filter((m) => m.status !== 'Đã Hoàn thành' && m.status !== 'Quá Hạn')
			.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
		return upcoming.length > 0 ? upcoming[0].dueDate : 'Chưa xác định'
	}, [milestones])

	// Thẻ thống kê chung
	const StatCard: React.FC<{
		title: string
		value: string | number
		icon: React.ElementType
		color: { bg: string; text: string }
	}> = ({ title, value, icon: Icon, color }) => (
		<div className='flex items-center space-x-4 rounded-xl border border-gray-100 bg-white p-5 shadow-md'>
			<div className={`rounded-full p-3 ${color.bg} ${color.text}`}>
				<Icon className='h-6 w-6' />
			</div>
			<div>
				<p className='text-sm font-medium text-gray-500'>{title}</p>
				<p className='text-2xl font-bold text-gray-900'>{value}</p>
			</div>
		</div>
	)

	return (
		<div className='min-h-screen space-y-8 bg-gray-100 p-6'>
			<h3 className='border-b pb-3 text-3xl font-extrabold text-gray-900'>Bảng Điều Khiển Tổng Quan</h3>

			{/* Hàng 1: Thẻ Tổng Quan & Tiến độ chung */}
			<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
				<StatCard
					title='Tiến độ Dự án Chung'
					value={`${totalProgress}%`}
					icon={LayoutDashboard}
					color={{ bg: 'bg-indigo-100', text: 'text-indigo-600' }}
				/>
				<StatCard
					title='Milestone Đã hoàn thành'
					value={milestoneStats.completed}
					icon={CheckCircle}
					color={{ bg: 'bg-green-100', text: 'text-green-600' }}
				/>
				<StatCard
					title='Công việc Đang làm'
					value={taskStats.inProgress}
					icon={Zap}
					color={{ bg: 'bg-yellow-100', text: 'text-yellow-600' }}
				/>
				<StatCard
					title='Hạn chót Sắp tới'
					value={nextDueDate}
					icon={Clock}
					color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
				/>
			</div>

			{/* Hàng 2: Trạng thái chi tiết Milestones và Tasks */}
			<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
				{/* Cột 1: Thống kê Milestone */}
				<div className='rounded-xl border border-gray-200 bg-white p-6 shadow-lg lg:col-span-1'>
					<h4 className='mb-4 text-xl font-bold text-gray-800'>Trạng thái Milestones</h4>
					<div className='space-y-3'>
						<p className='flex justify-between text-gray-700'>
							<span>Tổng số Milestones:</span>{' '}
							<span className='font-semibold'>{milestoneStats.total}</span>
						</p>
						<p className='flex justify-between text-green-600'>
							<span>Đã Hoàn thành:</span>{' '}
							<span className='font-semibold'>{milestoneStats.completed}</span>
						</p>
						<p className='flex justify-between text-blue-600'>
							<span>Đang Chờ Duyệt:</span>{' '}
							<span className='font-semibold'>{milestoneStats.pendingReview}</span>
						</p>
						<p className='flex justify-between text-yellow-600'>
							<span>Đang Tiến hành:</span>{' '}
							<span className='font-semibold'>{milestoneStats.inProgress}</span>
						</p>
						<p className='flex justify-between text-red-600'>
							<span>Quá Hạn:</span> <span className='font-semibold'>{milestoneStats.overdue}</span>
						</p>
					</div>
				</div>

				{/* Cột 2: Thống kê Tasks */}
				<div className='rounded-xl border border-gray-200 bg-white p-6 shadow-lg lg:col-span-1'>
					<h4 className='mb-4 text-xl font-bold text-gray-800'>Trạng thái Công việc (Subtasks)</h4>
					<div className='space-y-3'>
						<p className='flex justify-between text-gray-700'>
							<span>Tổng số Subtasks:</span> <span className='font-semibold'>{taskStats.total}</span>
						</p>
						<p className='flex justify-between text-gray-500'>
							<span>Todo:</span> <span className='font-semibold'>{taskStats.todo}</span>
						</p>
						<p className='flex justify-between text-yellow-600'>
							<span>In Progress:</span> <span className='font-semibold'>{taskStats.inProgress}</span>
						</p>
						<p className='flex justify-between text-green-600'>
							<span>Done:</span> <span className='font-semibold'>{taskStats.done}</span>
						</p>
						<p className='mt-2 text-xs italic text-gray-400'>
							Dữ liệu tính trên {tasks.length} Task chính.
						</p>
					</div>
				</div>

				{/* Cột 3: Hoạt động gần đây */}
				<div className='rounded-xl border border-gray-200 bg-white p-6 shadow-lg lg:col-span-1'>
					<h4 className='mb-4 text-xl font-bold text-gray-800'>Hoạt động Gần đây</h4>
					<div className='space-y-4'>
						{mockActivities.map((activity) => (
							<div key={activity.id} className='border-l-2 border-indigo-400 pl-3 text-sm'>
								<p className='text-gray-800'>
									<span className='font-semibold text-indigo-600'>{activity.user}</span>{' '}
									{activity.action} <span className='font-medium'>[{activity.type}]</span>:{' '}
									<span className='italic'>{activity.target}</span>
								</p>
								<p className='text-xs text-gray-500'>{activity.time}</p>
							</div>
						))}
					</div>
				</div>
			</div>
			{/* Thanh tiến độ chi tiết */}
			<div className='rounded-xl border border-gray-200 bg-white p-6 shadow-lg'>
				<h4 className='mb-3 text-xl font-bold text-gray-800'>Tiến độ Hoàn thành Mục tiêu</h4>
				<ProgressBar
					progress={totalProgress}
					status={totalProgress === 100 ? 'Đã Hoàn thành' : 'Đang Tiến hành'}
				/>
			</div>
		</div>
	)
}

// Component chính của ứng dụng
const ManageGroupPage: React.FC = () => {
	const [selectedGroupId, setSelectedGroupId] = useState<number>(mockGroups[0].id)
	const [activeTab, setActiveTab] = useState<string>('overview')
	const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones)
	const [tasks, setTasks] = useState<Task[]>(initialTasks)

	// Hàm cập nhật Milestone
	const updateMilestone = (
		id: number,
		newProgress: number,
		newStatus: Milestone['status'],
		newScore: number | null = undefined as unknown as number | null,
		newFeedback: string = undefined as unknown as string
	): void => {
		setMilestones((prevMilestones) =>
			prevMilestones.map((m) => {
				if (m.id === id) {
					let updatedMilestone: Milestone = {
						...m,
						progress: newProgress,
						status: newStatus
					}

					// Cập nhật chi tiết nộp bài (Chỉ cho hành động Giảng viên)
					if (newScore !== undefined || newFeedback !== undefined) {
						// Đảm bảo submission không bị null nếu Giảng viên đánh giá
						updatedMilestone.submission = updatedMilestone.submission
							? { ...updatedMilestone.submission }
							: {
									date: new Date().toISOString().slice(0, 10), // Giả lập ngày nộp
									files: [],
									score: null,
									feedback: ''
								}

						if (newScore !== undefined) {
							updatedMilestone.submission.score = newScore
						}
						if (newFeedback !== undefined) {
							updatedMilestone.submission.feedback = newFeedback
						}
					}

					return updatedMilestone
				}
				return m
			})
		)
	}

	// Tính tổng tiến độ
	const totalProgress = useMemo<number>(() => {
		if (milestones.length === 0) return 0
		const completedProgress = milestones.reduce((sum, m) => sum + m.progress, 0)
		return Math.round(completedProgress / milestones.length)
	}, [milestones])

	const activeGroup: Group = useMemo(() => {
		return mockGroups.find((g) => g.id === selectedGroupId) || mockGroups[0]
	}, [selectedGroupId])

	const renderContent = (): JSX.Element => {
		switch (activeTab) {
			case 'overview':
				return <OverviewDashboard totalProgress={totalProgress} milestones={milestones} tasks={tasks} />
			case 'message':
				return (
					<div className='p-6 text-gray-700'>
						Đây là khu vực Tin Nhắn (Chatbox) với nhóm **{activeGroup.name}**.
					</div>
				)
			case 'milestone':
				return (
					<MilestoneManager
						milestones={milestones}
						totalProgress={totalProgress}
						updateMilestone={updateMilestone}
					/>
				)
			case 'task':
				return <TaskManager tasks={tasks} setTasks={setTasks} />
			case 'members':
				return (
					<div className='p-6 text-gray-700'>
						Đây là khu vực Quản lý Thành viên của nhóm **{activeGroup.name}**.
					</div>
				)
			default:
				return <div className='p-6 text-gray-700'>Chọn tab để xem nội dung.</div>
		}
	}

	const navItems = [
		{ id: 'overview', label: 'Tổng Quan', icon: LayoutDashboard },
		{ id: 'message', label: 'Tin Nhắn', icon: MessageSquare },
		{ id: 'milestone', label: 'Milestone', icon: ListChecks },
		{ id: 'task', label: 'Công Việc', icon: GitCommit },
		{ id: 'members', label: 'Thành Viên', icon: Users }
	]

	return (
		<div className='flex h-screen bg-gray-100 font-sans antialiased'>
			{/* Sidebar - Danh sách Nhóm (Cột trái) */}
			<div className='flex w-full flex-col overflow-y-auto border-r border-gray-200 bg-white sm:w-80'>
				<div className='sticky top-0 z-10 border-b bg-white p-5'>
					<h1 className='text-xl font-bold text-gray-900'>Quản lý Nhóm</h1>
					<p className='text-sm text-gray-500'>Giảng viên: Jane Doe</p>
				</div>
				<nav className='flex-grow space-y-1 p-2'>
					{mockGroups.map((group) => (
						<div
							key={group.id}
							onClick={() => {
								setSelectedGroupId(group.id)
								setActiveTab('overview')
							}}
							className={`cursor-pointer rounded-xl p-3 transition duration-150 ${
								selectedGroupId === group.id
									? 'bg-indigo-600 text-white shadow-md'
									: 'text-gray-800 hover:bg-gray-100'
							}`}
						>
							<p className='truncate font-semibold'>{group.name}</p>
							<p
								className={`truncate text-xs ${selectedGroupId === group.id ? 'text-indigo-200' : 'text-gray-500'}`}
							>
								{group.lastMessage}
							</p>
						</div>
					))}
				</nav>
			</div>

			{/* Main Content (Cột phải) */}
			<div className='flex flex-1 flex-col overflow-hidden'>
				{/* Header - Thanh điều hướng Tab */}
				<header className='sticky top-0 z-10 border-b bg-white shadow-sm'>
					<div className='flex items-center justify-between border-b p-4'>
						<h2 className='truncate text-2xl font-bold text-gray-900'>{activeGroup.name}</h2>
						<div className='hidden sm:block'>
							<StatusTag
								status={
									totalProgress === 100
										? 'Đã Hoàn thành'
										: totalProgress > 0
											? 'Đang Tiến hành'
											: 'Mới'
								}
								type='milestone'
							/>
						</div>
					</div>
					<div className='flex border-b'>
						{navItems.map((item) => (
							<button
								key={item.id}
								onClick={() => setActiveTab(item.id)}
								className={`flex items-center border-b-2 px-4 py-3 text-sm font-medium transition duration-150 ${
									activeTab === item.id
										? 'border-indigo-600 text-indigo-600'
										: 'border-transparent text-gray-600 hover:border-gray-300 hover:text-indigo-600'
								}`}
							>
								<item.icon className='mr-2 h-5 w-5' />
								{item.label}
							</button>
						))}
					</div>
				</header>

				{/* Nội dung chính dựa trên Tab */}
				<main className='flex-1 overflow-y-auto'>{renderContent()}</main>
			</div>
		</div>
	)
}

export default ManageGroupPage
