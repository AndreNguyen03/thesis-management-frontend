import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { Layout } from './components/layout/Layout'
import { useAppDispatch, useAppSelector } from './store'
import { useEffect } from 'react'
import { useGetProfileQuery } from './services/userApi'
import { setUser } from './features/shared/auth'
import { LoadingOverlay } from './components/ui'

const App = () => {
	const user = useAppSelector((state) => state.auth.user)
	const token = sessionStorage.getItem('accessToken')
	const { data: userData, isLoading } = useGetProfileQuery(undefined, {
		skip: !token // chỉ skip khi chưa login
	})
	const dispatch = useAppDispatch()

	useEffect(() => {
        console.log(`app :: `,userData)
		if (userData && userData !== user) {
			dispatch(setUser(userData))
		}
	}, [userData, user, dispatch])

	if (isLoading) return <LoadingOverlay />

	return (
		<Layout>
			<Outlet />
			<ToastContainer
				position='top-right'
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme='light'
			/>
		</Layout>
	)
}

export default App
