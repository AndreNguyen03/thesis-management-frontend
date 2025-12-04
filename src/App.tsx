import { Outlet } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { useAppDispatch, useAppSelector } from '@/store'
import { useEffect } from 'react'
import { useGetProfileQuery } from './services/userApi'
import { setUser } from '@/features/shared/auth'
import { LoadingOverlay } from '@/components/ui'
import { Toaster as ToasterSonner } from 'sonner'
import { Toaster } from './components/ui/toaster'
import { connectSocket, disconnectSocket } from './store/slices/socketSlice'
import { useGetCurrentPeriodInfoQuery } from './services/periodApi'
import { setCurrentPeriod, setCurrPeriodLoading } from './store/slices/periodSlice'

const App = () => {
	const user = useAppSelector((state) => state.auth.user)
	const token = sessionStorage.getItem('accessToken')
	const { data: userData, isLoading } = useGetProfileQuery(undefined, {
		skip: !token // chỉ skip khi chưa login
	})
	const { data: periodInfoData } = useGetCurrentPeriodInfoQuery()

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
		if (periodInfoData) {
			dispatch(setCurrentPeriod(periodInfoData))
			dispatch(setCurrPeriodLoading(false))
		}
	}, [periodInfoData])
	if (isLoading) return <LoadingOverlay />

	return (
		<Layout>
			<Outlet />
			<Toaster />
			<ToasterSonner />
		</Layout>
	)
}

export default App
