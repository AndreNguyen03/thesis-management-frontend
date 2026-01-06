import { usePageBreadcrumb } from '@/hooks'
import StudentDataTable from './datatables/StudentDataTable'

export function ManageStudentPage() {
	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý sinh viên', path: '/manage-students' }
	])

	return (
		<div className='mx-4 h-full min-h-0 w-full overflow-auto pt-4'>
			{/* Header */}
			<div className='flex flex-col' role='main'>
				<header className='mb-6 mt-6 flex items-center justify-between px-2'>
					<header className='flex flex-col items-start justify-between'>
						<h1 className='text-2xl font-bold'>Quản lý Sinh viên</h1>
					</header>
				</header>
				<StudentDataTable />
			</div>
		</div>
	)
}
