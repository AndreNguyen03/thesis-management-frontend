import { useBreadcrumb } from '@/hooks'
import FacultyLecturerDataTable from './datatables/FacultyLecturerDataTable'
import { useEffect } from 'react'

export function ManageLecturerPage() {
	const { setHidden } = useBreadcrumb()

	useEffect(() => {
		setHidden(true)
	}, [setHidden])

	return (
		<div className='mx-4 h-full w-full overflow-auto pt-4'>
			{/* Header */}
			<div className='flex flex-col' role='main'>
				<header className='mb-6 mt-6 flex items-center justify-between px-2'>
					<header className='flex flex-col items-start justify-between'>
						<h1 className='text-2xl font-bold'>Quản lý Giảng viên</h1>
					</header>
				</header>
				<FacultyLecturerDataTable />
			</div>
		</div>
	)
}
