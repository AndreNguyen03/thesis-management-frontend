import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
import { ForgotPassword, Login, ResetPassword } from '@/features/shared/auth'
import Dashboard from '@/features/shared/dashboard/Dashboard'
import NotFound from '@/features/shared/NotFound'
import { Profile, ProfileEdit } from '@/features/shared/profile'
import { SavedTopics } from '@/features/student/TopicList/TopicSaved'
import { TopicRegisteredChildren } from '@/features/student/TopicList/registered/children/TopicRegisteredChildren'
import { RegisteredTopicContainer } from '@/features/student/TopicList/registered/TopicRegisteredContainer'
import { TopicDetailContainer } from '@/features/student/TopicList/detail/TopicDetailContainer'
import { ManageLecturerPage } from '@/features/admin/manage_lecturer'
import { ManageStudentPage } from '@/features/admin/manage_student'
import Unauthorized from '@/features/shared/authorize/Unauthorized'
import ManageAI from '@/features/admin/manage_ai/ManageAI'
import { RequireAuth } from './RequireAuth'

import { CreateTopic } from '@/features/lecturer/new_topic'
import { ManagePeriodPage } from '@/features/faculty/manage_period'
import { ManageFacultyStudentPage } from '@/features/faculty/manage_faculty_student'
import { ManageFacultyLecturerPage } from '@/features/faculty/manage_faculty_lecturer'
import DetailPeriodPage from '@/features/faculty/manage_period/DetailPeriod'
import LecturerManageTopics from '@/features/lecturer/manage_topic'
import RegistrationHistory from '@/features/student/TopicList/registered/children/RegistrationHistory'
import TopicRegistration from '@/features/student/registration/Index'
// Mock user data

export const router = createBrowserRouter([
	{ path: '/login', element: <Login /> },
	{ path: '/forgot-password', element: <ForgotPassword /> },
	{ path: '/reset-password', element: <ResetPassword /> },

	{
		path: '/',
		element: (
			<RequireAuth>
				<App />
			</RequireAuth>
		),
		children: [
			{ index: true, element: <Navigate to='dashboard' replace /> },
			// { index: true, element: <Navigate to='manage-period' replace /> },
			{ path: 'dashboard', element: <Dashboard /> },
			{
				path: 'profile',
				element: <Profile /> // tạm thời dùng mockUser
			},
			{
				path: 'profile/edit',
				element: <ProfileEdit /> // tạm thời dùng mockUser
			},

			{ path: 'topics/saved', element: <SavedTopics /> }, // /thesis/saved
			{
				path: 'topics/registered',
				element: <RegisteredTopicContainer />,
				children: [
					{ path: 'canceled', element: <RegistrationHistory /> },
					{ index: true, element: <TopicRegisteredChildren /> }
				]
			},
			{
				path: 'registration',
				element: <TopicRegistration />
			},
			{
				path: 'detail-topic/:id',
				element: <TopicDetailContainer />
			},
			{
				path: 'manage-lecturers',
				element: <ManageLecturerPage />
			},
			{
				path: 'manage-students',
				element: <ManageStudentPage />
			},
			// Giảng viên
			{ path: 'create-topic', element: <CreateTopic /> },
			{ path: 'manage-topic', element: <LecturerManageTopics /> },
			{
				path: 'manage-ai',
				element: (
					//manage-ai<RequireAuth allowedRoles={['admin']}>
					<ManageAI />
					//</RequireAuth>
				)
			},
			//   { path: 'create-thesis', element: <CreateThesis /> },
			{ path: 'manage-period', element: <ManagePeriodPage /> },
			{ path: 'period/:id', element: <DetailPeriodPage /> },
			{ path: 'manage-faculty-student', element: <ManageFacultyStudentPage /> },
			{ path: 'manage-faculty-lecturer', element: <ManageFacultyLecturerPage /> },
			//   { path: 'manage-thesis', element: <ManageThesis /> },
			//   { path: 'approve-registrations', element: <ApproveRegistrations /> },
			//   { path: 'plagiarism-check', element: <PlagiarismCheck /> },
			//   { path: 'my-groups', element: <MyGroups /> },
			//   { path: 'group-workspace/:id', element: <GroupWorkspace /> },
			//   { path: 'library', element: <LibraryPage /> },
			//   { path: 'ai-chat', element: <AIChatPage /> },
			{
				path: 'settings',
				element: (
					<div className='py-12 text-center'>
						<h2 className='mb-4 text-2xl font-bold text-primary'>Cài đặt</h2>
						<p className='text-muted-foreground'>Tính năng đang được phát triển...</p>
					</div>
				)
			},
			{
				path: 'unauthorized',
				element: <Unauthorized />
			},
			{ path: '*', element: <NotFound /> }
		]
	}
])
