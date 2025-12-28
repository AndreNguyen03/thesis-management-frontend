import { ProfileField } from '@/components/ui/ProfileField'
import { ProfileSection } from '@/components/ui/ProfileSection'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import { useState } from 'react'
import type { StudentUser } from '@/models'
import { toast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { LoadingOverlay } from '@/components/ui'
import { useUpdateStudentProfileMutation } from '@/services/studentApi'
import { useUploadAvatarMutation } from '@/services/uploadAvatarApi'
import SkillContainer from './SkillContainer '

export const StudentProfileEdit = ({ student }: { student: StudentUser }) => {
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Hồ sơ', path: '/profile' }, { label: 'Chỉnh sửa' }])
	console.log('student :::', student)
	const [form, setForm] = useState(student)
	const [expandAll, setExpandAll] = useState(false)
	const [skills, setSkills] = useState<string[]>(student.skills || [])
	const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
		basic: true,
		bio: false,
		avatar: false,
		interests: false,
		skills: false
	})
	const navigate = useNavigate()
	// mutation hooks
	const [updateStudent, { isLoading }] = useUpdateStudentProfileMutation()
	const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation()

	const toggleSection = (key: string) => {
		if (expandAll) return
		setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
	}

	// ===== Generic helpers =====
	const addItem = <T,>(field: keyof StudentUser, defaultValue: T) =>
		setForm((prev) => ({
			...prev,
			[field]: [...((prev[field] as T[]) || []), defaultValue]
		}))

	const updateItem = <T,>(field: keyof StudentUser, index: number, value: T) =>
		setForm((prev) => ({
			...prev,
			[field]: (prev[field] as T[])?.map((item, i) => (i === index ? value : item))
		}))

	const removeItem = <T,>(field: keyof StudentUser, index: number) =>
		setForm((prev) => ({
			...prev,
			[field]: (prev[field] as T[])?.filter((_, i) => i !== index)
		}))

	const handleFieldChange = (field: keyof StudentUser, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

	// ===== Submit form =====
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const { userId, role, major, studentCode, facultyName, class: _class, ...rest } = form
		const patchData = {
			...rest,
			skills 
		}
		console.log('Submitting patch data:', patchData)
		try {
			await updateStudent({ id: form.userId, data: patchData }).unwrap()
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
				title: 'Cập nhật ảnh đại diện thành công!'
			})
		} catch (err) {
			console.error(err)
			toast({
				title: 'Đã có lỗi xảy ra',
				description: `Lỗi khi cập nhật hồ sơ ${err}`
			})
		}
	}

	if (isLoading || isUploading) return <LoadingOverlay />

	return (
		<form onSubmit={handleSubmit} className='mx-10 my-5 w-full space-y-6'>
			{/* Expand All Toggle */}
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
				<ProfileField
					label='Họ và tên'
					value={form.fullName}
					onChange={(e) => handleFieldChange('fullName', e.target.value)}
					variant='medium'
					readOnly
				/>
				<ProfileField
					label='Lớp'
					value={form.class}
					onChange={(e) => handleFieldChange('class', e.target.value)}
					variant='medium'
					readOnly
				/>
				<ProfileField
					label='Ngành'
					value={form.major}
					onChange={(e) => handleFieldChange('major', e.target.value)}
					variant='medium'
					readOnly
				/>
				<ProfileField
					label='Email'
					type='email'
					value={form.email}
					onChange={(e) => handleFieldChange('email', e.target.value)}
					variant='medium'
				/>
				<ProfileField
					label='SĐT'
					value={form.phone}
					onChange={(e) => handleFieldChange('phone', e.target.value)}
					variant='medium'
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
						src={form.avatarUrl || '/images/avatar-placeholder.png'} // fallback nếu chưa có avatar
						alt='Avatar'
						className='h-20 w-20 rounded-full border object-cover'
					/>
					<div className='flex flex-col gap-2'>
						<input
							type='file'
							accept='image/*'
							onChange={(e) => {
								const file = e.target.files?.[0]
								if (file) handleAvatarChange(file)
							}}
						/>
					</div>
				</div>
			</ProfileSection>

			{/* Introduction */}
			<ProfileSection
				title='Giới thiệu'
				isOpen={expandAll || openSections.bio}
				onToggle={() => toggleSection('bio')}
			>
				<ProfileField
					label='Mô tả'
					type='textarea'
					value={form.bio}
					onChange={(e) => handleFieldChange('bio', e.target.value)}
					variant='medium'
				/>
			</ProfileSection>

			{/* Skills */}
			<ProfileSection
				title='Kỹ năng & Công cụ'
				isOpen={expandAll || openSections.skills}
				onToggle={() => toggleSection('skills')}
			>
				<SkillContainer selectedSkills={skills} onSelectionChange={setSkills} />
			</ProfileSection>

			{/* Interests */}
			<ProfileSection
				title='Hướng nghiên cứu quan tâm'
				isOpen={expandAll || openSections.interests}
				onToggle={() => toggleSection('interests')}
			>
				{form.interests &&
					form.interests.length > 0 &&
					form.interests.map((interest, idx) => (
						<div key={idx} className='flex items-center gap-4'>
							<div className='flex-1'>
								<ProfileField
									label={`Quan tâm ${idx + 1}`}
									value={interest || ''}
									onChange={(e) => updateItem('interests', idx, e.target.value)}
									variant='medium'
								/>
							</div>
							<button
								type='button'
								onClick={() => removeItem('interests', idx)}
								className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200'
							>
								X
							</button>
						</div>
					))}
				<button type='button' onClick={() => addItem('interests', '')} className='text-blue-500'>
					+ Thêm
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
