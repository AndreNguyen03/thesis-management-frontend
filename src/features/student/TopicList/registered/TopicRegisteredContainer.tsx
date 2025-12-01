import { NavLink, Outlet } from 'react-router-dom'
export const RegisteredTopicContainer = () => {
	//const user = useAppSelector((state) => state.auth.user)

	return (
		<div className='mx-auto pb-5'>
			{/* Results */}
			<div className='space-y-4'>
				{/* Navbar with 2 options: Registered & Cancelled */}
				<div>
					{/* Navigation với NavLink */}
					<div className='mb-4 flex gap-2'>
						<NavLink
							to='/topics/registered'
							end
							className={({ isActive }) =>
								`rounded px-4 py-2 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200'}`
							}
						>
							Đã đăng ký
						</NavLink>

						<NavLink
							to='canceled'
							className={({ isActive }) =>
								`rounded px-4 py-2 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200'}`
							}
						>
							Lịch sử đăng ký
						</NavLink>
					</div>
				</div>

				<Outlet />
			</div>
		</div>
	)
}
