import { LoadingOverlay } from '@/components/ui'
import { ProfileField } from '@/components/ui/ProfileField'
import { ProfileSection } from '@/components/ui/ProfileSection'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import type { LecturerProfile } from '@/models'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUpdateLecturerProfileMutation } from '../../../../services/userApi'
import { useUploadAvatarMutation } from '@/services/uploadAvatarApi'
import { toast } from '@/hooks/use-toast'

interface LecturerProfileEditProps {
	lecturer: LecturerProfile
}

export default function LecturerProfileEdit({ lecturer }: LecturerProfileEditProps) {
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Hồ sơ', path: '/profile' }, { label: 'Chỉnh sửa' }])

	const [form, setForm] = useState<LecturerProfile>({ ...lecturer })
	const [expandAll, setExpandAll] = useState(false)
	const [openSections, setOpenSections] = useState<Record<string, boolean>>({
		basic: true,
		avatar: false,
		bio: false,
		areaInterest: false,
		researchInterests: false,
		publications: false
	})

	const navigate = useNavigate()
	const [updateProfile, { isLoading: isUpdating }] = useUpdateLecturerProfileMutation()
	const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation()

	const toggleSection = (key: string) => {
		if (!expandAll) setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
	}

	// ===== Generic helpers =====
	const addItem = <T,>(field: keyof LecturerProfile, defaultValue: T) =>
		setForm((prev) => ({
			...prev,
			[field]: [...((prev[field] as T[]) || []), defaultValue]
		}))

	const updateItem = <T,>(field: keyof LecturerProfile, index: number, value: T) =>
		setForm((prev) => ({
			...prev,
			[field]: (prev[field] as T[])?.map((item, i) => (i === index ? value : item))
		}))

	const removeItem = <T,>(field: keyof LecturerProfile, index: number) =>
		setForm((prev) => ({
			...prev,
			[field]: (prev[field] as T[])?.filter((_, i) => i !== index)
		}))

	const handleFieldChange = (field: keyof LecturerProfile, value: any) =>
		setForm((prev) => ({ ...prev, [field]: value }))

	// ===== Submit form =====
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const { userId, role, facultyName, ...patchData } = form
		try {
			await updateProfile({ id: form.userId, body: patchData }).unwrap()
			toast({
				title: 'Cập nhật hồ sơ thành công!'
			})
			navigate('/profile')
		} catch (err) {
			console.error(err)
			toast({
				title: 'Đã có lỗi xảy ra',
				description: `Lỗi khi cập nhật hồ sơ ${err}`
			})
		}
	}

	// ===== Upload avatar =====
	const handleAvatarChange = async (file: File) => {
		try {
			const formData = new FormData()
			formData.append('file', file)
			const res = await uploadAvatar(formData).unwrap()
			handleFieldChange('avatarUrl', `${res.avatarUrl}?t=${Date.now()}`)
			toast({
				title: 'Cập nhật ảnh địa diện thành công!'
			})
		} catch (err) {
			console.error(err)
			toast({
				title: 'Đã có lỗi xảy ra',
				description: `Lỗi khi cập nhật hồ sơ ${err}`
			})
		}
	}

	if (isUpdating || isUploading) return <LoadingOverlay />

	return (
		<form onSubmit={handleSubmit} className='space-y-6 w-full mx-10 my-5'>
			{/* Expand All */}
			<div className='flex flex-row-reverse items-center gap-2'>
				<label htmlFor='expandAll' className='text-sm font-medium'>
					Mở rộng tất cả
				</label>
				<input
					type='checkbox'
					id='expandAll'
					checked={expandAll}
					onChange={(e) => setExpandAll(e.target.checked)}
				/>
			</div>

			{/* Basic Info */}
			<ProfileSection
				title='Thông tin cơ bản'
				isOpen={expandAll || openSections.basic}
				onToggle={() => toggleSection('basic')}
			>
				<ProfileField label='Họ và tên' value={form.fullName} readOnly />
				<ProfileField label='Khoa' value={form.facultyName} readOnly />
				<ProfileField
					label='Email'
					type='email'
					value={form.email}
					onChange={(e) => handleFieldChange('email', e.target.value)}
				/>
				<ProfileField
					label='SĐT'
					value={form.phone || ''}
					onChange={(e) => handleFieldChange('phone', e.target.value)}
				/>
			</ProfileSection>

			{/* Avatar */}
			<ProfileSection
				title='Ảnh đại diện'
				isOpen={expandAll || openSections.avatar}
				onToggle={() => toggleSection('avatar')}
			>
				<div className='flex items-center gap-4'>
					<img
						key={form.avatarUrl}
						src={form.avatarUrl || '/default-avatar.png'}
						alt='Avatar'
						className='h-20 w-20 rounded-full border object-cover'
					/>
					<input
						type='file'
						accept='image/*'
						onChange={(e) => {
							const file = e.target.files?.[0]
							if (file) handleAvatarChange(file)
						}}
					/>
				</div>
			</ProfileSection>

			{/* Bio */}
			<ProfileSection
				title='Giới thiệu'
				isOpen={expandAll || openSections.bio}
				onToggle={() => toggleSection('bio')}
			>
				<ProfileField
					label='Mô tả'
					type='textarea'
					value={form.bio || ''}
					onChange={(e) => handleFieldChange('bio', e.target.value)}
					variant='large'
				/>
			</ProfileSection>

			{/* Area of Expertise */}
			<ProfileSection
				title='Chuyên môn'
				isOpen={expandAll || openSections.areaInterest}
				onToggle={() => toggleSection('areaInterest')}
			>
				{(form.areaInterest || []).map((item, idx) => (
					<div key={idx} className='flex items-center gap-4'>
						<ProfileField
							label={`Chuyên môn ${idx + 1}`}
							value={item}
							onChange={(e) => updateItem('areaInterest', idx, e.target.value)}
							variant='medium'
						/>
						<button
							type='button'
							className='h-10 w-10 rounded-full bg-red-100 text-red-500 hover:bg-red-200'
							onClick={() => removeItem('areaInterest', idx)}
						>
							X
						</button>
					</div>
				))}
				<button type='button' onClick={() => addItem('areaInterest', '')} className='text-blue-500'>
					+ Thêm
				</button>
			</ProfileSection>

			{/* Research Interests */}
			<ProfileSection
				title='Hướng nghiên cứu quan tâm'
				isOpen={expandAll || openSections.researchInterests}
				onToggle={() => toggleSection('researchInterests')}
			>
				{(form.researchInterests || []).map((item, idx) => (
					<div key={idx} className='flex items-center gap-4'>
						<ProfileField
							label={`Quan tâm ${idx + 1}`}
							value={item}
							onChange={(e) => updateItem('researchInterests', idx, e.target.value)}
							variant='medium'
						/>
						<button
							type='button'
							className='h-10 w-10 rounded-full bg-red-100 text-red-500 hover:bg-red-200'
							onClick={() => removeItem('researchInterests', idx)}
						>
							X
						</button>
					</div>
				))}
				<button type='button' onClick={() => addItem('researchInterests', '')} className='text-blue-500'>
					+ Thêm
				</button>
			</ProfileSection>

			{/* Publications */}
			<ProfileSection
				title='Công trình nghiên cứu'
				isOpen={expandAll || openSections.publications}
				onToggle={() => toggleSection('publications')}
			>
				{(form.publications || []).map((pub, idx) => (
					<div key={idx} className='rounded-lg border bg-white p-4 shadow-sm'>
						<div className='mb-2 flex items-center justify-between'>
							<h4 className='text-lg font-semibold'>{pub.title || `Công trình ${idx + 1}`}</h4>
							<button
								type='button'
								className='text-sm text-red-500 hover:underline'
								onClick={() => removeItem('publications', idx)}
							>
								Xóa
							</button>
						</div>
						<ProfileField
							label='Tên công trình'
							value={pub.title}
							onChange={(e) => updateItem('publications', idx, { ...pub, title: e.target.value })}
							variant='large'
						/>
						<ProfileField
							label='Năm'
							value={pub.year}
							onChange={(e) => updateItem('publications', idx, { ...pub, year: e.target.value })}
							variant='medium'
						/>
						<ProfileField
							label='Loại'
							value={pub.type}
							onChange={(e) => updateItem('publications', idx, { ...pub, type: e.target.value })}
							variant='medium'
						/>
						<ProfileField
							label='Tạp chí / Hội nghị'
							value={pub.journal || pub.conference || ''}
							onChange={(e) =>
								updateItem('publications', idx, {
									...pub,
									journal: e.target.value,
									conference: e.target.value
								})
							}
							variant='medium'
						/>
						<ProfileField
							label='Số trích dẫn'
							type='text'
							value={String(pub.citations ?? 0)}
							onChange={(e) =>
								updateItem('publications', idx, { ...pub, citations: Number(e.target.value) })
							}
							variant='medium'
						/>
						<ProfileField
							label='Link bài báo / hội nghị'
							value={pub.link || ''}
							onChange={(e) => updateItem('publications', idx, { ...pub, link: e.target.value })}
							variant='large'
						/>
					</div>
				))}
				<button
					type='button'
					onClick={() =>
						addItem('publications', {
							title: '',
							journal: '',
							conference: '',
							year: '',
							type: '',
							citations: 0
						})
					}
					className='mt-2 rounded-lg bg-primary px-4 py-2 text-white'
				>
					+ Thêm công trình
				</button>
			</ProfileSection>

			{/* Submit */}
			<div className='text-right'>
				<button type='submit' className='rounded bg-blue-600 px-4 py-2 font-semibold text-white'>
					Lưu thay đổi
				</button>
			</div>
		</form>
	)
}
