import { motion } from 'framer-motion'
import { Check, Circle, SquarePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { PhaseType } from '@/models/period.model'
import { PhaseInfo } from '@/utils/utils'
import type { PeriodPhase } from '@/models/period-phase.models'
import { Button } from '@/components/ui'
import { useState } from 'react'
import { PhaseSettingsModal } from './modals/PhaseSettingsModal'
import type { keyof } from 'zod'

interface PhaseStepBarProps {
	phases: PeriodPhase[]
	currentPhase: string
	onPhaseChange: (phase: PhaseType) => void
}

export function PhaseStepBar({ phases, currentPhase, onPhaseChange }: PhaseStepBarProps) {
	const [phaseSettingsOpen, setPhaseSettingsOpen] = useState(false)
	const currentPhaseDetail = phases.find((p: PeriodPhase) => p.phase === currentPhase)
	//nếu currentPhaseDetail không tồn tại, tức là đang ở pha empty
	//còn nếu có thì kiểm tra thêm status của pha đso để xác định đã hoàn thành hay chưa
	return (
		<>
			<TooltipProvider>
				<div className='relative flex flex-col items-center justify-between px-6 py-8'>
					<div className='flex flex-col items-center'>
						<Tooltip>
							<TooltipTrigger asChild>
								<motion.button
									disabled={true}
									className={cn(
										'relative flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-md transition-all duration-300',
										currentPhase !== 'empty' &&
											'border-success bg-gradient-to-br from-success to-success/80',
										currentPhase === 'empty' &&
											'border-primary bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30'
									)}
									whileHover={{ scale: 1.08 }}
									whileTap={{ scale: 0.95 }}
								>
									{currentPhase !== 'empty' ? (
										<Check className='h-7 w-7 text-white' />
									) : (
										<Circle
											className={cn(
												'h-7 w-7',
												currentPhase === 'empty' ? 'text-white' : 'text-muted-foreground'
											)}
										/>
									)}

									{currentPhase === 'empty' && (
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
								<p className='font-semibold'>Pha {PhaseInfo['empty'].order}</p>
								<p className='text-sm text-muted-foreground'>{PhaseInfo['empty'].label}</p>
							</TooltipContent>
							<span className='mt-2 text-sm text-muted-foreground'>{PhaseInfo['empty'].label}</span>

							<motion.div
								className={cn(
									'my-2 w-1 origin-top rounded',
									currentPhase !== 'empty' ? 'bg-success' : 'bg-step-inactive'
								)}
								initial={{ scaleY: 0 }}
								animate={{ scaleY: currentPhase !== 'empty' ? 1 : 0 }}
								transition={{ duration: 0.6 }}
								style={{ height: '3rem' }}
							/>
							{currentPhase === 'empty' && (
								<div className='mb-5 mt-5'>
									<Button variant='config' onClick={() => setPhaseSettingsOpen(true)}>
										Thiết lập pha {PhaseInfo[currentPhase].continue}
									</Button>
								</div>
							)}
						</Tooltip>
					</div>

					{phases.map((p, index) => {
						const isActive = currentPhase === p.phase
						const isCompleted = p.status === 'completed'
						const isClickable = p.status === 'completed' || p.status === 'ongoing'
						const isLast = index === phases.length - 1

						return (
							<div key={p.phase} className='flex flex-col items-center'>
								{/* Step circle */}
								<Tooltip>
									<TooltipTrigger asChild>
										<motion.button
											onClick={() => isClickable && onPhaseChange(p.phase)}
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
										<p className='font-semibold'>Pha {PhaseInfo[p.phase].order}</p>
										<p className='text-sm text-muted-foreground'>{PhaseInfo[p.phase].label}</p>
									</TooltipContent>
									<span className='mt-2 text-sm text-muted-foreground'>
										{PhaseInfo[p.phase].label}
									</span>
								</Tooltip>

								{!isLast && (
									<>
										<motion.div
											className={cn(
												'my-4 w-1 origin-top rounded bg-success/80',
												isCompleted ? 'bg-success/80' : 'bg-step-inactive'
											)}
											initial={{ scaleY: 0 }}
											animate={{ scaleY: isCompleted ? 1 : 0 }}
											transition={{ duration: 0.6 }}
											style={{ height: '3rem' }}
										/>

										{isCompleted && (
											<div className='mb-5 mt-5'>
												<Button variant='config'>
													Thiết lập pha {PhaseInfo[p.phase].continue}
												</Button>
											</div>
										)}
									</>
								)}

								{isLast && (
									<>
										<motion.div
											className={cn(
												'my-4 w-1 origin-top rounded bg-success/80',
												isCompleted ? 'bg-success/80' : 'bg-step-inactive'
											)}
											initial={{ scaleY: 0 }}
											animate={{ scaleY: isCompleted ? 1 : 0 }}
											transition={{ duration: 0.6 }}
											style={{ height: '3rem' }}
										/>

										{isCompleted && (
											<div className='mb-5 mt-5'>
												<Button variant='config'>Tổng kết {PhaseInfo[p.phase].continue}</Button>
											</div>
										)}
									</>
								)}
							</div>
						)
					})}
				</div>
			</TooltipProvider>
			<PhaseSettingsModal
				open={phaseSettingsOpen}
				onOpenChange={() => {
					setPhaseSettingsOpen((prev) => !prev)
				}}
				needConfiguration={PhaseInfo[currentPhase as keyof typeof PhaseInfo].continuePhaseId}
				status={currentPhaseDetail ? currentPhaseDetail.status : 'not_started'}
			/>
		</>
	)
}
