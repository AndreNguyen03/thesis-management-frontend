import { usePageBreadcrumb } from '@/hooks'
import StudentDataTable from './datatables/StudentDataTable'

function ManageFacultyStudentPage() {
	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý sinh viên khoa', path: '/manage-faculty-students' }
	])

	return (
		<div className='pt-4 mx-5 h-full min-h-0 w-full overflow-auto'>
			{/* Header */}
			<div className='flex flex-col' role='main'>
				<header className='mb-6 mt-6 flex items-center justify-between px-2'>
					<header className='flex flex-col items-start justify-between'>
						<h1 className='text-2xl font-bold'>Quản lý Sinh viên khoa</h1>
						<p className='mt-1 text-muted-foreground'>Quản lý các Sinh viên trong khoa</p>
					</header>
				</header>
				<StudentDataTable />
			</div>
		</div>
	)
}

export { ManageFacultyStudentPage }
