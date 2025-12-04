/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, CheckSquare } from 'lucide-react'
import { useState, useEffect, type SetStateAction, type Dispatch } from 'react'
import { Input } from '@/components/ui/input'
import { PhaseInfo, PhaseStatusMap } from '@/utils/utils'
import { LecturerMultiSelect } from '../LecturerMultiSelect'
import type { PhaseType } from '@/models/period.model'
import { useGetAllLecturersComboboxQuery } from '@/services/lecturerApi'
import type { PeriodPhase } from '@/models/period-phase.models'
import {
	useCreateCompletionPhaseMutation,
	useCreateExecutionPhaseMutation,
	useCreateOpenRegPhaseMutation,
	useCreateSubmitTopicPhaseMutation
} from '@/services/periodApi'
import { toast } from '@/hooks/use-toast'
import { toInputDateTime } from '../../utils'

interface Props {
	open: boolean
	onOpenChange: Dispatch<SetStateAction<boolean>>
	phase: PeriodPhase | undefined
	currentPhase: PhaseType
	periodId: string
	onSuccess: () => void
}

export function PhaseSettingsModal({ open, onOpenChange, phase, currentPhase, periodId, onSuccess }: Props) {
	const [startTime, setStartTime] = useState(toInputDateTime(phase?.startTime) ?? '')
	const [endTime, setEndTime] = useState(toInputDateTime(phase?.endTime) ?? '')

	const [minTopics, setMinTopics] = useState(phase?.minTopicsPerLecturer ?? 1)
	const [selectedLecturerIds, setSelectedLecturerIds] = useState<string[]>(
		phase?.requiredLecturers?.map((lec) => lec._id) ?? []
	)
	const [allowManualApproval, setAllowManualApproval] = useState(phase?.allowManualApproval ?? false)

	const { data: lecturersByFaculty } = useGetAllLecturersComboboxQuery({ limit: 1000, page: 1, sort_order: 'desc' })

	const isPhase1 = currentPhase === 'empty' || currentPhase === 'submit_topic'
	const isTimeInvalid = startTime && endTime ? new Date(endTime).getTime() <= new Date(startTime).getTime() : false
	const effectivePhaseKey = currentPhase === 'empty' ? 'submit_topic' : currentPhase

	const [createSubmitTopicPhase, { isLoading: isLoadingSubmit }] = useCreateSubmitTopicPhaseMutation()
	const [createExecutionPhase, { isLoading: isLoadingExecution }] = useCreateExecutionPhaseMutation()
	const [createOpenRegPhase, { isLoading: isLoadingOpenReg }] = useCreateOpenRegPhaseMutation()
	const [createCompletionPhase, { isLoading: isLoadingCompletion }] = useCreateCompletionPhaseMutation()

	const phaseHookMap: Record<string, any> = {
		submit_topic: createSubmitTopicPhase,
		execution: createExecutionPhase,
		open_registration: createOpenRegPhase,
		completion: createCompletionPhase
	}
	const phaseLoadingMap: Record<string, boolean> = {
		submit_topic: isLoadingSubmit,
		execution: isLoadingExecution,
		open_registration: isLoadingOpenReg,
		completion: isLoadingCompletion
	}

	const phasePayloadExtras: Record<string, any> = {
		submit_topic: {
			minTopicsPerLecturer: minTopics,
			requiredLecturerIds: selectedLecturerIds,
			allowManualApproval
		},
		execution: {},
		open_registration: {},
		completion: {}
	}

	useEffect(() => {
		setStartTime(toInputDateTime(phase?.startTime))
		setEndTime(toInputDateTime(phase?.endTime))
		setMinTopics(phase?.minTopicsPerLecturer ?? 1)
		setSelectedLecturerIds(phase?.requiredLecturers?.map((lec) => lec._id) ?? [])
		setAllowManualApproval(phase?.allowManualApproval ?? false)
	}, [isPhase1, phase])

	const handleSave = async () => {
		let payload: any = { startTime, endTime }
		if (phasePayloadExtras[effectivePhaseKey]) payload = { ...payload, ...phasePayloadExtras[effectivePhaseKey] }

		const hook = phaseHookMap[effectivePhaseKey]
		if (!hook) return console.error('Invalid currentPhase:', currentPhase)

		try {
			const response = await hook({ periodId, body: payload }).unwrap()
			onSuccess?.()
			onOpenChange(false)
			toast({
				title: response.message,
				variant: 'success'
			})
		} catch (err) {
			console.error(err)
			toast({
				title: 'Đã có lỗi xảy ra',
				variant: 'destructive'
			})
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='flex max-w-xl flex-col'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-lg font-semibold'>
						Thiết lập pha '{PhaseInfo[phase?.phase ?? 'empty']?.label ?? 'Không xác định'}' :
						<Badge
							variant={
								PhaseStatusMap[phase?.status ?? 'not_started']?.variant ??
								'bg-muted text-muted-foreground'
							}
						>
							{PhaseStatusMap[phase?.status ?? 'not_started']?.text ?? 'Chưa xác định'}
						</Badge>
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
									allLecturers={lecturersByFaculty?.data ?? []}
									selected={selectedLecturerIds}
									onChange={setSelectedLecturerIds}
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
				</div>

				<DialogFooter>
					<Button onClick={handleSave} disabled={isTimeInvalid || phaseLoadingMap[effectivePhaseKey]}>
						{phaseLoadingMap[effectivePhaseKey] ? 'Đang lưu...' : 'Lưu thay đổi'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
