import { LoadingOverlay } from '@/components/ui'
import { ProfileField } from '@/components/ui/ProfileField'
import { ProfileSection } from '@/components/ui/ProfileSection'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import type { LecturerUser, Publication, ResearchProject } from 'models'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { usePatchLecturerMutation } from '../../../../services/userApi'

function LecturerProfileEdit({ lecturer }: { lecturer: LecturerUser }) {
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Hồ sơ', path: '/profile' }, { label: 'Chỉnh sửa' }])
	const [form, setForm] = useState(lecturer)
	const [expandAll, setExpandAll] = useState(false)
	const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
		basic: true,
		intro: false,
		avatar: false,
		expertise: false,
		researchInterests: false,
		publications: false,
		projects: false,
		completedThesis: false
	})
	const navigate = useNavigate()
	const [patchLecturer, { isLoading }] = usePatchLecturerMutation()

	const toggleSection = (key: string) => {
		if (expandAll) return
		setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
	}

	// --- expertise ---
	const addExpertise = () => setForm((prev) => ({ ...prev, expertise: [...prev.expertise, ''] }))
	const updateExpertise = (idx: number, value: string) => {
		const newExpertise = [...form.expertise]
		newExpertise[idx] = value
		setForm((prev) => ({ ...prev, expertise: newExpertise }))
	}
	const removeExpertise = (idx: number) =>
		setForm((prev) => ({ ...prev, expertise: prev.expertise.filter((_, i) => i !== idx) }))

	// --- researchInterests ---
	const addResearchInterests = () =>
		setForm((prev) => ({
			...prev,
			researchInterests: [...prev.researchInterests, '']
		}))

	const updateResearchInterests = (idx: number, value: string) =>
		setForm((prev) => {
			const newResearchInterests = [...prev.researchInterests]
			newResearchInterests[idx] = value
			return { ...prev, researchInterests: newResearchInterests }
		})

	const removeResearchInterests = (idx: number) =>
		setForm((prev) => ({
			...prev,
			researchInterests: prev.researchInterests.filter((_, i) => i !== idx)
		}))

	// --- projects ---
	const addProject = () =>
		setForm((prev) => ({
			...prev,
			projects: [...prev.projects, { title: '', duration: '', funding: '', role: '' }]
		}))
	const updateProject = (index: number, updated: ResearchProject) =>
		setForm((prev) => ({
			...prev,
			projects: prev.projects.map((p, i) => (i === index ? updated : p))
		}))
	const removeProject = (index: number) =>
		setForm((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }))

	// --- publications ---
	const addPublications = () =>
		setForm((prev) => ({
			...prev,
			publications: [...prev.publications, { title: '', journal: '', year: '', type: '', citations: 0, conference: '' }]
		}))
	const updatePublications = (index: number, updated: Publication) =>
		setForm((prev) => ({
			...prev,
			publications: prev.publications.map((p, i) => (i === index ? updated : p))
		}))
	const removePublications = (index: number) =>
		setForm((prev) => ({ ...prev, publications: prev.publications.filter((_, i) => i !== index) }))

	// --- handle field change ---
	const handleFieldChange = (field: string, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }))
	}
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		console.log('Submit data:', form)
		try {
			await patchLecturer({ id: form.id, body: form }).unwrap()
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
					label='Trường'
					value={form.department}
					onChange={(e) => handleFieldChange('department', e.target.value)}
					variant='medium'
					readOnly
				/>
				<ProfileField
					label='Khoa'
					value={form.faculty}
					onChange={(e) => handleFieldChange('faculty', e.target.value)}
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
					<img src={form.avatar} alt='Avatar' className='h-20 w-20 rounded-full border object-cover' />
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
					value={form.bio}
					onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
					variant='large'
				/>
			</ProfileSection>

			{/* Expertise */}
			<ProfileSection
				title='Chuyên'
				isOpen={expandAll || openSections.expertise}
				onToggle={() => toggleSection('expertise')}
			>
				{form.expertise.map((expertise, idx) => (
					<div key={idx} className='flex items-center gap-4'>
						<div className='flex-1'>
							<ProfileField
								label={`Kỹ năng ${idx + 1}`}
								value={expertise}
								onChange={(e) => updateExpertise(idx, e.target.value)}
								variant='medium'
							/>
						</div>
						<button
							type='button'
							onClick={() => removeExpertise(idx)}
							className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200'
						>
							X
						</button>
					</div>
				))}
				<button type='button' onClick={addExpertise} className='text-blue-500'>
					+ Thêm
				</button>
			</ProfileSection>

			{/* Research Interests */}
			<ProfileSection
				title='Hướng nghiên cứu quan tâm'
				isOpen={expandAll || openSections.interests}
				onToggle={() => toggleSection('interests')}
			>
				{form.researchInterests.map((interest, idx) => (
					<div key={idx} className='flex items-center gap-4'>
						<div className='flex-1'>
							<ProfileField
								label={`Quan tâm ${idx + 1}`}
								value={interest}
								onChange={(e) => updateResearchInterests(idx, e.target.value)}
								variant='medium'
							/>
						</div>
						<button
							type='button'
							onClick={() => removeResearchInterests(idx)}
							className='mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200'
						>
							X
						</button>
					</div>
				))}
				<button type='button' onClick={addResearchInterests} className='text-blue-500'>
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
					{form.projects.map((project, index) => (
						<div key={index} className='rounded-lg border bg-white p-4 shadow-sm'>
							<div className='mb-2 flex items-center justify-between'>
								<h4 className='text-lg font-semibold'>{project.title || `Dự án ${index + 1}`}</h4>
								<button
									onClick={() => removeProject(index)}
									className='text-sm text-red-500 hover:underline'
								>
									Xóa
								</button>
							</div>

							<ProfileField
								label='Tên dự án'
								value={project.title}
								onChange={(e) => updateProject(index, { ...project, title: e.target.value })}
								variant='large'
								orientation='column'
							/>

							<ProfileField
								label='Thời gian'
								value={project.duration}
								onChange={(e) => updateProject(index, { ...project, duration: e.target.value })}
								variant='large'
								orientation='column'
							/>

							<ProfileField
								label='Tài trợ (nếu có)'
								value={project.funding}
								onChange={(e) =>
									updateProject(index, {
										...project,
										funding: e.target.value
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

			{/* Publications */}
			<ProfileSection
				title='Công trình nghiên cứu'
				isOpen={expandAll || openSections.publications}
				onToggle={() => toggleSection('publications')}
			>
				<div className='space-y-4'>
					{form.publications.map((publication, index) => (
						<div key={index} className='rounded-lg border bg-white p-4 shadow-sm'>
							<div className='mb-2 flex items-center justify-between'>
								<h4 className='text-lg font-semibold'>{publication.title || `Dự án ${index + 1}`}</h4>
								<button
									onClick={() => removePublications(index)}
									className='text-sm text-red-500 hover:underline'
								>
									Xóa
								</button>
							</div>

							<ProfileField
								label='Tên dự án'
								value={publication.title}
								onChange={(e) => updatePublications(index, { ...publication, title: e.target.value })}
								variant='large'
								orientation='column'
							/>

							<ProfileField
								label='Năm'
								value={publication.year}
								onChange={(e) => updatePublications(index, { ...publication, year: e.target.value })}
								variant='large'
								orientation='column'
							/>

							<ProfileField
								label='Loại'
								value={publication.type}
								onChange={(e) =>
									updatePublications(index, {
										...publication,
										type: e.target.value
									})
								}
								variant='medium'
								orientation='column'
							/>
						</div>
					))}
					<button onClick={addPublications} className='mt-2 rounded-lg bg-primary px-4 py-2 text-white'>
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

export default LecturerProfileEdit
