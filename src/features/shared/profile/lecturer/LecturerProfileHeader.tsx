import { Avatar, AvatarFallback, AvatarImage, Button } from '@/components/ui'
import type { LecturerProfile } from '@/models'
import { useCreateOrGetDirectGroupMutation } from '@/services/groupApi'
import { MailIcon, MessageCircle, PhoneIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function LecturerProfileHeader({ lecturer, isOwner }: { lecturer: LecturerProfile; isOwner: boolean }) {
	const navigate = useNavigate()
	const [createOrGetDirectGroup, { isLoading }] = useCreateOrGetDirectGroupMutation()

	const handleMessage = async () => {
		if (isLoading) return
		try {
			const newGroup = await createOrGetDirectGroup({
				targetUserId: lecturer.userId
			}).unwrap()

			navigate(`/chat?groupId=${newGroup.id}`)
		} catch (error) {
			console.error('Tạo chat thất bại:', error)
			alert('Không thể tạo cuộc trò chuyện. Thử lại sau.')
		}
	}
	return (
		<div className='flex flex-col gap-8 rounded-xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg sm:p-8 lg:flex-row lg:gap-12'>
			{/* Left Section: Avatar and Basic Info */}
			<div className='flex flex-col items-center gap-6'>
				<div className='relative'>
					<Avatar className='h-32 w-32 rounded-full border-4 border-white shadow-xl'>
						<AvatarImage src={lecturer.avatarUrl} alt={lecturer.fullName} className='object-cover' />
						<AvatarFallback className='flex items-center justify-center text-2xl font-bold text-white'>
							{lecturer.fullName?.[0]?.toUpperCase()}
						</AvatarFallback>
					</Avatar>
					{/* Optional: Add a subtle status indicator */}
					<div className='absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white bg-green-500 shadow-md'></div>
				</div>
				<div className='space-y-2 text-center lg:text-left'>
					<h1 className='text-center text-3xl font-bold text-gray-900'>{lecturer.fullName}</h1>
					<p className='text-center text-xl font-semibold text-gray-600'>{lecturer?.title}</p>
					<div className='flex items-center gap-2 text-gray-500'>
						<span className='text-base'>Khoa:</span>
						<p className='italic leading-relaxed'>{lecturer?.facultyName}</p>
					</div>
				</div>
			</div>

			{/* Middle Section: Contact Info */}
			<div className='flex-1 space-y-6 lg:basis-1/3 lg:pl-8'>
				<div className='space-y-4'>
					{/* Contact Details */}
					<div className='grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-md md:grid-cols-3'>
						<div className='flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50'>
							<MailIcon className='h-10 w-10 text-gray-400' />
							<div>
								<p className='text-sm font-medium text-gray-500'>Email</p>
								<p className='break-all text-base font-semibold text-gray-900'>{lecturer.email}</p>
							</div>
						</div>
						<div className='flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50'>
							<PhoneIcon className='h-10 w-10 text-gray-400' />
							<div>
								<p className='text-sm font-medium text-gray-500'>Số điện thoại</p>
								<p className='text-base font-semibold text-gray-900'>{lecturer.phone}</p>
							</div>
						</div>
						{/* Action Button */}
						{!isOwner && (
							<div className='flex items-center justify-center lg:justify-start'>
								<Button
									onClick={handleMessage}
									size='lg'
									variant='default'
									className='w-full transform hover:shadow-xl md:w-auto'
								>
									<MessageCircle className='h-6 w-6' />
									Liên hệ ngay
								</Button>
							</div>
						)}
					</div>
				</div>
				{/* Right Section: Stats */}
				<div className='space-y-6'>
					<h3 className='mb-4 text-center text-lg font-semibold text-gray-800 lg:text-left'>
						Thống kê bảo vệ khóa luận
					</h3>
					<div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
						{/* Total Topics */}
						<div className='rounded-lg border border-gray-200 bg-white p-4 text-center shadow-md'>
							<p className='text-2xl font-bold text-gray-900'>{lecturer.totalTopics || 0}</p>
							<p className='text-sm uppercase tracking-wide text-gray-500'>Tổng đề tài</p>
						</div>
						{/* Completed */}
						<div className='rounded-lg border border-gray-200 bg-white p-4 text-center shadow-md'>
							<p className='text-2xl font-bold text-blue-600'>{lecturer.completed || 0}</p>
							<p className='text-sm uppercase tracking-wide text-gray-500'>Đã hoàn thành</p>
						</div>
						{/* Excellent */}
						<div className='rounded-lg border border-gray-200 bg-white p-4 text-center shadow-md'>
							<p className='text-2xl font-bold text-green-600'>{lecturer.excellent || 0}</p>
							<p className='text-sm uppercase tracking-wide text-gray-500'>Xuất sắc</p>
						</div>
						{/* Success Rate */}
						<div className='rounded-lg border border-gray-200 bg-white p-4 text-center shadow-md'>
							<p className='text-2xl font-bold text-purple-600'>{lecturer.successRate || 0}%</p>
							<p className='text-sm uppercase tracking-wide text-gray-500'>Tỷ lệ thành công</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
