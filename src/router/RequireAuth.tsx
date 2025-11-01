import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAppSelector } from '../store/configureStore'

function RequireAuth({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) {
	const token = sessionStorage.getItem('accessToken')
	const location = useLocation()
	const user = useAppSelector((state) => state.auth.user)

	// chưa đăng nhập
	if (!token) {
		return <Navigate to='/login' state={{ from: location }} />
	}

	// nếu có ràng buộc vai trò nhưng user chưa load hoặc không khớp -> chuyển sang unauthorized
	if (allowedRoles && allowedRoles.length > 0) {
		const role = user?.role
		if (!role || !allowedRoles.includes(role)) {
			return <Navigate to='/unauthorized' replace />
		}
	}

	return <>{children}</>
}

export { RequireAuth }
