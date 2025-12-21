import { useAppSelector } from '../../../store'
import { useParams } from 'react-router-dom'
import { LecturerProfilePage } from './lecturer/LecturerProfile'
import { StudentProfile } from './student/StudentProfile'
import { useGetUserQuery } from '../../../services/userApi'
import type { Role, StudentUser, LecturerProfile } from '@/models' // Import types để narrow
import { LoadingState } from '@/components/ui/LoadingState'
import { getUserIdFromAppUser } from '@/utils/utils'
import NotFound from '../NotFound'

// Type guard để đảm bảo role là literal union
const isValidRole = (r: string | undefined): r is Role => {
	return r === 'student' || r === 'lecturer' || r === 'admin' || r === 'faculty_board'
}

export function ViewProfile() {
	const { id, role: roleParam } = useParams<{ id: string; role: string }>()
	const currentUser = useAppSelector((state) => state.auth.user)

	const {
		data: profileUser,
		isLoading,
		error
	} = useGetUserQuery({ id: id!, role: roleParam! as Role }, { skip: !id || !isValidRole(roleParam) })
	if (isLoading) {
		return <LoadingState />
	}

	if (error || !profileUser) {
		return <NotFound /> // Hoặc 404
	}

	if (profileUser.role !== roleParam) {
		return <NotFound />
	}

	const viewerId = getUserIdFromAppUser(currentUser) // ID của người đang xem

	// Switch với type narrowing (dựa trên roleParam đã là Role)
	switch (roleParam) {
		case 'student':
			return <StudentProfile student={profileUser as StudentUser} viewerId={viewerId} />
		case 'lecturer':
			return <LecturerProfilePage lecturer={profileUser as LecturerProfile} viewerId={viewerId} />
		case 'admin':
			return <div>Admin profile (view mode)</div>
		case 'faculty_board':
			return <div>Faculty Board profile (view mode)</div>
		default:
			// Không bao giờ reach đây nhờ type guard
			return null
	}
}
