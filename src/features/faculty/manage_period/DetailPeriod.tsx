import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PhaseStepBar } from './components/PhaseStepBar'
import { PhaseContent } from './components/PhaseContent'
import { Button } from '@/components/ui/button'
import { mockPeriods } from './mockData'
import type { Phase } from '@/models/period'
import { usePageBreadcrumb } from '@/hooks'

const phases: Phase[] = [
	{
		id: 1,
		name: 'Nộp đề tài',
		description: 'Giảng viên nộp đề tài',
		status: 'completed'
	},
	{
		id: 2,
		name: 'Mở đăng ký',
		description: 'Sinh viên đăng ký',
		status: 'active'
	},
	{
		id: 3,
		name: 'Thực hiện',
		description: 'Thực hiện đề tài',
		status: 'active'
	},
	{
		id: 4,
		name: 'Hoàn thành',
		description: 'Kết thúc và lưu trữ',
		status: 'active'
	}
]

export default function DetailPeriodPage() {
	const { id } = useParams()
	const navigate = useNavigate()
	const period = mockPeriods.find((p) => p.id === id)
	const [currentPhase, setCurrentPhase] = useState(period?.currentPhase || 1)

	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý đợt đăng ký', path: '/manage-period' },
		{ label: period!.name, path: '/period/:id' }
	])
	if (!period) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='text-center'>
					<h2 className='mb-2 text-2xl font-bold'>Không tìm thấy đợt đăng ký</h2>
					<Button onClick={() => navigate('/')}>Quay lại</Button>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen'>
			{/* Main Layout */}
			<div className='flex w-full'>
				{/* Sidebar - Step Bar */}
				<aside className='sticky top-0 h-screen w-[10%] min-w-[120px] border-r'>
					<PhaseStepBar
						phases={phases}
						currentPhase={currentPhase}
						onPhaseChange={(phase) => setCurrentPhase(phase as 1 | 2 | 3 | 4)}
					/>
				</aside>

				{/* Main Content */}
				<main className='w-[90%] flex-1 '>
					<div className='container mx-auto max-w-7xl'>
						<PhaseContent phase={currentPhase} periodId={period.id} />
					</div>
				</main>
			</div>
		</div>
	)
}
