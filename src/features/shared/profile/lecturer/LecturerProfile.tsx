import {  Button } from '@/components/ui'
import { LecturerProfileHeader } from './LecturerProfileHeader'
import { useNavigate } from 'react-router-dom'
import { usePageBreadcrumb } from '@/hooks'
import type { LecturerProfile } from '@/models'
import { LecturerProfileContent } from './LecturerProfileContent' // import component mới

export function LecturerProfilePage({ lecturer }: { lecturer: LecturerProfile }) {
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Hồ sơ' }])
	const navigate = useNavigate()

	return (
		<div className='mx-auto min-h-screen space-y-6 px-6'>
			{/* Header + Edit button */}
			<div className='mb-6 flex items-center justify-between'>
				<h1 className='text-2xl font-bold'>Hồ sơ giảng viên</h1>
				<Button size='default' className='w-fit' onClick={() => navigate('/profile/edit')}>
					Chỉnh sửa
				</Button>
			</div>

			<LecturerProfileHeader lecturer={lecturer} />

			{/* Nội dung gộp: 2 cột */}
			<LecturerProfileContent lecturer={lecturer} />
		</div>
	)
}
