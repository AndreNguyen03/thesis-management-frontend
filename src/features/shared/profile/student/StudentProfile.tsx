import { Button } from '@/components/ui'
import { useNavigate } from 'react-router-dom'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import type { StudentUser } from '@/models'
import { StudentProfileLeft } from './StudentProfileLeft'
import { StudentProfileRight } from './StudentProfileRight'

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
					{/* Left column */}
					<StudentProfileLeft student={student} />

					{/* Right column */}
					<StudentProfileRight student={student} />
				</div>
			</div>
		</div>
	)
}
