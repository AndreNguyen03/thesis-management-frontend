import { Button } from '@/components/ui'
import { useNavigate } from 'react-router-dom'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import type { StudentUser } from '@/models'
import { StudentProfileLeft } from './StudentProfileLeft'
import { StudentProfileRight } from './StudentProfileRight'

export interface StudentProfileProps {
	student?: StudentUser
	viewerId?: string
}

export const StudentProfile = ({ student, viewerId }: StudentProfileProps) => {
	const navigate = useNavigate()
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Hồ sơ' }])

	if (!student) return null
    console.log('student id, viewer id :::', student.userId, viewerId)
	const isOwner = student.userId === viewerId

	return (
		<div className='min-h-screen'>
			<div className='container mx-auto'>
				{/* Header + Conditional buttons */}
				<div className='mb-6'>
					{isOwner ? (
						// Owner mode: Title left, Edit right
						<div className='flex items-center justify-between'>
							<h1 className='text-2xl font-bold'>Hồ sơ sinh viên</h1>
							<Button size='default' className='w-fit' onClick={() => navigate('/profile/edit')}>
								Chỉnh sửa
							</Button>
						</div>
					) : (
						// View mode: Back left, Title center
						<div className='flex items-center justify-between'>
							<Button variant='outline' size='default' className='w-fit' onClick={() => navigate(-1)}>
								Quay lại
							</Button>
							<h1 className='text-2xl font-bold'>Hồ sơ sinh viên</h1>
							<div className='w-32' /> {/* Optional: Spacer bên phải để title ở giữa */}
						</div>
					)}
				</div>

				<div className='grid gap-6 lg:grid-cols-3'>
					{/* Left column */}
					<StudentProfileLeft student={student} isOwner={isOwner}/>

					{/* Right column */}
					<StudentProfileRight student={student} />
				</div>
			</div>
		</div>
	)
}
