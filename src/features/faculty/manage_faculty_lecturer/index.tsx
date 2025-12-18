
import { usePageBreadcrumb } from '@/hooks'
import FacultyLecturerDataTable from './datatables/FacultyLecturerDataTable'

export function ManageFacultyLecturerPage() {
	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý giảng viên khoa', path: '/manage-faculty-lecturers' }
	])

	return (
		<div className='mx-10 h-[calc(100vh-10rem)] min-h-0 w-full overflow-auto'>
			{/* Header */}
			<div className='flex flex-col' role='main'>
				<header className='mb-6 mt-6 flex items-center justify-between px-2'>
					<header className='flex flex-col items-start justify-between'>
						<h1 className='text-2xl font-bold'>Quản lý Giảng viên khoa</h1>
						<p className='mt-1 text-muted-foreground'>Quản lý các Giảng viên thuộc khoa</p>
					</header>
				</header>
				<FacultyLecturerDataTable />
			</div>
		</div>
	)
}
