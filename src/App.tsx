import { Outlet } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { useAppDispatch, useAppSelector } from '@/store'
import { useEffect } from 'react'
import { useGetProfileQuery } from './services/userApi'
import { setUser } from '@/features/shared/auth'
import { LoadingOverlay } from '@/components/ui'
import { Toaster } from './components/ui/toaster'

const App = () => {
	const user = useAppSelector((state) => state.auth.user)
	const token = sessionStorage.getItem('accessToken')
	const { data: userData, isLoading } = useGetProfileQuery(undefined, {
		skip: !token // chỉ skip khi chưa login
	})
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (userData && userData !== user) {
			dispatch(setUser(userData))
		}
	}, [userData, user, dispatch])

	if (isLoading) return <LoadingOverlay />

	return (
		<Layout>
			<Outlet />
			<Toaster />
		</Layout>
	)
}

export default App
