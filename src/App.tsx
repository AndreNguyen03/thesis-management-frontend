import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { Layout } from './components/layout/Layout'
import { useAppSelector } from './store'

const App = () => {
	const user = useAppSelector((state) => state.auth.user)

	return (
		<Layout user={user}>
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
