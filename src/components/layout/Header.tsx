import { Bell, LogOut, MessageCircle, Search, User2 } from 'lucide-react'
import { Button, Dropdown, DropdownItem, DropdownLabel, DropdownSeparator, Input, LoadingOverlay, Badge } from '../ui'
import uitLogo from '../../assets/uit.png'
import type { User, ApiError } from '../../models'
import { useLogoutMutation } from '../../services/authApi'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
	user: User | null
}

const Header = ({ user }: HeaderProps) => {
	const [logout, { isLoading }] = useLogoutMutation()
	const navigate = useNavigate()
	const handleLogout = async () => {
		try {
			await logout().unwrap()
			toast.info('Đăng xuất thành công!')
			navigate('/login')
		} catch (err) {
			const error = err as ApiError

			toast.error(`Đã xảy ra lỗi : ${error?.data?.message}`)
		}
	}

	if (isLoading) return <LoadingOverlay />

	return (
		<header className='sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur'>
			<div className='container mx-auto flex h-16 items-center px-4'>
				{/* Logo */}
				<div className='flex items-center space-x-3'>
					<img src={uitLogo} alt='UIT Logo' className='h-10 w-10 rounded-lg object-cover shadow-md' />
					<div className='hidden md:block'>
						<h1 className='text-lg font-semibold text-blue-600'>UIT Thesis Management</h1>
						<p className='text-xs text-gray-500'>Hệ thống quản lý đề tài luận văn</p>
					</div>
				</div>

				{/* Search */}
				<div className='mx-6 flex-1'>
					<div className='relative mx-auto max-w-md'>
						<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500' />
						<Input
							placeholder='Tìm kiếm đề tài, giảng viên, sinh viên...'
							className='border-none bg-gray-50 pl-10 focus:bg-white focus:ring-1 focus:ring-blue-500'
						/>
					</div>
				</div>

				{/* Actions */}
				<div className='flex items-center space-x-4'>
					{/* AI Assistant */}
					<Button variant='ghost' size='sm' className='flex items-center'>
						<MessageCircle className='h-6 w-6' />
						<span className='ml-2 hidden sm:inline'>AI Assistant</span>
					</Button>

					{/* Notifications */}
					<Button variant='ghost' size='icon' className='relative'>
						<Bell className='h-6 w-8' />
						<Badge
							variant='destructive'
							className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
						>
							3
						</Badge>
					</Button>

					{/* User Menu */}
					<Dropdown
						trigger={
							<Button
								variant='ghost'
								className='relative flex h-9 w-9 items-center justify-center rounded-full p-0'
							>
								<div className='flex h-full w-full items-center justify-center rounded-full bg-blue-500'>
									<User2 className='h-4 w-4 text-white' />
								</div>
							</Button>
						}
					>
						<DropdownLabel>
							<div className='flex flex-col space-y-1'>
								<p className='text-sm font-medium'>{user?.fullName || 'Người dùng'}</p>
								<p className='text-xs text-gray-500'>{user?.email || 'user@uit.edu.vn'}</p>
								<Badge variant='secondary' className='mt-1 w-fit'>
									{user?.role === 'student' && 'Sinh viên'}
									{user?.role === 'teacher' && 'Giảng viên'}
									{user?.role === 'admin' && 'Quản trị viên'}
								</Badge>
							</div>
						</DropdownLabel>
						<DropdownSeparator />
						<DropdownItem className='flex items-center'>
							<User2 className='mr-2 h-4 w-4' />
							<span>Hồ sơ cá nhân</span>
						</DropdownItem>
						<DropdownItem>
							<span>Cài đặt</span>
						</DropdownItem>
						<DropdownSeparator />
						<DropdownItem onClick={handleLogout} className='flex items-center text-red-600'>
							<LogOut className='mr-2 h-4 w-4' />
							<span>Đăng xuất</span>
						</DropdownItem>
					</Dropdown>
				</div>
			</div>
		</header>
	)
}

export { Header }
