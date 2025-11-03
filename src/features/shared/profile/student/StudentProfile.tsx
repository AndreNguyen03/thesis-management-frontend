import { BasicInfo } from './BasicInfo'
import { Introduction } from './Introduction'
import { Projects } from './Projects'
import { Subjects } from './Subjects'
import { Interests } from './Interests'
import { ActionButtons } from './ActionButtons'
import { Button } from '@/components/ui'
import { useNavigate } from 'react-router-dom'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import { Skills } from './Skills'
import type { StudentUser } from '@/models'

export interface StudentProfileProps {
	student?: StudentUser
}

export const StudentProfile = ({ student }: StudentProfileProps) => {
	const navigate = useNavigate()
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Hồ sơ' }])

    if (!student) return null

	return (
		<div className='min-h-screen'>
			<div className='container mx-auto'>
				{/* Header + Edit button */}
				<div className='mb-6 flex items-center justify-between'>
					<h1 className='text-2xl font-bold'>Hồ sơ sinh viên</h1>
					<Button size='default' className='w-fit' onClick={() => navigate('/profile/edit')}>
						Chỉnh sửa
					</Button>
				</div>

				<div className='grid gap-6 lg:grid-cols-3'>
					<div className='space-y-6 lg:col-span-2'>
						<BasicInfo student={student} />
						<Introduction text={student.introduction} />
						<Projects student={student} />
						<Subjects student={student} />
					</div>

					<div className='space-y-6'>
						<Interests student={student} />
						<Skills student={student} />
						<ActionButtons email={student.email} />
					</div>
				</div>
			</div>
		</div>
	)
}
