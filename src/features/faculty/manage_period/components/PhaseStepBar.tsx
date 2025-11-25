import { motion } from 'framer-motion'
import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { PeriodPhase, PhaseType } from '@/models/period'
import { PhaseInfo } from '@/utils/utils'

interface PhaseStepBarProps {
	phases: PeriodPhase[]
	currentPhase: PhaseType | null
	onPhaseChange: (phase: PhaseType) => void
}

export function PhaseStepBar({ phases, currentPhase, onPhaseChange }: PhaseStepBarProps) {
	const now = new Date()
	return (
		<TooltipProvider>
			{phases.length === 0 ? (
				<div className='flex flex-col items-center justify-center py-8 text-muted-foreground'>
					Chưa có pha nào. Hãy thiết lập pha để bắt đầu quản lý.
				</div>
			) : (
				phases.map((phase) => {
					const isConfigured = !!phase.startTime && !!phase.endTime

					const isCompleted = isConfigured && now > new Date(phase.endTime)
					const isActive = isConfigured && now >= new Date(phase.startTime) && now <= new Date(phase.endTime)

					const isClickable = isCompleted || isActive

					const isCurrent = currentPhase === phase.phase

					return (
						<div key={phase.phase} className='flex flex-col items-center py-4'>
							<Tooltip>
								<TooltipTrigger asChild>
									<motion.button
										onClick={() => isClickable && onPhaseChange(phase.phase)}
										disabled={!isClickable}
										className={cn(
											'relative flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-md transition-all duration-300',

											// COMPLETED
											isCompleted && 'border-success bg-success',

											// ACTIVE
											isActive && 'border-primary bg-primary',

											// FUTURE OR INACTIVE
											!isActive && !isCompleted && 'border-step-inactive bg-card',

											// CURRENT selection
											isCurrent && 'ring-4 ring-primary/30',

											isClickable && 'hover:scale-110',
											!isClickable && 'cursor-not-allowed opacity-50'
										)}
									>
										{isCompleted ? (
											<Check className='h-7 w-7 text-white' />
										) : (
											<Circle className='h-7 w-7' />
										)}
									</motion.button>
								</TooltipTrigger>

								<TooltipContent side='right'>
									<p className='font-semibold'>Pha {PhaseInfo[phase.phase].order}</p>
									<p className='text-sm text-muted-foreground'>{PhaseInfo[phase.phase].label}</p>
									{!isConfigured && <p className='text-xs text-red-500'>Chưa thiết lập</p>}
								</TooltipContent>
							</Tooltip>
						</div>
					)
				})
			)}
		</TooltipProvider>
	)
}
