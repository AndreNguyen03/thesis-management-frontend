/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Loader2, Users } from 'lucide-react'
import { useState, useEffect, type SetStateAction, type Dispatch, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { PhaseInfo, PhaseStatusMap } from '@/utils/utils'
import { LecturerMultiSelect } from '../LecturerMultiSelect'
import type { PhaseType } from '@/models/period.model'
import type { PeriodPhase } from '@/models/period-phase.models'
import {
	useCreateCompletionPhaseMutation,
	useCreateExecutionPhaseMutation,
	useCreateOpenRegPhaseMutation,
	useCreateSubmitTopicPhaseMutation,
	useGetPeriodDetailQuery
} from '@/services/periodApi'
import { toast } from '@/hooks/use-toast'
import { toInputDateTime } from '../../utils'
import type { ResponseMiniLecturerDto } from '@/models'
import { getDurationString } from '@/lib/utils'
interface Props {
	open: boolean
	onOpenChange: Dispatch<SetStateAction<boolean>>
	phase: PeriodPhase | undefined
	currentPhase: PhaseType
	periodId: string
	onSuccess: () => void
	lecturers: ResponseMiniLecturerDto[]
}

export function PhaseSettingsModal({ open, onOpenChange, phase, currentPhase, periodId, onSuccess, lecturers }: Props) {
	const [startTime, setStartTime] = useState(toInputDateTime(phase?.startTime) ?? '')
	const [endTime, setEndTime] = useState(toInputDateTime(phase?.endTime) ?? '')
	const [isChangeAvailable, setIsChangeAvailable] = useState(false)
	const [minTopics, setMinTopics] = useState(phase?.minTopicsPerLecturer ?? 1)
	const [selectedLecturerIds, setSelectedLecturerIds] = useState<string[]>(
		phase?.requiredLecturers?.map((lec) => lec._id) ?? []
	)
	//lấy thông tin kỳ hiện
	const { data: periodDetail, isLoading: isLoadingPeriodDetail } = useGetPeriodDetailQuery(periodId)
	const isPhase1 = currentPhase === 'empty' || currentPhase === 'submit_topic'
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
			requiredLecturerIds: selectedLecturerIds
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
	useMemo(() => {
		setIsChangeAvailable(isValidTimeRange(startTime, endTime))
	}, [startTime, endTime])
	function isValidTimeRange(start: string, end: string) {
		if (!start || !end) return false
		return new Date(end) > new Date(start)
	}
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='flex max-w-xl flex-col'>
				<DialogHeader>
					<DialogTitle className='flex flex-col items-start gap-2 text-lg font-semibold'>
						<div className='flex gap-2'>
							Thiết lập pha{' '}
							<span className='text-lg font-semibold text-blue-600'>
								{PhaseInfo[currentPhase ?? 'empty']?.label ?? 'Không xác định'}
							</span>
						</div>
						{isLoadingPeriodDetail ? (
							<Loader2 className='h-4 w-4 animate-spin' />
						) : (
							<div className='flex gap-1'>
								<span className='text-sm font-medium'>Thời gian của kỳ</span>
								<span
									className='text-sm font-medium'
									title={`${new Date(periodDetail!.startTime).toLocaleString()} - ${new Date(periodDetail!.endTime).toLocaleString()}`}
								>
									{new Date(periodDetail!.startTime).toLocaleString('vi-VN')} -{' '}
									{new Date(periodDetail!.endTime).toLocaleString('vi-VN')}
								</span>
							</div>
						)}
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
								<label className='text-sm font-medium'>Bắt đầu </label>
								<input
									type='datetime-local'
									className='w-full rounded border px-3 py-2'
									value={startTime}
									min={
										new Date(periodDetail!.startTime) > new Date(Date.now())
											? new Date(periodDetail!.startTime).toISOString().slice(0, 16)
											: new Date(Date.now() + 86400000).toISOString().slice(0, 16)
									}
									step='60'
									onChange={(e) => setStartTime(e.target.value)}
									placeholder='dd/mm/yyyy hh:mm'
								/>
							</div>

							<div>
								<label className='text-sm font-medium'>Kết thúc </label>
								{isLoadingPeriodDetail ? (
									<Loader2 className='h-4 w-4 animate-spin' />
								) : (
									<>
										<input
											disabled={!startTime}
											type='datetime-local'
											className={`w-full rounded border px-3 py-2 ${!isChangeAvailable && 'border-red-500'}`}
											min={new Date(periodDetail!.startTime).toISOString().slice(0, 16)}
											max={new Date(periodDetail!.endTime).toISOString().slice(0, 16)}
											value={endTime}
											step='60'
											onChange={(e) => setEndTime(e.target.value)}
											placeholder='dd/mm/yyyy hh:mm'
										/>
										{!isChangeAvailable && (
											<p className='text-xs text-red-500'>* Kết thúc phải sau bắt đầu</p>
										)}
									</>
								)}
							</div>
						</div>
						{startTime && endTime && (
							<div>
								<span className='text-sm font-semibold'>Dự kiến</span>
								<span></span>
								{startTime && endTime && isChangeAvailable && (
									<span className='ml-2 text-sm text-blue-600'>
										{getDurationString(startTime, endTime)}
									</span>
								)}
							</div>
						)}
					</section>

					{/* PHASE 1 SETTINGS */}
					{isPhase1 && (
						<section className='space-y-4 rounded-lg border p-4'>
							<div className='flex items-center gap-2 font-semibold'>
								<Users className='h-5 w-5 text-primary' />
								Cài đặt dành riêng cho Pha 1
							</div>

							<div className='flex items-center gap-2'>
								<label className='text-sm font-medium'>Số đề tài tối thiểu mỗi giảng viên</label>
								<Input
									type='number'
									className='w-fit'
									min={1}
									value={minTopics}
									onChange={(e) => setMinTopics(Number(e.target.value))}
								/>
							</div>

							<div>
								<LecturerMultiSelect
									allLecturers={lecturers ?? []}
									selected={selectedLecturerIds}
									onChange={setSelectedLecturerIds}
								/>
							</div>
						</section>
					)}
				</div>

				<DialogFooter>
					<div className='flex justify-between'>
						<Button onClick={handleSave} disabled={!isChangeAvailable}>
							{phaseLoadingMap[effectivePhaseKey] ? 'Đang lưu...' : 'Lưu thay đổi'}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
