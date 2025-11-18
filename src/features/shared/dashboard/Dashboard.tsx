import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import { useAppSelector } from '../../../store'
import { AdminDashboard, TeacherDashboard, StudentDashboard } from './'
import { FacultyDashboard } from './FacultyDashboard'

const Dashboard = () => {
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Dashboard' }])

	const userRole = useAppSelector((state) => state.auth.user?.role)

	console.log(`Dash board userrole: ::`, userRole)

	switch (userRole) {
		case 'admin':
			return <AdminDashboard />
		case 'lecturer':
			return <TeacherDashboard />
		case 'student':
			return <StudentDashboard />
		case 'faculty_board':
			return <FacultyDashboard />
		default:
			return <AdminDashboard />
	}
}

export default Dashboard
