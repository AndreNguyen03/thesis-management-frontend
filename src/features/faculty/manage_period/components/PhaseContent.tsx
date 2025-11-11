import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent} from '@/components/ui/card'
import { StatsCards } from './StatsCards'
import { TopicsTable } from './TopicsTable'
import { getPhaseStats, mockTopicsPhase1, mockTopicsPhase2, mockTopicsPhase3, mockTopicsPhase4 } from '../mockData'
import { ArrowRight, Settings, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { PhaseSettingsModal } from './modals/PhaseSettingsModal'
import { SaveToLibraryModal } from './modals/SaveToLibraryModal'

interface PhaseContentProps {
	phase: number
	periodId: string
}

export function PhaseContent({ phase }: PhaseContentProps) {
	const [phaseSettingsOpen, setPhaseSettingsOpen] = useState(false)
	const [saveToLibraryOpen, setSaveToLibraryOpen] = useState(false)

	// 👉 Giả lập trạng thái pha đã thiết lập hay chưa
	const [phaseConfigured, setPhaseConfigured] = useState(false)

	const stats = getPhaseStats(phase)

	const getTopicsForPhase = () => {
		switch (phase) {
			case 1:
				return mockTopicsPhase1
			case 2:
				return mockTopicsPhase2
			case 3:
				return mockTopicsPhase3
			case 4:
				return mockTopicsPhase4
			default:
				return []
		}
	}

	const getPhaseActions = () => {
		if (phase === 4 && phaseConfigured) {
			return (
				<div className='flex gap-3'>
					<Button onClick={() => setSaveToLibraryOpen(true)}>
						<ArrowRight className='mr-2 h-4 w-4' />
						Lưu vào Thư viện số
					</Button>
				</div>
			)
		}

		return (
			<div className='flex gap-3'>
				<Button onClick={() => setPhaseSettingsOpen(true)} variant={phaseConfigured ? 'outline' : 'default'}>
					{phaseConfigured ? (
						<>
							<Eye className='mr-2 h-4 w-4' />
							Xem / Chỉnh sửa thiết lập
						</>
					) : (
						<>
							<Settings className='mr-2 h-4 w-4' />
							Thiết lập Pha
						</>
					)}
				</Button>
			</div>
		)
	}

	return (
		<motion.div
			key={phase}
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='space-y-6'
		>
			{/* Nếu chưa thiết lập thì hiển thị thông báo */}
			{!phaseConfigured ? (
				<Card className='border-dashed border-primary/30 bg-primary/5 p-8 text-center'>
					<p className='mb-4 text-muted-foreground'>
						Pha {phase} chưa được thiết lập. Vui lòng thiết lập để bắt đầu quản lý.
					</p>
					<Button onClick={() => setPhaseSettingsOpen(true)}>
						<Settings className='mr-2 h-4 w-4' /> Thiết lập ngay
					</Button>
				</Card>
			) : (
				<>
					{/* Statistics */}
					<div>
						<h3 className='mb-4 text-lg font-semibold'>Thống kê tổng quan</h3>
						<StatsCards stats={stats} />
					</div>

					{/* Topics Table */}
					<div>
						<h3 className='mb-4 text-lg font-semibold'>Danh sách đề tài</h3>
						<TopicsTable topics={getTopicsForPhase()} phase={phase} />
					</div>

					{/* Ví dụ nút chuyển pha */}
					{phase === 1 && (
						<Card className='border-primary/20 bg-primary/5'>
							<CardContent className='pt-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='font-medium'>Đủ điều kiện chuyển pha</p>
										<p className='text-sm text-muted-foreground'>
											Đã có 98 đề tài được duyệt, đủ điều kiện chuyển sang Pha 2
										</p>
									</div>
									<Button size='lg'>
										Chuyển sang Pha 2
										<ArrowRight className='ml-2 h-4 w-4' />
									</Button>
								</div>
							</CardContent>
						</Card>
					)}
				</>
			)}

			{/* Modals */}
			<PhaseSettingsModal
				open={phaseSettingsOpen}
				onOpenChange={(open) => {
					setPhaseSettingsOpen(open)
					// Sau khi đóng modal, giả lập rằng đã thiết lập xong
					if (!open) setPhaseConfigured(true)
				}}
				phase={phase}
			/>
			<SaveToLibraryModal open={saveToLibraryOpen} onOpenChange={setSaveToLibraryOpen} />
		</motion.div>
	)
}

