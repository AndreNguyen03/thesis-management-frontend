import type { LecturerProfile, StudentUser } from './users'

// DTO để update student từ frontend
export type PatchStudentDto = Omit<
	Partial<StudentUser>,
	'userId' | 'facultyName' | 'role' | 'studentCode' | 'class' | 'major'
>

// DTO để update lecturer từ frontend
export type PatchLecturerDto = Omit<Partial<LecturerProfile>, 'userId' | 'facultyName' | 'role'>
