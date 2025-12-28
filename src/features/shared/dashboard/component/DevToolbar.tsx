import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { ThesisPhase } from './student-dashboard'

export function DevToolbar({
	isDevMode,
	onToggle,
	currentPhase,
	onPhaseChange
}: {
	isDevMode: boolean
	onToggle: (v: boolean) => void
	currentPhase: ThesisPhase
	onPhaseChange: (p: ThesisPhase) => void
}) {
	const phases: { value: ThesisPhase; label: string }[] = [
		{ value: 'not_started', label: 'Chưa bắt đầu' },
		{ value: 'topic_submission', label: 'Nộp đề tài' },
		{ value: 'registration', label: 'Đăng ký' },
		{ value: 'execution', label: 'Thực thi' },
		{ value: 'grading', label: 'Chấm điểm' },
		{ value: 'completed', label: 'Hoàn thành' }
	]

	return (
		<div className='flex items-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-2'>
			<div className='flex items-center gap-2'>
				<Switch checked={isDevMode} onCheckedChange={onToggle} />
				<Label className='text-sm font-medium'>Dev Mode</Label>
			</div>

			{isDevMode && (
				<select
					value={currentPhase}
					onChange={(e) => onPhaseChange(e.target.value as ThesisPhase)}
					className='rounded-md border border-border bg-card px-3 py-1.5 text-sm'
				>
					{phases.map((p) => (
						<option key={p.value} value={p.value}>
							Test: {p.label}
						</option>
					))}
				</select>
			)}
		</div>
	)
}
