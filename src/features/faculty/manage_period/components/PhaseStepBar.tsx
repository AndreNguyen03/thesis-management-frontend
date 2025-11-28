import { motion } from 'framer-motion'
import { Check, Circle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useState } from 'react'
import { Button } from '@/components/ui'
import { PhaseSettingsModal } from './modals/PhaseSettingsModal'
import { PhaseInfo } from '@/utils/utils'
import type { PeriodPhase } from '@/models/period-phase.models'
import type { PhaseType } from '@/models/period.model'

interface PhaseStepBarProps {
	phases: PeriodPhase[]
	currentPhase: string
	onPhaseChange: (phase: PhaseType) => void
	collapsed?: boolean
	onCollapsedChange?: (collapsed: boolean) => void
}

export function PhaseStepBar({ phases, currentPhase, onPhaseChange, collapsed, onCollapsedChange }: PhaseStepBarProps) {
	const [phaseSettingsOpen, setPhaseSettingsOpen] = useState(false)

	const currentPhaseDetail = phases.find((p) => p.phase === currentPhase)

	const toggle = () => {
		const next = !collapsed
		onCollapsedChange?.(next)
	}

	return (
		<TooltipProvider>
			<div
				className={cn(
					'relative mt-12 flex h-full flex-col justify-between rounded-2xl border-2 bg-white transition-all duration-300',
					collapsed ? 'w-14 px-2 py-3' : 'w-24 px-3 py-4'
				)}
			>
				{/* Toggle Collapse */}
				<button
					className='absolute right-0 top-0 flex h-6 w-6 items-center justify-center self-end rounded-full border bg-white shadow'
					onClick={toggle}
				>
					{collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
				</button>
				{/* Phase Nodes */}
				<div className='flex flex-col items-center'>
					{/* EMPTY NODE */}

					<Tooltip>
						<TooltipTrigger asChild>
							<motion.button
								disabled
								className={cn(
									'relative mt-3 flex h-6 w-6 items-center justify-center rounded-full border-2 shadow transition-all',
									currentPhase !== 'empty'
										? 'border-success bg-success'
										: 'border-primary bg-primary shadow-primary/40'
								)}
								whileHover={{ scale: 1.05 }}
							>
								{currentPhase !== 'empty' ? (
									<Check className='h-4 w-4 text-white' />
								) : (
									<Circle className='h-4 w-4 text-white' />
								)}
							</motion.button>
						</TooltipTrigger>

						{!collapsed && (
							<TooltipContent side='right'>
								<p className='font-semibold'>Pha {PhaseInfo['empty'].order}</p>
								<p className='text-sm text-muted-foreground'>{PhaseInfo['empty'].label}</p>
							</TooltipContent>
						)}

						{!collapsed && (
							<span className='mt-1 text-xs text-muted-foreground'>{PhaseInfo['empty'].label}</span>
						)}
					</Tooltip>

					<motion.div
						className={cn(
							'my-2 w-1 origin-top rounded',
							currentPhase !== 'empty' ? 'bg-success' : 'bg-step-inactive'
						)}
						animate={{ scaleY: currentPhase !== 'empty' ? 1 : 0 }}
						transition={{ duration: 0.5 }}
						style={{ height: '1.5rem' }}
					/>

					{currentPhase === 'empty' && !collapsed && (
						<Button variant='config' size='sm' onClick={() => setPhaseSettingsOpen(true)}>
							Thiết lập pha {PhaseInfo[currentPhase].continue}
						</Button>
					)}

					{/* REAL PHASE NODES */}
					{phases.map((p, index) => {
						const isActive = currentPhase === p.phase
						const isCompleted = p.status === 'completed'
						const isClickable = p.status === 'completed' || p.status === 'ongoing'
						const isLast = index === phases.length - 1

						return (
							<div key={p.phase} className='flex flex-col items-center'>
								<Tooltip>
									<TooltipTrigger asChild>
										<motion.button
											onClick={() => isClickable && onPhaseChange(p.phase)}
											disabled={!isClickable}
											className={cn(
												'relative flex h-10 w-10 items-center justify-center rounded-full border-2 shadow transition-all',
												isCompleted && 'border-success bg-success',
												isActive && 'border-primary bg-primary shadow-primary/40',
												!isActive && !isCompleted && 'border-step-inactive bg-card',
												isClickable && 'hover:scale-105 active:scale-95',
												!isClickable && 'cursor-not-allowed opacity-50'
											)}
										>
											{isCompleted ? (
												<Check className='h-6 w-6 text-white' />
											) : (
												<Circle
													className={cn(
														'h-6 w-6',
														isActive ? 'text-white' : 'text-muted-foreground'
													)}
												/>
											)}
										</motion.button>
									</TooltipTrigger>

									{!collapsed && (
										<TooltipContent side='right'>
											<p className='font-semibold'>Pha {PhaseInfo[p.phase].order}</p>
											<p className='text-sm text-muted-foreground'>{PhaseInfo[p.phase].label}</p>
										</TooltipContent>
									)}

									{!collapsed && (
										<span className='mt-1 text-xs text-muted-foreground'>
											{PhaseInfo[p.phase].label}
										</span>
									)}
								</Tooltip>

								{!isLast && (
									<motion.div
										className={cn(
											'my-2 w-1 origin-top rounded',
											isCompleted ? 'bg-success' : 'bg-step-inactive'
										)}
										animate={{ scaleY: isCompleted ? 1 : 0 }}
										transition={{ duration: 0.5 }}
										style={{ height: '1.5rem' }}
									/>
								)}

								{isCompleted && !collapsed && (
									<Button variant='config' size='sm'>
										Thiết lập pha {PhaseInfo[p.phase].continue}
									</Button>
								)}
							</div>
						)
					})}
				</div>
			</div>

			{/* Modal */}
			<PhaseSettingsModal
				open={phaseSettingsOpen}
				onOpenChange={() => setPhaseSettingsOpen((prev) => !prev)}
				needConfiguration={PhaseInfo[currentPhase as keyof typeof PhaseInfo].continuePhaseId}
				status={currentPhaseDetail ? currentPhaseDetail.status : 'not_started'}
			/>
		</TooltipProvider>
	)
}
