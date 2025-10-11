import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import ThesisList from './pages/ThesisList';
// import CreateThesis from './pages/CreateThesis';
// import ManageThesis from './pages/ManageThesis';
// import ApproveRegistrations from './pages/ApproveRegistrations';
// import PlagiarismCheck from './pages/PlagiarismCheck';
// import MyGroups from './pages/MyGroups';
// import GroupWorkspace from './pages/GroupWorkspace';
// import LibraryPage from './pages/LibraryPage';
// import AIChatPage from './pages/AIChatPage';
import { RequireAuth } from './RequireAuth'
import { ForgotPassword, Login, ResetPassword } from '@/features/shared/auth'
import Dashboard from '@/features/shared/dashboard/Dashboard'
import NotFound from '@/features/shared/NotFound'
import { Profile, ProfileEdit } from '@/features/shared/profile'
import { ThesisList } from '@/features/student/TopicList'
import { ThesisSaved } from '@/features/student/TopicList/ThesisSaved'
import { ThesisRegistered } from '@/features/student/TopicList/Registerd/ThesisRegisteredParent'
import { ThesisRegisterdChildren } from '@/features/student/TopicList/Registerd/children/ThesisRegisterdChildren'
import { CanceledThesisRegistration } from '@/features/student/TopicList/Registerd/children/CanceledThesisRegistration'

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
			{ path: 'dashboard', element: <Dashboard /> },
			{
				path: 'profile',
				element: <Profile /> // tạm thời dùng mockUser
			},
			{
				path: 'profile/edit',
				element: <ProfileEdit /> // tạm thời dùng mockUser
			},

			{ path: 'thesis', element: <ThesisList /> },
			{ path: 'thesis/saved', element: <ThesisSaved /> }, // /thesis/saved
			{
				path: 'thesis/registered',
				element: <ThesisRegistered />,
				children: [
					{ path: 'canceled', element: <CanceledThesisRegistration /> },
					{ index: true, element: <ThesisRegisterdChildren /> }
				]
			}, // /thesis/registered
			//   { path: 'create-thesis', element: <CreateThesis /> },
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
			{ path: '*', element: <NotFound /> }
		]
	}
])
