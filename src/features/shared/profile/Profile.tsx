// import { TeacherProfile } from './lecturer/LecturerProfile'
import { useAppSelector } from '../../../store'
import { LecturerProfile } from './lecturer/LecturerProfile'
import { StudentProfile } from './student/StudentProfile'

export function Profile() {
	const user = useAppSelector((state) => state.auth.user)

	if (!user) {
		return null
	}
	console.log(user)
	const role = user.role

	switch (role) {
		case 'student':
			return <StudentProfile student={user}/>
		case 'lecturer':
			return <LecturerProfile lecturer={user}/>
		case 'admin':
			return <div>Admin progile</div>
		default:
			return <div>Role không xác định</div>
	}
}
