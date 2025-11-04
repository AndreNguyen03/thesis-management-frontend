import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ComboboxWithAdd, type ComboboxOption } from './components/ComboboxWithAdd'
import { Chip } from './components/Chip'
import { DescriptionOptimizer } from './components/DescriptionOptimizer'
import { toast } from '@/hooks/use-toast'
import { Save, X, Users, BookOpen, Tag, ListChecks, Link, Plus, FileText } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { usePageBreadcrumb } from '@/hooks'

interface Student {
	id: string
	name: string
	hasExistingTopic?: boolean
}

function CreateTopic() {
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Đăng đề tài' }])
	// Form state
	const [title, setTitle] = useState('')
	const [topicType, setTopicType] = useState('')
	const [description, setDescription] = useState('')
	const [maxStudents, setMaxStudents] = useState<number>(1)

	// Co-supervisors
	const [coSupervisors, setCoSupervisors] = useState<ComboboxOption[]>([
		{ value: 'supervisor1', label: 'TS. Nguyễn Văn A' },
		{ value: 'supervisor2', label: 'PGS. Trần Thị B' }
	])
	const [selectedCoSupervisors, setSelectedCoSupervisors] = useState<string[]>([])

	// Students
	const [students, setStudents] = useState<Student[]>([
		{ id: 'student1', name: 'Nguyễn Minh C', hasExistingTopic: false },
		{ id: 'student2', name: 'Lê Hoàng D', hasExistingTopic: true },
		{ id: 'student3', name: 'Phạm Thu E', hasExistingTopic: false }
	])
	const [selectedStudents, setSelectedStudents] = useState<string[]>([])

	// Fields
	const [fields, setFields] = useState<ComboboxOption[]>([
		{ value: 'ai', label: 'Trí tuệ nhân tạo' },
		{ value: 'web', label: 'Phát triển Web' },
		{ value: 'mobile', label: 'Ứng dụng di động' },
		{ value: 'data', label: 'Khoa học dữ liệu' }
	])
	const [selectedFields, setSelectedFields] = useState<string[]>([])

	// Requirements
	const [requirements, setRequirements] = useState<ComboboxOption[]>([
		{ value: 'react', label: 'React' },
		{ value: 'nodejs', label: 'Node.js' },
		{ value: 'python', label: 'Python' },
		{ value: 'ml', label: 'Machine Learning' }
	])
	const [selectedRequirements, setSelectedRequirements] = useState<string[]>([])

	// Reference links
	const [referenceLinks, setReferenceLinks] = useState<Array<{ id: string; url: string }>>([])
	const [linkInput, setLinkInput] = useState('')

	const [validationError, setValidationError] = useState<string>('')

	// Co-supervisor handlers
	const handleAddCoSupervisor = (value: string) => {
		const newId = `supervisor${Date.now()}`
		const newSupervisor = { value: newId, label: value }
		setCoSupervisors([...coSupervisors, newSupervisor])
		setSelectedCoSupervisors([...selectedCoSupervisors, newId])
	}

	const handleSelectCoSupervisor = (value: string) => {
		if (!selectedCoSupervisors.includes(value)) {
			setSelectedCoSupervisors([...selectedCoSupervisors, value])
		}
	}

	const handleRemoveCoSupervisor = (value: string) => {
		setSelectedCoSupervisors(selectedCoSupervisors.filter((id) => id !== value))
	}

	// Student handlers
	const handleAddStudent = (value: string) => {
		const newId = `student${Date.now()}`
		const newStudent: Student = { id: newId, name: value, hasExistingTopic: false }
		setStudents([...students, newStudent])
		handleSelectStudent(newId)
	}

	const handleSelectStudent = (studentId: string) => {
		setValidationError('')

		const student = students.find((s) => s.id === studentId)

		if (student?.hasExistingTopic) {
			setValidationError(`Sinh viên "${student.name}" đã có đề tài khác!`)
			return
		}

		if (selectedStudents.length >= maxStudents) {
			setValidationError(`Không thể thêm quá ${maxStudents} sinh viên!`)
			return
		}

		if (!selectedStudents.includes(studentId)) {
			setSelectedStudents([...selectedStudents, studentId])
		}
	}

	const handleRemoveStudent = (studentId: string) => {
		setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
		setValidationError('')
	}

	// Field handlers
	const handleAddField = (value: string) => {
		const newId = `field${Date.now()}`
		const newField = { value: newId, label: value }
		setFields([...fields, newField])
		setSelectedFields([...selectedFields, newId])
	}

	const handleSelectField = (value: string) => {
		if (!selectedFields.includes(value)) {
			setSelectedFields([...selectedFields, value])
		}
	}

	const handleRemoveField = (value: string) => {
		setSelectedFields(selectedFields.filter((id) => id !== value))
	}

	// Requirement handlers
	const handleAddRequirement = (value: string) => {
		const newId = `req${Date.now()}`
		const newReq = { value: newId, label: value }
		setRequirements([...requirements, newReq])
		setSelectedRequirements([...selectedRequirements, newId])
	}

	const handleSelectRequirement = (value: string) => {
		if (!selectedRequirements.includes(value)) {
			setSelectedRequirements([...selectedRequirements, value])
		}
	}

	const handleRemoveRequirement = (value: string) => {
		setSelectedRequirements(selectedRequirements.filter((id) => id !== value))
	}

	// Reference link handlers
	const isValidUrl = (urlString: string) => {
		try {
			new URL(urlString)
			return true
		} catch {
			return false
		}
	}

	const handleAddLink = () => {
		const trimmedLink = linkInput.trim()

		if (!trimmedLink) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng nhập link tài liệu',
				variant: 'destructive'
			})
			return
		}

		if (!isValidUrl(trimmedLink)) {
			toast({
				title: 'Lỗi',
				description: 'Link không hợp lệ. Vui lòng nhập URL đầy đủ (bao gồm http:// hoặc https://)',
				variant: 'destructive'
			})
			return
		}

		const newLink = {
			id: `link${Date.now()}`,
			url: trimmedLink
		}

		setReferenceLinks([...referenceLinks, newLink])
		setLinkInput('')

		toast({
			title: 'Thành công',
			description: 'Đã thêm link tham khảo'
		})
	}

	const handleRemoveLink = (id: string) => {
		setReferenceLinks(referenceLinks.filter((link) => link.id !== id))
	}

	const handleSave = () => {
		if (!title.trim()) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng nhập tiêu đề đề tài',
				variant: 'destructive'
			})
			return
		}

		if (!description.trim()) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng nhập mô tả đề tài',
				variant: 'destructive'
			})
			return
		}

		if (selectedFields.length === 0) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng chọn ít nhất một lĩnh vực',
				variant: 'destructive'
			})
			return
		}

		toast({
			title: 'Thành công',
			description: 'Đề tài đã được lưu thành công!'
		})
	}

	const handleCancel = () => {
		setTitle('')
		setTopicType('')
		setDescription('')
		setSelectedCoSupervisors([])
		setSelectedStudents([])
		setSelectedFields([])
		setSelectedRequirements([])
		setReferenceLinks([])
		setLinkInput('')
		setMaxStudents(1)
		setValidationError('')

		toast({
			title: 'Đã hủy',
			description: 'Thông tin đã được xóa'
		})
	}

	const getLabel = (items: ComboboxOption[] | Student[], id: string) => {
		const item = items.find((i) => ('value' in i ? i.value === id : i.id === id))
		return 'label' in item! ? item.label : (item as Student).name
	}

	return (
		<div className='min-h-screen bg-gradient-to-br'>
			<div className='mx-auto max-w-4xl'>
				<div className='rounded-2xl border border-border bg-card p-8 shadow-lg'>
					<div className='mb-8'>
						<h1 className='mb-2 text-3xl font-bold text-foreground'>Đăng đề tài mới</h1>
						<p className='text-muted-foreground'>Điền đầy đủ thông tin để tạo đề tài nghiên cứu</p>
					</div>

					<div className='space-y-6'>
						{/* Title */}
						<div className='space-y-2'>
							<Label htmlFor='title' className='text-base font-semibold'>
								Tiêu đề đề tài <span className='text-destructive'>*</span>
							</Label>
							<Input
								id='title'
								placeholder='Nhập tiêu đề đề tài...'
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className='border-input bg-background transition-colors focus:border-primary'
							/>
						</div>

						{/* Topic Type */}
						<div className='space-y-2'>
							<Label htmlFor='topic-type' className='flex items-center gap-2 text-base font-semibold'>
								<FileText className='h-4 w-4' />
								Loại đề tài <span className='text-destructive'>*</span>
							</Label>
							<Select value={topicType} onValueChange={setTopicType}>
								<SelectTrigger id='topic-type' className='bg-background'>
									<SelectValue placeholder='Chọn loại đề tài...' />
								</SelectTrigger>
								<SelectContent className='bg-popover'>
									<SelectItem value='da1'>Đồ án 1</SelectItem>
									<SelectItem value='da2'>Đồ án 2</SelectItem>
									<SelectItem value='kltn'>Khóa luận tốt nghiệp</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Fields */}
						<div className='space-y-3'>
							<Label className='flex items-center gap-2 text-base font-semibold'>
								<Tag className='h-4 w-4' />
								Lĩnh vực <span className='text-destructive'>*</span>
							</Label>
							<ComboboxWithAdd
								options={fields.filter((f) => !selectedFields.includes(f.value))}
								placeholder='Chọn hoặc thêm lĩnh vực...'
								onSelect={handleSelectField}
								onAdd={handleAddField}
							/>
							{selectedFields.length > 0 && (
								<div className='flex flex-wrap gap-2'>
									{selectedFields.map((id) => (
										<Chip
											key={id}
											label={getLabel(fields, id)}
											onRemove={() => handleRemoveField(id)}
										/>
									))}
								</div>
							)}
						</div>

						{/* Requirements */}
						<div className='space-y-3'>
							<Label className='flex items-center gap-2 text-base font-semibold'>
								<ListChecks className='h-4 w-4' />
								Yêu cầu kỹ thuật
							</Label>
							<ComboboxWithAdd
								options={requirements.filter((r) => !selectedRequirements.includes(r.value))}
								placeholder='Chọn hoặc thêm yêu cầu...'
								onSelect={handleSelectRequirement}
								onAdd={handleAddRequirement}
							/>
							{selectedRequirements.length > 0 && (
								<div className='flex flex-wrap gap-2'>
									{selectedRequirements.map((id) => (
										<Chip
											key={id}
											label={getLabel(requirements, id)}
											onRemove={() => handleRemoveRequirement(id)}
										/>
									))}
								</div>
							)}
						</div>

						{/* Description */}
						<div className='space-y-2'>
							<Label htmlFor='description' className='text-base font-semibold'>
								Mô tả đề tài <span className='text-destructive'>*</span>
							</Label>
							<div className='flex gap-2'>
								<Textarea
									id='description'
									placeholder='Nhập mô tả chi tiết về đề tài (dựa trên lĩnh vực và yêu cầu kỹ thuật đã chọn)...'
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className='min-h-[150px] flex-1 resize-none border-input bg-background transition-colors focus:border-primary'
								/>
								<DescriptionOptimizer currentDescription={description} onOptimize={setDescription} />
							</div>
						</div>

						{/* Co-supervisors */}
						<div className='space-y-3'>
							<Label className='flex items-center gap-2 text-base font-semibold'>
								<Users className='h-4 w-4' />
								Người đồng hướng dẫn
							</Label>
							<ComboboxWithAdd
								options={coSupervisors.filter((s) => !selectedCoSupervisors.includes(s.value))}
								placeholder='Chọn hoặc thêm người đồng hướng dẫn...'
								onSelect={handleSelectCoSupervisor}
								onAdd={handleAddCoSupervisor}
							/>
							{selectedCoSupervisors.length > 0 && (
								<div className='flex flex-wrap gap-2'>
									{selectedCoSupervisors.map((id) => (
										<Chip
											key={id}
											label={getLabel(coSupervisors, id)}
											onRemove={() => handleRemoveCoSupervisor(id)}
										/>
									))}
								</div>
							)}
						</div>

						{/* Students */}
						<div className='space-y-3'>
							<Label className='flex items-center gap-2 text-base font-semibold'>
								<BookOpen className='h-4 w-4' />
								Sinh viên tham gia <span className='text-destructive'>*</span>
							</Label>

							<div className='flex items-end gap-3'>
								<div className='flex-1'>
									<Label htmlFor='max-students' className='mb-2 block text-sm'>
										Số lượng sinh viên tối đa
									</Label>
									<Select
										value={maxStudents.toString()}
										onValueChange={(value) => {
											setMaxStudents(parseInt(value))
											setValidationError('')
										}}
									>
										<SelectTrigger id='max-students' className='bg-background'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent className='bg-popover'>
											{[1, 2, 3, 4].map((num) => (
												<SelectItem key={num} value={num.toString()}>
													{num} sinh viên
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className='flex-1'>
									<ComboboxWithAdd
										options={students
											.filter((s) => !selectedStudents.includes(s.id))
											.map((s) => ({ value: s.id, label: s.name }))}
										placeholder='Chọn hoặc thêm sinh viên...'
										onSelect={handleSelectStudent}
										onAdd={handleAddStudent}
										disabled={selectedStudents.length >= maxStudents}
									/>
								</div>
							</div>

							{validationError && (
								<Alert variant='destructive'>
									<AlertCircle className='h-4 w-4' />
									<AlertTitle>Lỗi</AlertTitle>
									<AlertDescription>{validationError}</AlertDescription>
								</Alert>
							)}

							{selectedStudents.length > 0 && (
								<div className='flex flex-wrap gap-2'>
									{selectedStudents.map((id) => (
										<Chip
											key={id}
											label={getLabel(students, id)}
											onRemove={() => handleRemoveStudent(id)}
										/>
									))}
								</div>
							)}

							<p className='text-sm text-muted-foreground'>
								Đã chọn: {selectedStudents.length}/{maxStudents} sinh viên
							</p>
						</div>

						{/* Reference Links */}
						<div className='space-y-3'>
							<Label className='flex items-center gap-2 text-base font-semibold'>
								<Link className='h-4 w-4' />
								Link tài liệu tham khảo
							</Label>
							<div className='flex gap-2'>
								<Input
									placeholder='Nhập URL tài liệu (vd: https://example.com)...'
									value={linkInput}
									onChange={(e) => setLinkInput(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault()
											handleAddLink()
										}
									}}
									className='flex-1 border-input bg-background transition-colors focus:border-primary'
								/>
								<Button
									type='button'
									onClick={handleAddLink}
									variant='outline'
									className='transition-colors hover:bg-primary hover:text-primary-foreground'
								>
									<Plus className='h-4 w-4' />
								</Button>
							</div>
							{referenceLinks.length > 0 && (
								<div className='space-y-2'>
									{referenceLinks.map((link) => (
										<div
											key={link.id}
											className='group flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-3 transition-colors hover:border-primary/50'
										>
											<Link className='h-4 w-4 shrink-0 text-primary' />
											<a
												href={link.url}
												target='_blank'
												rel='noopener noreferrer'
												className='flex-1 truncate text-sm text-foreground transition-colors hover:text-primary'
											>
												{link.url}
											</a>
											<button
												onClick={() => handleRemoveLink(link.id)}
												className='shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
												aria-label='Xóa link'
											>
												<X className='h-4 w-4' />
											</button>
										</div>
									))}
								</div>
							)}
							<p className='text-xs text-muted-foreground'>
								Thêm các link tài liệu, paper, hoặc trang web tham khảo liên quan đến đề tài
							</p>
						</div>

						{/* Action Buttons */}
						<div className='flex gap-3 border-t border-border pt-6'>
							<Button
								onClick={handleSave}
								className='hover:bg-primary-dark flex-1 bg-primary transition-colors'
							>
								<Save className='mr-2 h-4 w-4' />
								Lưu đề tài
							</Button>
							<Button
								onClick={handleCancel}
								variant='outline'
								className='flex-1 transition-colors hover:border-destructive hover:bg-destructive/10 hover:text-destructive'
							>
								<X className='mr-2 h-4 w-4' />
								Hủy bỏ
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export { CreateTopic }
