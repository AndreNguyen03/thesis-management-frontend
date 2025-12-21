import { Button } from '@/components/ui'
import { LecturerProfileHeader } from './LecturerProfileHeader'
import { useNavigate } from 'react-router-dom'
import { usePageBreadcrumb } from '@/hooks'
import type { LecturerProfile } from '@/models'
import { LecturerProfileContent } from './LecturerProfileContent'

export function LecturerProfilePage({ lecturer, viewerId }: { lecturer: LecturerProfile; viewerId?: string }) {
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Hồ sơ' }])
	const navigate = useNavigate()
	const isOwner = lecturer.userId === viewerId

	return (
		<div className='mx-auto min-h-screen space-y-6 px-6'>
			{/* Header + Conditional buttons */}
			<div className='mb-6'>
				{isOwner ? (
					// Owner mode: Title left, Edit right
					<div className='flex items-center justify-between'>
						<h1 className='text-2xl font-bold'>Hồ sơ giảng viên</h1>
						<Button size='default' className='w-fit' onClick={() => navigate('/profile/edit')}>
							Chỉnh sửa
						</Button>
					</div>
				) : (
					// View mode: Back left, Title center (sử dụng justify-between với spacer)
					<div className='flex items-center justify-between'>
						<Button variant='outline' size='default' className='w-fit' onClick={() => navigate(-1)}>
							Quay lại
						</Button>
						<h1 className='text-2xl font-bold'>Hồ sơ giảng viên</h1>
						{/* Spacer div để đẩy title về giữa nếu cần, hoặc dùng justify-center cho title riêng */}
						<div className='w-32' /> {/* Optional: Spacer bên phải để cân bằng */}
					</div>
				)}
			</div>

			<LecturerProfileHeader lecturer={lecturer} isOwner={isOwner}/>

			{/* Nội dung gộp: 2 cột */}
			<LecturerProfileContent lecturer={lecturer} />
		</div>
	)
}
