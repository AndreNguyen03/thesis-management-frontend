import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

function RequireAuth({ children }: { children: ReactNode }) {
	const token = sessionStorage.getItem('accessToken')
	const location = useLocation()

	if (!token) {
		return <Navigate to='/login' state={{ from: location }} />
	}

	return <>{children}</>
}

export { RequireAuth }
