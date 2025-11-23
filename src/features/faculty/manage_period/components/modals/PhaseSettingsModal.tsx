/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, CheckSquare } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import type { PhaseType } from '@/models/period'
import { PhaseInfo, PhaseStatusMap } from '@/utils/utils'
import { LecturerMultiSelect } from '../LecturerMultiSelect'

const allLecturersMock = [
	{ id: "gv1", name: "Giảng viên A" },
	{ id: "gv2", name: "Giảng viên B" },
	{ id: "gv3", name: "Giảng viên C" },
]
interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	phase: PhaseType
	status: 'not_started' | 'ongoing' | 'completed'

	initialStart?: string
	initialEnd?: string

	// Phase 1 only
	initialMinTopics?: number
	initialLecturers?: string[]
	initialAllowManual?: boolean

	onSubmit?: (data: any) => void
}

export function PhaseSettingsModal({
	open,
	onOpenChange,
	phase,
	status,
	initialStart = '',
	initialEnd = '',
	initialMinTopics = 1,
	initialLecturers = [],
	initialAllowManual = false,
	onSubmit
}: Props) {
	const [startTime, setStartTime] = useState(initialStart)
	const [endTime, setEndTime] = useState(initialEnd)

	// Phase 1:
	const [minTopics, setMinTopics] = useState(initialMinTopics)
	const [selectedLecturers, setSelectedLecturers] = useState<string[]>(initialLecturers)
	const [allowManualApproval, setAllowManualApproval] = useState(initialAllowManual)

	const isPhase1 = phase === 'submit_topic'

	const isTimeInvalid = startTime && endTime ? endTime <= startTime : false

	// -----------------------------
	// Submit handler to match DTO
	// -----------------------------
	const handleSave = () => {
		let payload: any = {
			startTime,
			endTime
		}

		if (isPhase1) {
			payload = {
				...payload,
				minTopicsPerLecturer: minTopics,
				requiredLecturerIds: selectedLecturers,
				allowManualApproval
			}
		}

		onSubmit?.(payload)
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='flex max-w-xl flex-col'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-lg font-semibold'>
						Thiết lập pha '{PhaseInfo[phase].label}' :
						<Badge variant={PhaseStatusMap[status].variant}>{PhaseStatusMap[status].text}</Badge>
					</DialogTitle>
				</DialogHeader>

				<div className='max-h-[70vh] space-y-6 overflow-y-auto pr-1'>
					{/* TIME SETTINGS */}
					<section className='space-y-4 rounded-lg border p-4'>
						<div className='flex items-center gap-2 font-semibold'>
							<Calendar className='h-5 w-5 text-primary' />
							Thời gian pha
						</div>

						<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
							<div>
								<label className='text-sm font-medium'>Bắt đầu</label>
								<input
									type='datetime-local'
									className='w-full rounded border px-3 py-2'
									value={startTime}
									onChange={(e) => setStartTime(e.target.value)}
								/>
							</div>
							<div>
								<label className='text-sm font-medium'>Kết thúc</label>
								<input
									type='datetime-local'
									className={`w-full rounded border px-3 py-2 ${
										isTimeInvalid ? 'border-red-500' : ''
									}`}
									value={endTime}
									onChange={(e) => setEndTime(e.target.value)}
								/>
								{isTimeInvalid && <p className='text-xs text-red-500'>* Kết thúc phải sau bắt đầu</p>}
							</div>
						</div>
					</section>

					{/* PHASE 1 SETTINGS */}
					{isPhase1 && (
						<section className='space-y-4 rounded-lg border p-4'>
							<div className='flex items-center gap-2 font-semibold'>
								<Users className='h-5 w-5 text-primary' />
								Cài đặt dành riêng cho Pha 1
							</div>

							{/* min topics */}
							<div>
								<label className='text-sm font-medium'>Số đề tài tối thiểu mỗi giảng viên</label>
								<Input
									type='number'
									min={1}
									value={minTopics}
									onChange={(e) => setMinTopics(Number(e.target.value))}
								/>
							</div>

							{/* Required lecturers */}
							<div>
								<LecturerMultiSelect
									allLecturers={allLecturersMock}
									selected={selectedLecturers}
									onChange={setSelectedLecturers}
								/>
							</div>

							{/* Allow manual approval */}
							<div className='mt-2 flex items-center gap-2'>
								<CheckSquare className='h-5 w-5 text-primary' />
								<label className='flex select-none items-center gap-2'>
									<input
										type='checkbox'
										checked={allowManualApproval}
										onChange={(e) => setAllowManualApproval(e.target.checked)}
									/>
									Cho phép duyệt sinh viên (đề tài NCKH)
								</label>
							</div>
						</section>
					)}
				</div>

				<DialogFooter>
					<Button onClick={handleSave} disabled={isTimeInvalid}>
						Lưu thay đổi
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
