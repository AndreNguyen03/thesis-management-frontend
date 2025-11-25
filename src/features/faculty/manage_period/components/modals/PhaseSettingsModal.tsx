/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, CheckSquare } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import type { PhaseType } from '@/models/period'
import { PhaseInfo, PhaseStatusMap } from '@/utils/utils'
import { LecturerMultiSelect } from '../LecturerMultiSelect'
import { useAppSelector } from '@/store'
import type { FacultyBoardProfile } from '@/models'
import { useGetLecturersByFacultyQuery } from '@/services/lecturerApi'

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
	phase: PhaseType
	status: 'not_started' | 'ongoing' | 'completed'

	// data từ backend
	initialStart?: string
	initialEnd?: string

	// Phase 1
	initialMinTopics?: number
	initialLecturers?: string[]
	initialAllowManual?: boolean

	// Phase 2, 3, 4 có thể thêm sau
	// initialMaxTopics?: number

	onSubmit?: (data: any) => void
}

// cấu hình cho từng phase, mở rộng dễ dàng
const phaseConfigMap: Record<
	PhaseType,
	{
		showPhase1Settings?: boolean
		showRegistrationSettings?: boolean
		showExecutionSettings?: boolean
		showCompletionSettings?: boolean
	}
> = {
	empty: {},
	submit_topic: { showPhase1Settings: true },
	open_registration: { showRegistrationSettings: true },
	execution: { showExecutionSettings: true },
	completion: { showCompletionSettings: true }
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

	// Phase 1
	const [minTopics, setMinTopics] = useState(initialMinTopics)
	const [selectedLecturers, setSelectedLecturers] = useState<string[]>(initialLecturers)
	const [allowManualApproval, setAllowManualApproval] = useState(initialAllowManual)

	const facultyId = useAppSelector((state) => (state.auth.user as FacultyBoardProfile).facultyId)
	const { data: lecturersByFaculty } = useGetLecturersByFacultyQuery(facultyId)

	const config = phaseConfigMap[phase] || {}

	const isTimeInvalid = startTime && endTime ? new Date(endTime).getTime() <= new Date(startTime).getTime() : false

	// Khởi tạo state mỗi lần mở modal hoặc data backend thay đổi
	useEffect(() => {
		setStartTime(initialStart)
		setEndTime(initialEnd)

		if (config.showPhase1Settings) {
			setMinTopics(initialMinTopics)
			setSelectedLecturers(initialLecturers)
			setAllowManualApproval(initialAllowManual)
		}
	}, [initialStart, initialEnd, initialMinTopics, initialLecturers, initialAllowManual, phase])

	const handleSave = () => {
		let payload: any = { startTime, endTime }

		// Phase 1 settings
		if (config.showPhase1Settings) {
			payload = {
				...payload,
				minTopicsPerLecturer: minTopics,
				requiredLecturerIds: selectedLecturers,
				allowManualApproval
			}
		}

		// các phase khác có thể thêm payload tương tự
		// if (config.showRegistrationSettings) {...}

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
					{config.showPhase1Settings && (
						<section className='space-y-4 rounded-lg border p-4'>
							<div className='flex items-center gap-2 font-semibold'>
								<Users className='h-5 w-5 text-primary' />
								Cài đặt dành riêng cho Pha 1
							</div>

							<div>
								<label className='text-sm font-medium'>Số đề tài tối thiểu mỗi giảng viên</label>
								<Input
									type='number'
									min={1}
									value={minTopics}
									onChange={(e) => setMinTopics(Number(e.target.value))}
								/>
							</div>

							<div>
								<LecturerMultiSelect
									allLecturers={lecturersByFaculty}
									selected={selectedLecturers}
									onChange={setSelectedLecturers}
								/>
							</div>

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

					{/* Các phase khác có thể render ở đây khi config.showRegistrationSettings / showExecutionSettings ... */}
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
