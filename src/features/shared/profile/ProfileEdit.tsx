// import { TeacherProfile } from './lecturer/LecturerProfile'
import { useAppSelector } from '../../../store'
import LecturerProfileEdit from './lecturer/LecturerProfileEdit'
import { StudentProfileEdit } from './student/StudentProfileEdit'

export function ProfileEdit() {
    const user = useAppSelector((state) => state.auth.user)

    if (!user) {
        return null
    }

    const role = user.role

    switch (role) {
        case 'student':
            return <StudentProfileEdit student={user}/>
        case 'lecturer':
            return <LecturerProfileEdit lecturer={user}/>
        case 'admin':
            return <div>Admin progile edit</div>
        default:
            return <div>Role không xác định</div>
    }
}
