// import { TeacherProfile } from './lecturer/LecturerProfile'
import { useAppSelector } from '../../../store'
import { LecturerProfilePage } from './lecturer/LecturerProfile'
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
			return <StudentProfile student={user} viewerId={user.userId}/>
		case 'lecturer':
			return <LecturerProfilePage lecturer={user} viewerId={user.userId} />
		case 'admin':
			return <div>Admin profile</div>
		case 'faculty_board':
			return <div>Faculty Board profile</div>
		default:
			return <div>Role không xác định</div>
	}
}
