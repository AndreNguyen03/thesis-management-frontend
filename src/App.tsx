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
import { getUserIdFromAppUser } from './utils/utils'
import { ChatbotSocketProvider } from './contexts/ChatbotSocketContext'

const App = () => {
	const dispatch = useAppDispatch()
	const user = useAppSelector((state) => state.auth.user)
	const token = sessionStorage.getItem('accessToken')

	// 🔹 AUTH
	const { data: userData, isLoading: isUserLoading } = useGetProfileQuery(undefined, {
		skip: !token
	})

	console.log('App rendering, user:', userData)

	// 🔹 PERIODS (RTK QUERY = source of truth)
	const { isLoading: isPeriodLoading } = useGetCurrentPeriodsQuery()

	// 🔹 Sync user (OK – auth là global state)
	useEffect(() => {
		if (userData && userData !== user) {
			dispatch(setUser(userData))
		}
	}, [userData, user, dispatch])

	if (!userData) return null

	const userId = getUserIdFromAppUser(userData)

	console.log('App rendered with userId:', userId)

	return (
		<ChatProvider userId={userId}>
			<NotificationSocketProvider userId={userId}>
				<ChatbotSocketProvider>
					{isUserLoading || isPeriodLoading ? (
						<LoadingOverlay />
					) : (
						<Layout>
							<Outlet />
							<Toaster />
							<ToasterSonner />
						</Layout>
					)}
				</ChatbotSocketProvider>
			</NotificationSocketProvider>
		</ChatProvider>
	)
}

export default App
