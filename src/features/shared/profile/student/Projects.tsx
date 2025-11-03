import { Badge } from '@/components/ui'
import { Briefcase } from 'lucide-react'
import type { StudentUser } from '@/models'

export const Projects = ({ student }: { student: StudentUser }) => {
	const projects = student.projects || [] // đảm bảo luôn là mảng

	return (
		<div className='rounded-lg bg-white p-4 shadow'>
			<div className='mb-4 flex items-center gap-2'>
				<Briefcase className='h-5 w-5 text-gray-600' />
				<h3 className='text-xl font-semibold'>Dự án & Kinh nghiệm</h3>
			</div>

			<div className='space-y-6'>
				{projects.length === 0 ? (
					<p className='text-sm text-gray-400'>Chưa có dự án</p>
				) : (
					projects.map((project, idx) => (
						<div key={idx} className='border-l-2 border-primary/20 pl-4'>
							<h4 className='font-semibold'>{project.title || `Dự án ${idx + 1}`}</h4>
							<p className='mb-2 text-sm text-muted-foreground'>
								{project.description || 'Chưa có mô tả'}
							</p>
							<div className='flex flex-wrap gap-1'>
								{(project.technologies || []).map((tech, i) => (
									<Badge key={i} variant='secondary' className='text-xs'>
										{tech}
									</Badge>
								))}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}
