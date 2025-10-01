import { ProfileField } from '@/components/ui/ProfileField'
import { ProfileSection } from '@/components/ui/ProfileSection'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import { useState } from 'react'
import type { StudentUser } from 'models'
import { usePatchStudentMutation } from '../../../../services/userApi'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { LoadingOverlay } from '@/components/ui'

interface StudentProject {
	title: string
	description: string
	technologies: string[]
}

export const StudentProfileEdit = ({ student }: { student: StudentUser }) => {
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Hồ sơ', path: '/profile' }, { label: 'Chỉnh sửa' }])

	const [form, setForm] = useState(student)
	const [expandAll, setExpandAll] = useState(false)
	const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
		basic: true,
		intro: false,
		avatar: false,
		interests: false,
		skills: false,
		projects: false,
		additional: false
	})
	const navigate = useNavigate()
	// mutation hooks
	const [patchStudent, { isLoading }] = usePatchStudentMutation()

	const toggleSection = (key: string) => {
		if (expandAll) return
		setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
	}

	// --- interests ---
	const addInterest = () => setForm((prev) => ({ ...prev, interests: [...(prev.interests || []), ''] }))

	const updateInterest = (idx: number, value: string) =>
		setForm((prev) => {
			const newInterests = [...(prev.interests || [])]
			newInterests[idx] = value
			return { ...prev, interests: newInterests }
		})

	const removeInterest = (idx: number) =>
		setForm((prev) => ({
			...prev,
			interests: (prev.interests || []).filter((_, i) => i !== idx)
		}))

	// --- skills ---
	const addSkill = () => setForm((prev) => ({ ...prev, skills: [...(prev.skills || []), ''] }))

	const updateSkill = (idx: number, value: string) =>
		setForm((prev) => {
			const newSkills = [...(prev.skills || [])]
			newSkills[idx] = value
			return { ...prev, skills: newSkills }
		})

	const removeSkill = (idx: number) =>
		setForm((prev) => ({
			...prev,
			skills: (prev.skills || []).filter((_, i) => i !== idx)
		}))

	// --- projects ---
	const addProject = () =>
		setForm((prev) => ({
			...prev,
			projects: [...(prev.projects || []), { title: '', description: '', technologies: [] }]
		}))

	const updateProject = (index: number, updated: StudentProject) =>
		setForm((prev) => ({
			...prev,
			projects: (prev.projects || []).map((p, i) => (i === index ? updated : p))
		}))

	const removeProject = (index: number) =>
		setForm((prev) => ({
			...prev,
			projects: (prev.projects || []).filter((_, i) => i !== index)
		}))
	// --- handle field change ---
	const handleFieldChange = (field: string, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		console.log('Submit data:', form)
		try {
			await patchStudent({ id: form.id, body: form }).unwrap()
			toast.success('Cập nhật hồ sơ thành công!')
			navigate('/profile')
		} catch (err) {
			console.error(err)
			toast.error('Có lỗi xảy ra, vui lòng thử lại!')
		}
	}

	if (isLoading) return <LoadingOverlay />

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
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
						src={form.avatar || '/images/avatar-placeholder.png'} // fallback nếu chưa có avatar
						alt='Avatar'
						className='h-20 w-20 rounded-full border object-cover'
					/>
					<div className='flex flex-col gap-2'>
						<input
							type='file'
							accept='image/*'
							onChange={(e) => {
								const file = e.target.files?.[0]
								if (file) {
									const reader = new FileReader()
									reader.onload = () =>
										setForm((prev) => ({ ...prev, avatar: reader.result as string }))
									reader.readAsDataURL(file)
								}
							}}
						/>
					</div>
				</div>
			</ProfileSection>

			{/* Introduction */}
			<ProfileSection
				title='Giới thiệu'
				isOpen={expandAll || openSections.intro}
				onToggle={() => toggleSection('intro')}
			>
				<ProfileField
					label='Mô tả'
					type='textarea'
					value={form.introduction}
					onChange={(e) => setForm((prev) => ({ ...prev, introduction: e.target.value }))}
					variant='medium'
				/>
			</ProfileSection>

			{/* Skills */}
			<ProfileSection
				title='Kỹ năng & Công cụ'
				isOpen={expandAll || openSections.skills}
				onToggle={() => toggleSection('skills')}
			>
				{form.skills &&
					form.skills.length > 0 &&
					form.skills.map((skill, idx) => (
						<div key={idx} className='mb-2 flex items-center gap-4'>
							<div className='flex-1'>
								<ProfileField
									label={`Kỹ năng ${idx + 1}`}
									value={skill}
									onChange={(e) => updateSkill(idx, e.target.value)}
									variant='medium'
								/>
							</div>
							<button
								type='button'
								onClick={() => removeSkill(idx)}
								className='flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200'
							>
								X
							</button>
						</div>
					))}
				<button type='button' onClick={addSkill} className='mt-2 text-blue-500'>
					+ Thêm
				</button>
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
									onChange={(e) => updateInterest(idx, e.target.value)}
									variant='medium'
								/>
							</div>
							<button
								type='button'
								onClick={() => removeInterest(idx)}
								className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200'
							>
								X
							</button>
						</div>
					))}
				<button type='button' onClick={addInterest} className='text-blue-500'>
					+ Thêm
				</button>
			</ProfileSection>

			{/* Projects */}
			<ProfileSection
				title='Dự án'
				isOpen={expandAll || openSections.projects}
				onToggle={() => toggleSection('projects')}
			>
				<div className='space-y-4'>
					{form.projects &&
						form.projects.length > 0 &&
						form.projects.map((project, index) => (
							<div key={index} className='rounded-lg border bg-white p-4 shadow-sm'>
								<div className='mb-2 flex items-center justify-between'>
									<h4 className='text-lg font-semibold'>
										{project.title?.trim() || `Dự án ${index + 1}`}
									</h4>
									<button
										type='button'
										onClick={() => removeProject(index)}
										className='text-sm text-red-500 hover:underline'
									>
										Xóa
									</button>
								</div>

								<ProfileField
									label='Tên dự án'
									value={project.title || ''}
									onChange={(e) => updateProject(index, { ...project, title: e.target.value })}
									variant='large'
									orientation='column'
								/>

								<ProfileField
									label='Mô tả'
									value={project.description || ''}
									type='textarea'
									onChange={(e) => updateProject(index, { ...project, description: e.target.value })}
									variant='large'
									orientation='column'
								/>

								<ProfileField
									label='Công nghệ (cách nhau bởi dấu phẩy)'
									value={project.technologies?.join(', ') || ''}
									onChange={(e) =>
										updateProject(index, {
											...project,
											technologies: e.target.value
												.split(',')
												.map((t) => t.trim())
												.filter(Boolean)
										})
									}
									variant='medium'
									orientation='column'
								/>
							</div>
						))}
					<button onClick={addProject} className='mt-2 rounded-lg bg-primary px-4 py-2 text-white'>
						+ Thêm dự án
					</button>
				</div>
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
