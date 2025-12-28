/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Calendar, Users, Check } from 'lucide-react'
import { useState, useEffect, type SetStateAction, type Dispatch } from 'react'
import { Input } from '@/components/ui/input'
import { PhaseInfo } from '@/utils/utils'
import { LecturerMultiSelect } from '../LecturerMultiSelect'
import type { PhaseType } from '@/models/period.model'
import {
	useCreateCompletionPhaseMutation,
	useCreateExecutionPhaseMutation,
	useCreateOpenRegPhaseMutation,
	useCreateSubmitTopicPhaseMutation
} from '@/services/periodApi'
import { toast } from '@/hooks/use-toast'
import type { ResponseMiniLecturerDto } from '@/models'
import { cn } from '@/lib/utils'

interface Props {
	open: boolean
	onOpenChange: Dispatch<SetStateAction<boolean>>
	periodId: string
	onSuccess: () => void
	lecturers: ResponseMiniLecturerDto[]
}

interface PhaseConfig {
	startTime: string
	endTime: string
	minTopicsPerLecturer?: number
	requiredLecturerIds?: string[]
}

const PHASES_ORDER: PhaseType[] = ['submit_topic', 'open_registration', 'execution', 'completion']

export function MultiPhaseSetupModal({ open, onOpenChange, periodId, onSuccess, lecturers }: Props) {
	const [selectedPhases, setSelectedPhases] = useState<PhaseType[]>(['submit_topic'])
	const [phaseConfigs, setPhaseConfigs] = useState<Record<PhaseType, PhaseConfig>>({
		submit_topic: { startTime: '', endTime: '', minTopicsPerLecturer: 1, requiredLecturerIds: [] },
		open_registration: { startTime: '', endTime: '' },
		execution: { startTime: '', endTime: '' },
		completion: { startTime: '', endTime: '' }
	})

	const [createSubmitTopicPhase, { isLoading: isLoadingSubmit }] = useCreateSubmitTopicPhaseMutation()
	const [createOpenRegPhase, { isLoading: isLoadingOpenReg }] = useCreateOpenRegPhaseMutation()
	const [createExecutionPhase, { isLoading: isLoadingExecution }] = useCreateExecutionPhaseMutation()
	const [createCompletionPhase, { isLoading: isLoadingCompletion }] = useCreateCompletionPhaseMutation()

	const isLoading = isLoadingSubmit || isLoadingOpenReg || isLoadingExecution || isLoadingCompletion

	const phaseHookMap: Record<PhaseType, any> = {
		submit_topic: createSubmitTopicPhase,
		open_registration: createOpenRegPhase,
		execution: createExecutionPhase,
		completion: createCompletionPhase
	}

	const handlePhaseToggle = (phase: PhaseType) => {
		if (selectedPhases.includes(phase)) {
			setSelectedPhases(selectedPhases.filter((p) => p !== phase))
		} else {
			// Thêm pha theo thứ tự
			const newPhases = [...selectedPhases, phase].sort((a, b) => {
				return PHASES_ORDER.indexOf(a) - PHASES_ORDER.indexOf(b)
			})
			setSelectedPhases(newPhases)
		}
	}

	const updatePhaseConfig = (phase: PhaseType, field: keyof PhaseConfig, value: any) => {
		setPhaseConfigs((prev) => ({
			...prev,
			[phase]: {
				...prev[phase],
				[field]: value
			}
		}))
	}

	const isValidTimeRange = (start: string, end: string) => {
		if (!start || !end) return false
		return new Date(end) > new Date(start)
	}

	const canSave = () => {
		// Kiểm tra mỗi pha đã chọn phải có thời gian hợp lệ
		return selectedPhases.every((phase) => {
			const config = phaseConfigs[phase]
			return isValidTimeRange(config.startTime, config.endTime)
		})
	}

	const handleSaveMultiplePhases = async () => {
		try {
			// Tạo các pha theo thứ tự đã chọn
			for (const phase of selectedPhases) {
				const config = phaseConfigs[phase]
				const hook = phaseHookMap[phase]

				let payload: any = {
					startTime: config.startTime,
					endTime: config.endTime
				}

				// Thêm các trường đặc biệt cho pha submit_topic
				if (phase === 'submit_topic') {
					payload = {
						...payload,
						minTopicsPerLecturer: config.minTopicsPerLecturer,
						requiredLecturerIds: config.requiredLecturerIds
					}
				}

				await hook({ periodId, body: payload }).unwrap()
			}

			toast({
				title: 'Thành công',
				description: `Đã thiết lập ${selectedPhases.length} pha`,
				variant: 'success'
			})

			onSuccess?.()
			onOpenChange(false)
			// Reset state
			setSelectedPhases(['submit_topic'])
			setPhaseConfigs({
				submit_topic: { startTime: '', endTime: '', minTopicsPerLecturer: 1, requiredLecturerIds: [] },
				open_registration: { startTime: '', endTime: '' },
				execution: { startTime: '', endTime: '' },
				completion: { startTime: '', endTime: '' }
			})
		} catch (err: any) {
			console.error(err)
			toast({
				title: 'Lỗi khi thiết lập các pha',
				description: err?.data?.message || 'Đã có lỗi xảy ra',
				variant: 'destructive'
			})
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='flex max-w-4xl flex-col'>
				<DialogHeader>
					<DialogTitle className='text-lg font-semibold'>Thiết lập nhiều pha cùng lúc</DialogTitle>
					<p className='text-sm text-muted-foreground'>
						Chọn các pha cần thiết lập và cấu hình thời gian cho từng pha
					</p>
				</DialogHeader>

				<div className='max-h-[70vh] space-y-6 overflow-y-auto pr-2'>
					{/* Chọn các pha */}
					<section className='space-y-3 rounded-lg border bg-muted/30 p-4'>
						<div className='font-semibold'>Chọn các pha cần thiết lập</div>
						<div className='grid grid-cols-2 gap-3'>
							{PHASES_ORDER.map((phase) => (
								<button
									key={phase}
									onClick={() => handlePhaseToggle(phase)}
									className={cn(
										'flex items-center gap-2 rounded-lg border-2 p-3 transition-all hover:bg-muted',
										selectedPhases.includes(phase)
											? 'border-primary bg-primary/5'
											: 'border-gray-200 bg-white'
									)}
								>
									<div
										className={cn(
											'flex h-5 w-5 items-center justify-center rounded border-2 transition-all',
											selectedPhases.includes(phase)
												? 'border-primary bg-primary'
												: 'border-gray-300 bg-white'
										)}
									>
										{selectedPhases.includes(phase) && <Check className='h-3 w-3 text-white' />}
									</div>
									<span className='text-sm font-medium'>{PhaseInfo[phase].label}</span>
								</button>
							))}
						</div>
					</section>

					{/* Cấu hình từng pha đã chọn */}
					{selectedPhases.length > 0 && (
						<div className='space-y-4'>
							{selectedPhases.map((phase) => (
								<PhaseConfigSection
									key={phase}
									phase={phase}
									config={phaseConfigs[phase]}
									lecturers={lecturers}
									onConfigChange={(field, value) => updatePhaseConfig(phase, field, value)}
								/>
							))}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
						Hủy
					</Button>
					<Button onClick={handleSaveMultiplePhases} disabled={!canSave() || isLoading}>
						{isLoading ? 'Đang lưu...' : `Thiết lập ${selectedPhases.length} pha`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

// Component helper để render config cho từng pha
interface PhaseConfigSectionProps {
	phase: PhaseType
	config: PhaseConfig
	lecturers: ResponseMiniLecturerDto[]
	onConfigChange: (field: keyof PhaseConfig, value: any) => void
}

function PhaseConfigSection({ phase, config, lecturers, onConfigChange }: PhaseConfigSectionProps) {
	const isValidTime = config.startTime && config.endTime && new Date(config.endTime) > new Date(config.startTime)
	const isSubmitTopicPhase = phase === 'submit_topic'

	return (
		<section className='space-y-4 rounded-lg border-2 border-primary/20 bg-white p-4'>
			<div className='flex items-center gap-2 font-semibold text-primary'>
				<Calendar className='h-5 w-5' />
				Pha {PhaseInfo[phase].order}: {PhaseInfo[phase].label}
			</div>

			{/* TIME SETTINGS */}
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
				<div>
					<label className='text-sm font-medium'>Bắt đầu</label>
					<input
						type='datetime-local'
						className='w-full rounded border px-3 py-2'
						value={config.startTime}
						min={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
						step='60'
						onChange={(e) => onConfigChange('startTime', e.target.value)}
					/>
				</div>
				<div>
					<label className='text-sm font-medium'>Kết thúc</label>
					<input
						disabled={!config.startTime}
						type='datetime-local'
						className={cn(
							'w-full rounded border px-3 py-2',
							config.endTime && !isValidTime && 'border-red-500'
						)}
						min={config.startTime || new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
						value={config.endTime}
						step='60'
						onChange={(e) => onConfigChange('endTime', e.target.value)}
					/>
					{config.endTime && !isValidTime && (
						<p className='text-xs text-red-500'>* Kết thúc phải sau bắt đầu</p>
					)}
				</div>
			</div>

			{/* PHASE 1 SPECIFIC SETTINGS */}
			{isSubmitTopicPhase && (
				<div className='space-y-4 rounded-lg border bg-muted/30 p-4'>
					<div className='flex items-center gap-2 text-sm font-medium'>
						<Users className='h-4 w-4 text-primary' />
						Cài đặt dành riêng cho Pha 1
					</div>

					<div>
						<label className='text-sm font-medium'>Số đề tài tối thiểu mỗi giảng viên</label>
						<Input
							type='number'
							min={1}
							value={config.minTopicsPerLecturer}
							onChange={(e) => onConfigChange('minTopicsPerLecturer', Number(e.target.value))}
						/>
					</div>

					<div>
						<LecturerMultiSelect
							allLecturers={lecturers ?? []}
							selected={config.requiredLecturerIds ?? []}
							onChange={(ids) => onConfigChange('requiredLecturerIds', ids)}
						/>
					</div>
				</div>
			)}
		</section>
	)
}
