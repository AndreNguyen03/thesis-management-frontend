/* eslint-disable @typescript-eslint/no-explicit-any */
import { LogOut, MessageCircle, Search, User2 } from 'lucide-react'
import { Button, Dropdown, DropdownItem, DropdownLabel, DropdownSeparator, Input, LoadingOverlay, Badge } from '../ui'
import uitLogo from '../../assets/uit.png'
import type { ApiError, AppUser } from '../../models'
import { useLogoutMutation } from '../../services/authApi'
import { toast } from 'react-toastify'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAppDispatch } from '../../store'
import { userApi } from '../../services/userApi'
import NotificationPopover from '../NotificationPopover'
import { ROLES, type SearchUserItemDto } from '@/models/users'
import { useLazySearchUsersQuery } from '../../services/userApi'
import { useDebounce } from '@/hooks/useDebounce' // import hook debounce
import { getAvatarInitials } from '@/utils/utils'

interface HeaderProps {
	user: AppUser | null
	onOpenAI: () => void
}

const PAGE_SIZE = 6

const Header = ({ user, onOpenAI }: HeaderProps) => {
	const [logout, { isLoading }] = useLogoutMutation()
	const navigate = useNavigate()
	const [openUserMenu, setOpenUserMenu] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [openSearch, setOpenSearch] = useState(false)
	const [page, setPage] = useState(1)
	const [results, setResults] = useState<SearchUserItemDto[]>([])
	const [hasMore, setHasMore] = useState(false)
	const dispatch = useAppDispatch()
	const [triggerSearch, { data, isFetching }] = useLazySearchUsersQuery()

	const location = useLocation()

	useEffect(() => {
		setOpenUserMenu(false)
	}, [location.pathname])

	// Debounce search
	const debouncedSearch = useDebounce({
		onChange: (val: string) => {
			setPage(1)
			triggerSearch({ query: val, page: 1, limit: PAGE_SIZE })
		},
		duration: 300
	})

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value
		setSearchQuery(val)
		setResults([]) // reset kết quả cũ ngay
		setPage(1) // reset page
		setHasMore(false) // reset hasMore
		setOpenSearch(true) // giữ dropdown mở khi gõ
		debouncedSearch(val)
	}

	const handleLogout = async () => {
		try {
			await logout().unwrap()
			dispatch(userApi.util.resetApiState())
			toast.info('Đăng xuất thành công!')
			navigate('/login')
		} catch (err) {
			const error = err as ApiError
			toast.error(`Đã xảy ra lỗi : ${error?.data?.message}`)
		}
	}

	useEffect(() => {
		if (!data) return

		if (page === 1) {
			setResults(data.data)
		} else {
			setResults((prev) => [...prev, ...data.data])
		}

		const totalLoaded = page === 1 ? data.data.length : results.length + data.data.length
		setHasMore(data.meta.totalItems > totalLoaded)

		setOpenSearch(true) // luôn giữ dropdown mở
	}, [data, page])

	const loadMore = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation()
		const nextPage = page + 1
		setPage(nextPage)

		triggerSearch({ query: searchQuery, page: nextPage, limit: PAGE_SIZE }).then((res: any) => {
			if ('data' in res) {
				setResults((prev) => {
					const newResults = [...prev, ...res.data.data]
					setHasMore(res.data.meta.totalItems > newResults.length)
					return newResults
				})
				setOpenSearch(true) // giữ dropdown mở
			}
		})
	}

	if (isLoading) return <LoadingOverlay />

	return (
		<header className='support-backdrop-blur:bg-white/60 fixed top-0 z-50 w-full min-w-[10rem] border-b border-gray-200 bg-white/80 backdrop-blur-md'>
			<div className='mx-auto flex h-16 w-full max-w-screen-2xl items-center px-4'>
				{/* Logo */}
				<div className='flex items-center space-x-3'>
					<a className='mx-auto block w-fit text-center'>
						<img src={uitLogo} alt='UIT Logo' className='h-8 w-8 object-contain' />
					</a>
					<div className='hidden md:block'>
						<h1 className='text-xs font-semibold text-blue-600'>UIT Thesis Management</h1>
						<p className='text-xs text-gray-500'>Hệ thống quản lý đề tài luận văn</p>
					</div>
				</div>

				{/* Search */}
				<div className='mx-2 flex-1'>
					<div className='hidden md:block'>
						<div className='relative mx-auto w-full max-w-md'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500' />
							<Input
								placeholder='Tìm kiếm giảng viên, sinh viên...'
								className='w-full border-none bg-gray-50 pl-10 focus:bg-white focus:ring-1 focus:ring-blue-500'
								value={searchQuery}
								onChange={handleInputChange}
								onFocus={() => setOpenSearch(true)}
								onBlur={() => setTimeout(() => setOpenSearch(false), 200)}
							/>

							{openSearch && searchQuery && (
								<div className='absolute left-0 top-full z-50 mt-1 max-h-96 w-full max-w-md overflow-y-auto rounded-md border bg-white shadow-lg'>
									{results.length === 0 && isFetching ? (
										// Skeleton lần search đầu
										Array.from({ length: 3 }).map((_, idx) => (
											<div key={idx} className='flex animate-pulse items-center gap-3 px-3 py-2'>
												<div className='h-10 w-10 rounded-full bg-gray-300' />
												<div className='flex-1 space-y-1'>
													<div className='h-4 w-3/4 rounded bg-gray-300' />
													<div className='h-3 w-1/2 rounded bg-gray-200' />
												</div>
											</div>
										))
									) : results.length > 0 ? (
										<>
											{results.map((u) => (
												<DropdownItem
													key={u.id}
													className='flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-100'
													onClick={() => {
														navigate(`/profile/${u.role}/${u.id}`)
														setOpenSearch(false)
														setSearchQuery('')
													}}
												>
													<div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 font-bold text-white'>
														{u.avatarUrl ? (
															<img
																src={u.avatarUrl}
																alt={u.fullName}
																className='h-full w-full rounded-full object-cover'
															/>
														) : (
															getAvatarInitials(u.fullName)
														)}
													</div>
													<div className='flex-1'>
														<p className='text-sm font-medium'>{u.fullName}</p>
														<p className='text-xs text-gray-500'>
															{u.role === 'student'
																? `${u.email} • ${u.studentCode || ''}`
																: `${u.email} • ${u.title || ''}`}
														</p>
													</div>
												</DropdownItem>
											))}

											{isFetching &&
												page > 1 &&
												// Skeleton loadMore
												Array.from({ length: 2 }).map((_, idx) => (
													<div
														key={`load-${idx}`}
														className='flex animate-pulse items-center gap-3 px-3 py-2'
													>
														<div className='h-10 w-10 rounded-full bg-gray-300' />
														<div className='flex-1 space-y-1'>
															<div className='h-4 w-3/4 rounded bg-gray-300' />
															<div className='h-3 w-1/2 rounded bg-gray-200' />
														</div>
													</div>
												))}

											{hasMore && !isFetching && (
												<div
													className='cursor-pointer px-3 py-1 text-center text-sm text-blue-600 hover:underline'
													onClick={(e) => loadMore(e)}
												>
													Xem thêm
												</div>
											)}
										</>
									) : (
										<div className='px-3 py-2 text-center text-gray-500'>
											Không tìm thấy kết quả
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className='flex items-center space-x-2 sm:space-x-4'>
					<Button
						variant='default'
						size='sm'
						className='hidden items-center sm:flex'
						onClick={() => navigate('/ai-chat')}
					>
						<MessageCircle className='h-6 w-6' />
						<span className='ml-2 hidden sm:inline'>AI Assistant</span>
					</Button>

					<NotificationPopover />

					{/* User Menu */}
					<Dropdown
						open={openUserMenu}
						onOpenChange={setOpenUserMenu}
						trigger={
							<Button
								variant='ghost'
								className='relative flex h-9 w-9 items-center justify-center rounded-full p-0'
								onClick={() => setOpenUserMenu((prev) => !prev)}
							>
								{user?.avatarUrl ? (
									<img
										src={user.avatarUrl}
										alt={user.fullName || 'User Avatar'}
										className='h-full w-full rounded-full object-cover'
									/>
								) : (
									<div className='flex h-full w-full items-center justify-center rounded-full bg-blue-500 font-bold text-white'>
										{getAvatarInitials(user?.fullName)}
									</div>
								)}
							</Button>
						}
					>
						<DropdownLabel>
							<div className='flex flex-col space-y-1'>
								<p className='text-sm font-medium'>{user?.fullName || 'Người dùng'}</p>
								<p className='text-xs text-gray-500'>{user?.email || 'user@uit.edu.vn'}</p>
								<Badge variant='secondary' className='mt-1 w-fit'>
									{user?.role === 'student' && 'Sinh viên'}
									{user?.role === 'lecturer' && 'Giảng viên'}
									{user?.role === 'admin' && 'Quản trị viên'}
								</Badge>
							</div>
						</DropdownLabel>
						<DropdownSeparator />
						{user?.role !== ROLES.ADMIN && user?.role !== ROLES.FACULTY_BOARD && (
							<DropdownItem
								onClick={() => {
									navigate('/profile')
									setOpenUserMenu(false)
								}}
								className='flex items-center'
							>
								<User2 className='mr-2 h-4 w-4' />
								<span>Hồ sơ cá nhân</span>
							</DropdownItem>
						)}
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
