import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ComboboxWithAdd } from './components/ComboboxWithAdd'
import { Chip } from './components/Chip'
import { DescriptionOptimizer } from './components/DescriptionOptimizer'
import { toast } from '@/hooks/use-toast'
import { Save, X, Users, BookOpen, Tag, ListChecks, Link, Plus, FileText } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { usePageBreadcrumb } from '@/hooks'
import { Button } from '@/components/ui'
import { useCreateTopicMutation } from '@/services/topicApi'
import type { CreateTopicPayload, TopicType } from '@/models'
import type { ComboboxOption } from './components/interface/combo-option.interface'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetFieldsQuery } from '@/services/fieldApi'
import { useGetAllLecturersComboboxQuery } from '@/services/lecturerApi'
import { useGetStudentsComboboxQuery } from '@/services/studentApi'
import { useGetRequirementsQuery } from '@/services/requirementApi'

interface Student {
	id: string
	name: string
	hasExistingTopic?: boolean
}

function CreateTopic() {
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Đăng đề tài' }])
	const [createTopic, { isLoading }] = useCreateTopicMutation()
	// Form state
	const [titleVN, setTitleVN] = useState('')
	const [titleEng, setTitleEng] = useState('')
	const [topicType, setTopicType] = useState<TopicType>('thesis')
	const [description, setDescription] = useState('')
	const [maxStudents, setMaxStudents] = useState<number>(1)
	//handle search terms
	const [searchTermMajor, setSearchTermMajor] = useState('')
	const [searchTermField, setSearchTermField] = useState('')
	const [searchTermRequirement, setSearchTermRequirement] = useState('')
	const [searchTermLecturer, setSearchTermLecturer] = useState('')
	const [searchTermStudent, setSearchTermStudent] = useState('')

	//handle major
	const [queriesMajor, setQueriesMajor] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 5,
		search_by: 'fullName',
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: '',
		filter_by: ''
	})
	//handle students

	const [queriesStudent, setQueriesStudent] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 15,
		search_by: 'fullName',
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: '',
		filter_by: ''
	})
	const [queriesLecturer, setQueriesLecturer] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 15,
		search_by: 'fullName',
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: '',
		filter_by: ''
	})
	const [queriesField, setQueriesField] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 15,
		search_by: 'name',
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: '',
		filter_by: ''
	})
	const [queriesRequirement, setQueriesRequirement] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 15,
		search_by: 'name, description',
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: '',
		filter_by: ''
	})
	// handle next Page
	const nextPageMajor = () => {
		setQueriesMajor((prev: PaginationQueryParamsDto) => ({ ...prev, page: (prev?.page ?? 0) + 1 }))
	}
	const nextPageStudent = () => {
		setQueriesStudent((prev: PaginationQueryParamsDto) => ({ ...prev, page: (prev?.page ?? 0) + 1 }))
	}
	const nextPageLecturer = () => {
		setQueriesLecturer((prev: PaginationQueryParamsDto) => ({ ...prev, page: (prev?.page ?? 0) + 1 }))
	}
	const nextPageRequirement = () => {
		setQueriesRequirement((prev: PaginationQueryParamsDto) => ({ ...prev, page: (prev?.page ?? 0) + 1 }))
	}
	const nextPageField = () => {
		setQueriesField((prev: PaginationQueryParamsDto) => ({ ...prev, page: (prev?.page ?? 0) + 1 }))
	}

	// setQuerries functions
	const setQueriesMajorsSearch = (query: string) => {
		setQueriesMajor((prev) => ({ ...prev, query }))
	}
	const setQueriesFieldSearch = (query: string) => {
		setQueriesField((prev) => ({ ...prev, query }))
	}

	const setQueriesRequirementSearch = (query: string) => {
		setQueriesRequirement((prev) => ({ ...prev, query }))
	}

	const setQueriesStudentSearch = (query: string) => {
		setQueriesStudent((prev) => ({ ...prev, query }))
	}
	const setQueriesLecturertSearch = (query: string) => {
		setQueriesLecturer((prev) => ({ ...prev, query }))
	}
	// handle debounce changes
	const debounceMajorOnChange = useDebounce({ onChange: setQueriesMajorsSearch, duration: 300 })
	const debounceStudentOnChange = useDebounce({ onChange: setQueriesStudentSearch, duration: 300 })
	const debounceLecturerOnChange = useDebounce({ onChange: setQueriesLecturertSearch, duration: 300 })
	const debounceRequirementOnChange = useDebounce({ onChange: setQueriesRequirementSearch, duration: 300 })
	const debounceFieldOnChange = useDebounce({ onChange: setQueriesFieldSearch, duration: 300 })
	// handle onChangeSearch

	const onChangeMajortSearch = (val: string) => {
		setSearchTermMajor(val)
		debounceMajorOnChange(val)
	}
	const onChangeStudentSearch = (val: string) => {
		setSearchTermStudent(val)
		debounceStudentOnChange(val)
	}
	const onChangeLecturerSearch = (val: string) => {
		setSearchTermLecturer(val)
		debounceLecturerOnChange(val)
	}
	const onChangeRequirementSearch = (val: string) => {
		setSearchTermRequirement(val)
		debounceRequirementOnChange(val)
	}
	const onChangeFieldSearch = (val: string) => {
		setSearchTermField(val)

		debounceFieldOnChange(val)
	}

	//handle fetch data cho tất cả các combobox

	//major
	const { data: majors, refetch: refetchMajors, isLoading: isLoadingMajors } = useGetMajorsQuery(queriesMajor)
	const [selectedMajor, setSelectedMajor] = useState<string>('')

	// Fields
	const { data: fields, refetch: refetchFields, isLoading: isLoadingFields } = useGetFieldsQuery(queriesField)
	const [selectedFields, setSelectedFields] = useState<string[]>([])

	// Co-supervisors
	const { data: coSupervisors, isLoading: isLoadingCoSupervisors } = useGetAllLecturersComboboxQuery(queriesLecturer)
	const [selectedCoSupervisors, setSelectedCoSupervisors] = useState<string[]>([])

	// Students
	const { data: students, isLoading: isLoadingStudents } = useGetStudentsComboboxQuery(queriesStudent)
	const [selectedStudents, setSelectedStudents] = useState<string[]>([])
	// Requirements
	const {
		data: requirementsData,
		refetch: refetchRequirements,
		isLoading: isLoadingRequirements
	} = useGetRequirementsQuery(queriesRequirement)
	const [selectedRequirements, setSelectedRequirements] = useState<string[]>([])

	// Store options
	const [majorOptions, setMajorOptions] = useState<ComboboxOption[]>([])
	const [fieldOptions, setFieldOptions] = useState<ComboboxOption[]>([])
	const [requirementOptions, setRequirementOptions] = useState<ComboboxOption[]>([])
	const [studentOptions, setStudentOptions] = useState<ComboboxOption[]>([])
	const [lecturerOptions, setLecturerOptions] = useState<ComboboxOption[]>([])

	// handle wwhen search
	useEffect(() => {
		if (fields?.data && queriesField.query) {
			setFieldOptions(fields.data.map((f) => ({ value: f._id, label: f.name })))
		}
	}, [fields, queriesField.query])
	useEffect(() => {
		if (requirementsData?.data && queriesRequirement.query) {
			setRequirementOptions(requirementsData.data.map((r) => ({ value: r._id, label: r.name })))
		}
	}, [requirementsData, queriesRequirement.query])
	useEffect(() => {
		if (students?.data && queriesStudent.query) {
			setStudentOptions(students.data.map((s) => ({ value: s._id, label: s.fullName })))
		}
	}, [students, queriesStudent.query])
	useEffect(() => {
		if (coSupervisors?.data && queriesLecturer.query) {
			setLecturerOptions(coSupervisors.data.map((l) => ({ value: l._id, label: l.fullName })))
		}
	}, [coSupervisors, queriesLecturer.query])

	// store for first fetch
	useEffect(() => {
		if (fields?.data) {
			setFieldOptions((prev) => [
				...prev,
				...fields.data
					.filter((f) => !prev.some((opt) => opt.value === f._id))
					.map((f) => ({ value: f._id, label: f.name }))
			])
		}
	}, [fields, queriesField.page])

	useEffect(() => {
		if (requirementsData?.data) {
			setRequirementOptions((prev) => [
				...prev,
				...requirementsData.data
					.filter((r) => !prev.some((opt) => opt.value === r._id))
					.map((r) => ({ value: r._id, label: r.name }))
			])
		}
	}, [requirementsData, queriesRequirement.page])

	useEffect(() => {
		if (students?.data) {
			setStudentOptions((prev) => [
				...prev,
				...students.data
					.filter((s) => !prev.some((opt) => opt.value === s._id))
					.map((s) => ({ value: s._id, label: s.fullName }))
			])
		}
	}, [students, queriesStudent.page])

	useEffect(() => {
		if (coSupervisors?.data) {
			setLecturerOptions((prev) => [
				...prev,
				...coSupervisors.data
					.filter((l) => !prev.some((opt) => opt.value === l._id))
					.map((l) => ({ value: l._id, label: l.fullName }))
			])
		}
	}, [coSupervisors, queriesLecturer.page])
	// Reference links
	const [referenceLinks, setReferenceLinks] = useState<Array<{ id: string; url: string }>>([])
	const [linkInput, setLinkInput] = useState('')

	const [validationError, setValidationError] = useState<string>('')

	const handleSelectCoSupervisor = (value: string) => {
		if (!selectedCoSupervisors.includes(value)) {
			setSelectedCoSupervisors([...selectedCoSupervisors, value])
		}
	}

	const handleRemoveCoSupervisor = (value: string) => {
		setSelectedCoSupervisors(selectedCoSupervisors.filter((id) => id !== value))
	}

	const handleSelectStudent = (studentId: string) => {
		setValidationError('')

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
	// major handlers
	const handleAddMajor = (value: string) => {
		const newId = `major${Date.now()}`
		const newMajor = { value: newId, label: value }
		refetchMajors()
		setSelectedMajor(newId)
	}
	const handleSelectMajor = (value: string) => {
		setSelectedMajor(value)
	}
	const handleRemoveMajor = (value: string) => {
		setSelectedMajor('')
	}
	// Field handlers
	const handleAddField = (value: string) => {
		const newId = `field${Date.now()}`
		const newField = { value: newId, label: value }
		refetchFields()
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
		refetchRequirements()
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
		if (!titleVN.trim()) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng nhập tiêu đề đề tài',
				variant: 'destructive'
			})
			return
		}
		if (!titleEng.trim()) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng nhập tiêu đề đề tài bằng tiếng Anh',
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
		if (selectedRequirements.length === 0) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng chọn ít nhất một yêu cầu',
				variant: 'destructive'
			})
			return
		}
		if (!selectedMajor) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng chọn ít nhất một ngành',
				variant: 'destructive'
			})
			return
		}
		const currentPeriodId = localStorage.getItem('currentPeriodId')

		const newTopic: CreateTopicPayload = {
			titleVN: titleVN,
			titleEng: titleEng,
			description: description,
			type: topicType,
			majorId: selectedMajor,
			minStudents: 2,
			currentStatus: 'draft',
			currentPhase: 'empty',
			periodId: currentPeriodId ? currentPeriodId : undefined, // nếu nộp luôn thì periodId còn không thì undefined
			fieldIds: selectedFields,
			requirementIds: selectedRequirements,
			studentIds: selectedStudents,
			lecturerIds: selectedCoSupervisors
		}
		createTopic(newTopic)
		toast({
			title: 'Thành công',
			description: 'Đề tài đã được lưu thành công!'
		})
	}

	const handleCancel = () => {
		setTitleVN('')
		setTitleEng('')
		setTopicType('thesis')
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
		<div className='h-full pt-6'>
			<div className='mx-auto h-full'>
				<div className='flex h-full flex-col rounded-2xl border border-border bg-card p-8 pt-6 shadow-lg'>
					<div className='mb-4'>
						<h1 className='mb-2 text-xl font-bold text-foreground'>Tạo đề tài mới</h1>
						<p className='text-sm text-muted-foreground'>
							Điền đầy đủ thông tin để tạo đề tài khóa luận/nghiên cứu
						</p>
					</div>

					<div className='flex-1 space-y-6 overflow-y-auto pr-2'>
						{/* Major choosing */}
						<div className='col-span-2 space-y-2'>
							<Label htmlFor='topic-type' className='flex items-center gap-2 text-base font-semibold'>
								<FileText className='h-4 w-4' />
								Ngành <span className='text-destructive'>*</span>
							</Label>
							<ComboboxWithAdd
								onSearch={onChangeFieldSearch}
								searchTerm={searchTermMajor}
								options={majorOptions.filter((f) => f.value !== selectedMajor)}
								placeholder='Chọn hoặc thêm ngành...'
								onSelect={handleSelectMajor}
								onAdd={handleAddMajor}
								meta={majors?.meta!}
								onNextPage={nextPageMajor}
								isLoading={isLoadingMajors}
							/>
							{selectedMajor && (
								<div className='flex flex-wrap gap-2'>
									<Chip
										key={selectedMajor}
										label={majorOptions.filter((f) => f.value === selectedMajor)[0]?.label || ''}
										onRemove={() => handleRemoveMajor(selectedMajor)}
									/>
								</div>
							)}
						</div>

						{/* Title */}
						<div className='col-span-1 space-y-2'>
							<Label htmlFor='title' className='text-base font-semibold'>
								Tiêu đề đề tài <span className='text-destructive'>*</span>
							</Label>
							<Input
								id='title'
								placeholder='Nhập tiêu đề đề tài...'
								value={titleVN}
								onChange={(e) => setTitleVN(e.target.value)}
								className='border-input bg-background transition-colors focus:border-primary'
							/>
						</div>
						{/* Title Eng*/}
						<div className='col-span-1 space-y-2'>
							<Label htmlFor='title' className='text-base font-semibold'>
								Tiêu đề đề tài ENG <span className='text-destructive'>*</span>
							</Label>
							<Input
								id='title'
								placeholder='Nhập tiêu đề đề tài...'
								value={titleEng}
								onChange={(e) => setTitleEng(e.target.value)}
								className='border-input bg-background transition-colors focus:border-primary'
							/>
						</div>

						{/* Topic Type */}
						<div className='col-span-2 space-y-2'>
							<Label htmlFor='topic-type' className='flex items-center gap-2 text-base font-semibold'>
								<FileText className='h-4 w-4' />
								Loại đề tài <span className='text-destructive'>*</span>
							</Label>
							<Select
								value={topicType as string}
								onValueChange={(value) => setTopicType(value as TopicType)}
							>
								<SelectTrigger id='topic-type' className='bg-background'>
									<SelectValue placeholder='Chọn loại đề tài...' />
								</SelectTrigger>
								<SelectContent className='bg-popover'>
									<SelectItem value='thesis'>Khóa luận tốt nghiệp</SelectItem>
									<SelectItem value='scientific_research'>Nghiên cứu khoa học</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Fields */}
						<div className='col-span-2 space-y-3'>
							<Label className='flex items-center gap-2 text-base font-semibold'>
								<Tag className='h-4 w-4' />
								Lĩnh vực <span className='text-destructive'>*</span>
							</Label>
							<ComboboxWithAdd
								onSearch={onChangeFieldSearch}
								searchTerm={searchTermField}
								options={fieldOptions.filter((f) => !selectedFields.includes(f.value))}
								placeholder='Chọn hoặc thêm lĩnh vực...'
								onSelect={handleSelectField}
								onAdd={handleAddField}
								meta={fields?.meta!}
								onNextPage={nextPageField}
								isLoading={isLoadingFields}
							/>
							{selectedFields.length > 0 && (
								<div className='flex flex-wrap gap-2'>
									{selectedFields.map((id) => (
										<Chip
											key={id}
											label={fieldOptions.filter((f) => f.value === id)[0]?.label || ''}
											onRemove={() => handleRemoveField(id)}
										/>
									))}
								</div>
							)}
						</div>

						{/* Requirements */}
						<div className='col-span-2 space-y-3'>
							<Label className='flex items-center gap-2 text-base font-semibold'>
								<ListChecks className='h-4 w-4' />
								Yêu cầu kỹ thuật
							</Label>
							<ComboboxWithAdd
								onSearch={onChangeRequirementSearch}
								searchTerm={searchTermRequirement}
								options={requirementOptions.filter((r) => !selectedRequirements.includes(r.value))}
								placeholder='Chọn hoặc thêm yêu cầu...'
								onSelect={handleSelectRequirement}
								onAdd={handleAddRequirement}
								onNextPage={nextPageRequirement}
								meta={requirementsData?.meta!}
								isLoading={isLoadingRequirements}
							/>
							{selectedRequirements.length > 0 && (
								<div className='flex flex-wrap gap-2'>
									{selectedRequirements.map((id) => (
										<Chip
											key={id}
											label={requirementOptions.filter((r) => r.value === id)[0]?.label || ''}
											onRemove={() => handleRemoveRequirement(id)}
										/>
									))}
								</div>
							)}
						</div>

						{/* Description */}
						<div className='col-span-2 space-y-2'>
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
						<div className='col-span-2 space-y-3'>
							<Label className='flex items-center gap-2 text-base font-semibold'>
								<Users className='h-4 w-4' />
								Người đồng hướng dẫn
							</Label>
							<ComboboxWithAdd
								onSearch={onChangeLecturerSearch}
								searchTerm={searchTermLecturer}
								options={lecturerOptions.filter((s) => !selectedCoSupervisors.includes(s.value))}
								placeholder='Chọn hoặc thêm người đồng hướng dẫn...'
								onSelect={handleSelectCoSupervisor}
								meta={coSupervisors?.meta!}
								onNextPage={nextPageLecturer}
								isLoading={isLoadingCoSupervisors}
							/>
							{selectedCoSupervisors.length > 0 && (
								<div className='flex flex-wrap gap-2'>
									{selectedCoSupervisors.map((id) => (
										<Chip
											key={id}
											label={lecturerOptions.filter((s) => s.value === id)[0]?.label || ''}
											onRemove={() => handleRemoveCoSupervisor(id)}
										/>
									))}
								</div>
							)}
						</div>

						{/* Students */}
						<div className='col-span-2 space-y-3'>
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
										onSearch={onChangeStudentSearch}
										searchTerm={searchTermStudent}
										options={studentOptions.filter((s) => !selectedStudents.includes(s.value))}
										placeholder='Chọn hoặc thêm sinh viên...'
										onSelect={handleSelectStudent}
										disabled={selectedStudents.length >= maxStudents}
										meta={students?.meta!}
										onNextPage={nextPageStudent}
										isLoading={isLoadingStudents}
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
											label={students?.data.filter((s) => s._id === id)[0]?.fullName || ''}
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
						<div className='col-span-2 space-y-3'>
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
						<div className='col-span-2 flex gap-3 border-t border-border pt-6'>
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
