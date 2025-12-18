import { Outlet } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { useAppDispatch, useAppSelector } from '@/store'
import { useEffect } from 'react'
import { useGetProfileQuery } from './services/userApi'
import { setUser } from '@/features/shared/auth'
import { LoadingOverlay } from '@/components/ui'
import { Toaster as ToasterSonner } from 'sonner'
import { Toaster } from './components/ui/toaster'

import { setCurrentPeriods, setCurrPeriodLoading } from './store/slices/period-slice'
// import { connectSocket, disconnectSocket } from './utils/socket-client'
import { ChatProvider } from './contexts/ChatSocketContext'
import { useGetCurrentPeriodsQuery } from './services/periodApi'

const App = () => {
	const user = useAppSelector((state) => state.auth.user)
	const token = sessionStorage.getItem('accessToken')
	const { data: userData, isLoading } = useGetProfileQuery(undefined, {
		skip: !token // chỉ skip khi chưa login
	})
	const { data: periodDatas } = useGetCurrentPeriodsQuery()

	const dispatch = useAppDispatch()

	useEffect(() => {
		console.log(`app :: `, userData)
		if (userData && userData !== user) {
			dispatch(setUser(userData))
		}
	}, [userData, user])

	useEffect(() => {
		dispatch(setCurrPeriodLoading(true))
	}, [])
	useEffect(() => {
		if (periodDatas) {
			dispatch(setCurrentPeriods(periodDatas))
			dispatch(setCurrPeriodLoading(false))
		}
	}, [periodDatas])

	// useEffect(() => {
	// 	if (token) {
	// 		connectSocket(token)
	// 	}
	// 	return () => {
	// 		disconnectSocket()
	// 	}
	// }, [token])

	if (isLoading) return <LoadingOverlay />

	if (!userData) {
		return null
	}

	const userId = 'userId' in userData ? userData.userId : userData._id

	return (
		<ChatProvider userId={userId}>
			<Layout>
				<Outlet />
				<Toaster />
				<ToasterSonner />
			</Layout>
		</ChatProvider>
	)
}

export default App
