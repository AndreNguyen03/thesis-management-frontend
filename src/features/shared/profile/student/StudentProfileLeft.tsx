import type { StudentUser } from '@/models'
import { GraduationCap, Mail, MessageCircle, Phone, User2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { useNavigate } from 'react-router-dom'
import { useCreateOrGetDirectGroupMutation } from '@/services/groupApi'

interface Props {
	student: StudentUser
	isOwner: boolean
}

export function StudentProfileLeft({ student, isOwner }: Props) {
	const navigate = useNavigate()
	const [createOrGetDirectGroup, { isLoading }] = useCreateOrGetDirectGroupMutation()

	const handleMessage = async () => {
		if (isLoading) return
		try {
			const newGroup = await createOrGetDirectGroup({
				targetUserId: student.userId
			}).unwrap()

			navigate(`/chat?groupId=${newGroup.id}`)
		} catch (error) {
			console.error('Tạo chat thất bại:', error)
			alert('Không thể tạo cuộc trò chuyện. Thử lại sau.')
		}
	}

	return (
		<div className='space-y-6 lg:col-span-2'>
			{/* Profile Header */}
			<div className='rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-200 hover:shadow-lg'>
				<div className='flex items-center gap-5'>
					{/* Avatar */}
					<div className='relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 text-xl font-semibold text-gray-600 shadow-sm'>
						{student.avatarUrl ? (
							<img
								src={student.avatarUrl}
								alt={student.fullName}
								className='h-full w-full object-cover'
							/>
						) : (
							student.fullName
								.split(' ')
								.map((n) => n[0])
								.join('')
						)}
					</div>

					{/* Info */}
					<div className='flex-1'>
						<h2 className='text-2xl font-bold text-gray-900'>{student.fullName || 'Chưa có'}</h2>

						<div className='mt-2 flex items-center gap-2 text-sm text-gray-600'>
							<GraduationCap className='h-4 w-4' />
							<span>
								{student.class || 'Chưa có'} • {student.major || 'Chưa có'}
							</span>
						</div>
					</div>
				</div>

				{/* Contact */}
				<div className='mt-6 grid gap-4 md:grid-cols-3'>
					<div className='flex cursor-pointer items-center gap-2 text-sm text-gray-700 hover:text-blue-600 hover:underline'>
						<Mail className='h-4 w-4 text-gray-500' />
						{student.email || 'Chưa có'}
					</div>

					<div className='flex cursor-pointer items-center gap-2 text-sm text-gray-700 hover:text-blue-600 hover:underline'>
						<Phone className='h-4 w-4 text-gray-500' />
						{student.phone || 'Chưa có'}
					</div>

					{!isOwner && (
						<div className='flex items-center justify-center md:justify-end'>
							<Button
								onClick={handleMessage}
								size='lg'
								variant='default'
								className='flex w-full gap-2 shadow-sm transition-shadow duration-150 hover:shadow-md md:w-auto'
							>
								<MessageCircle className='h-5 w-5' />
								Liên hệ ngay
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* About */}
			<div className='rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-200 hover:shadow-xl'>
				<div className='mb-3 flex items-center gap-2'>
					<User2 className='h-5 w-5 text-gray-600' />
					<h3 className='text-lg font-semibold text-gray-900'>Giới thiệu bản thân</h3>
				</div>

				<p className='text-[15px] leading-relaxed text-gray-700'>{student.bio || 'Chưa có thông tin.'}</p>
			</div>
		</div>
	)
}
