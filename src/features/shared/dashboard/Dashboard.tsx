import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import { useAppSelector } from '../../../store'
import { AdminDashboard, LecturerDashboard, StudentDashboard } from './'
import { FacultyDashboard } from './FacultyDashboard'
import { ManageLecturerPage } from '@/features/admin/manage_lecturer'

const Dashboard = () => {
	const userRole = useAppSelector((state) => state.auth.user?.role)
	const breadcrumbs =
		userRole === 'admin'
			? [{ label: 'Trang chủ', path: '/' }, { label: 'Quản lý giảng viên' }]
			: [{ label: 'Trang chủ', path: '/' }, { label: 'Dashboard' }]

	usePageBreadcrumb(breadcrumbs)

	switch (userRole) {
		case 'admin':
			return <ManageLecturerPage />
		case 'lecturer':
			return <LecturerDashboard />
		case 'student':
			return <StudentDashboard />
		case 'faculty_board':
			return <FacultyDashboard />
		default:
			return <AdminDashboard />
	}
}

export default Dashboard
