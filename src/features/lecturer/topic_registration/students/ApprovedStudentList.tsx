import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock } from 'lucide-react'
import type { StudentRegistration } from '@/models'
import { formatDate } from '@/utils/utils'

export function ApprovedStudentList({ students }: { students: StudentRegistration[] }) {
	const approved = students.filter((s) => s.status === 'approved')
	if (!approved.length) return null

	return (
		<div className='space-y-3'>
			<div className='flex items-center gap-2'>
				<CheckCircle2 className='h-4 w-4 text-emerald-500' />
				<span className='text-sm font-semibold uppercase'>Đã duyệt</span>
			</div>

			<div className='grid gap-3'>
				{approved.map((s) => (
					<Card key={s.studentId} className='border-emerald-200 bg-emerald-50 p-0'>
						<CardContent className='flex justify-between p-4'>
							<div>
								<div className='font-semibold'>{s.studentName}</div>
								<div className='mt-1 flex gap-1'>
									{s.studentSkills.map((skill) => (
										<Badge key={skill} className='bg-emerald-200 text-[10px] text-emerald-800'>
											{skill}
										</Badge>
									))}
								</div>
							</div>

							<div className='flex items-center gap-1 text-xs text-muted-foreground'>
								<Clock className='h-3 w-3' />
								{formatDate(s.processAt || '')}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
