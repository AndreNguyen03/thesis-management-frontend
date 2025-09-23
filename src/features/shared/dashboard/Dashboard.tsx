import { useAppSelector } from '../../../store'
import { AdminDashboard, TeacherDashboard, StudentDashboard } from './'

const Dashboard = () => {
	const userRole = useAppSelector((state) => state.auth.user?.role)

	switch (userRole) {
		case 'admin':
			return <AdminDashboard />
		case 'teacher':
			return <TeacherDashboard />
		case 'student':
			return <StudentDashboard />
		default:
			return <StudentDashboard />
	}
}

export default Dashboard
