import { motion } from 'framer-motion'
import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { PhaseType } from '@/models/period.model'
import { PhaseInfo } from '@/utils/utils'
import type { PeriodPhase } from '@/models/period-phase.models'

interface PhaseStepBarProps {
	phases: PeriodPhase[]
	currentPhase: string
	onPhaseChange: (phase: PhaseType) => void
}

export function PhaseStepBar({ phases, currentPhase, onPhaseChange }: PhaseStepBarProps) {
	return (
		<TooltipProvider>
			<div className='relative flex flex-col items-center justify-between px-6 py-8'>
				{phases.map((phase, index) => {
					const isActive = currentPhase === phase.phase
					const isCompleted = phase.status === 'completed'
					const isClickable = phase.status === 'completed' || phase.status === 'ongoing'
					const isLast = index === phases.length - 1

					return (
						<div key={phase.phase} className='flex flex-col items-center'>
							{/* Step circle */}
							<Tooltip>
								<TooltipTrigger asChild>
									<motion.button
										onClick={() => isClickable && onPhaseChange(phase.phase)}
										disabled={!isClickable}
										className={cn(
											'relative flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-md transition-all duration-300',
											isCompleted &&
												'border-success bg-gradient-to-br from-success to-success/80',
											isActive &&
												'border-primary bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30',
											!isActive && !isCompleted && 'border-step-inactive bg-card',
											isClickable && 'hover:scale-110 active:scale-95',
											!isClickable && 'cursor-not-allowed opacity-50'
										)}
										whileHover={isClickable ? { scale: 1.08 } : {}}
										whileTap={isClickable ? { scale: 0.95 } : {}}
									>
										{isCompleted ? (
											<Check className='h-7 w-7 text-white' />
										) : (
											<Circle
												className={cn(
													'h-7 w-7',
													isActive ? 'text-white' : 'text-muted-foreground'
												)}
											/>
										)}

										{isActive && (
											<motion.div
												className='absolute inset-0 rounded-full bg-primary/40'
												initial={{ scale: 1, opacity: 0.7 }}
												animate={{ scale: 1.6, opacity: 0 }}
												transition={{ duration: 1.5, repeat: Infinity }}
											/>
										)}
									</motion.button>
								</TooltipTrigger>

								<TooltipContent side='right'>
									<p className='font-semibold'>Pha {PhaseInfo[phase.phase].order}</p>
									<p className='text-sm text-muted-foreground'>{PhaseInfo[phase.phase].label}</p>
								</TooltipContent>
							</Tooltip>

							{!isLast && (
								<motion.div
									className={cn(
										'my-4 w-1 origin-top rounded',
										isCompleted ? 'bg-success/80' : 'bg-step-inactive'
									)}
									initial={{ scaleY: 0 }}
									animate={{ scaleY: isCompleted ? 1 : 0 }}
									transition={{ duration: 0.6 }}
									style={{ height: '3rem' }}
								/>
							)}
						</div>
					)
				})}
			</div>
		</TooltipProvider>
	)
}
