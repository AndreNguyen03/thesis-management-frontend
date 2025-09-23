import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/configureStore'
import type { ReactNode } from 'react'

function RequireAuth({ children }: { children: ReactNode }) {
	const token = useAppSelector((state) => state.auth.accessToken)
	const location = useLocation()

	if (!token) {
		return <Navigate to='/login' state={{ from: location }} />
	}

	return <>{children}</>
}

export { RequireAuth }
