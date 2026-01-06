import { NavLink, Outlet } from 'react-router-dom'
export const RegisteredTopicContainer = () => {
	//const user = useAppSelector((state) => state.auth.user)

	return (
		<div className='mx-10 w-full overflow-y-auto pt-10'>
			{/* Results */}
			<div className='space-y-4'>
				{/* Navbar with 2 options: Registered & Cancelled */}
				<div className='mb-6 border-b'>
					<nav className='flex gap-6'>
						<NavLink
							to='/topics/registered'
							end
							className={({ isActive }) =>
								`pb-3 text-sm font-medium transition-colors ${
									isActive
										? 'border-b-2 border-primary text-primary'
										: 'text-muted-foreground hover:text-primary'
								}`
							}
						>
							Đã đăng ký
						</NavLink>

						<NavLink
							to='canceled'
							className={({ isActive }) =>
								`pb-3 text-sm font-medium transition-colors ${
									isActive
										? 'border-b-2 border-primary text-primary'
										: 'text-muted-foreground hover:text-primary'
								}`
							}
						>
							Lịch sử đăng ký
						</NavLink>
					</nav>
				</div>

				<Outlet />
			</div>
		</div>
	)
}
