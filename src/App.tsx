import { Outlet } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { useAppDispatch, useAppSelector } from '@/store'
import { useEffect } from 'react'
import { useGetProfileQuery } from './services/userApi'
import { setUser } from '@/features/shared/auth'
import { LoadingOverlay } from '@/components/ui'
import { Toaster as ToasterSonner } from 'sonner'
import { Toaster } from './components/ui/toaster'

// import slice period ❌ BỎ
import { ChatProvider } from './contexts/ChatSocketContext'
// import { NotificationSocketProvider } from './contexts/NotificationSocketContext'
import { useGetCurrentPeriodsQuery } from './services/periodApi'
import { NotificationSocketProvider } from './contexts/NotificationSocketContext'
import type { FacultyBoardProfile, LecturerProfile, StudentUser } from './models'

const App = () => {
	const dispatch = useAppDispatch()
	const user = useAppSelector((state) => state.auth.user)
	const token = sessionStorage.getItem('accessToken')

	// 🔹 AUTH
	const { data: userData, isLoading: isUserLoading } = useGetProfileQuery(undefined, {
		skip: !token
	})

	// 🔹 PERIODS (RTK QUERY = source of truth)
	const { isLoading: isPeriodLoading } = useGetCurrentPeriodsQuery()

	// 🔹 Sync user (OK – auth là global state)
	useEffect(() => {
		if (userData && userData !== user) {
			dispatch(setUser(userData))
		}
	}, [userData, user, dispatch])

	if (!userData) return null

	const userId = 'userId' in userData ? userData.userId : userData._id

	return (
		<ChatProvider userId={userId}>
			<NotificationSocketProvider userId={userId}>
				{isUserLoading || isPeriodLoading ? (
					<LoadingOverlay />
				) : (
					<Layout>
						<Outlet />
						<Toaster />
						<ToasterSonner />
					</Layout>
				)}
			</NotificationSocketProvider>
		</ChatProvider>
	)
}

export default App
