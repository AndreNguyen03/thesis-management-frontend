import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { XCircle } from 'lucide-react'
import type { StudentRegistration } from '@/models'

export function RejectedStudentList({ students }: { students: StudentRegistration[] }) {
	const rejected = students.filter((s) => s.status === 'rejected')
	if (!rejected.length) return null

	return (
		<div className='space-y-3'>
			<div className='flex items-center gap-2'>
				<XCircle className='h-4 w-4 text-rose-500' />
				<span className='text-sm font-semibold uppercase'>Đã từ chối</span>
			</div>

			<div className='grid gap-3'>
				{rejected.map((s) => (
					<Card key={s.studentId} className='border-rose-200 bg-rose-50 p-0'>
						<CardContent className='p-4'>
							<div className='mb-2 flex justify-between'>
								<span className='font-semibold'>{s.studentName}</span>
								<Badge className='border-rose-300 bg-rose-100 text-[10px] text-rose-700'>
									{s.rejectionReasonType}
								</Badge>
							</div>

							<p className='rounded border bg-white p-2 text-xs text-slate-600'>{s.lecturerResponse}</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)
}
