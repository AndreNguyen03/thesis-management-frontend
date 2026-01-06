import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'

import { DescriptionOptimizer } from './components/DescriptionOptimizer'
import { toast } from '@/hooks/use-toast'
import { Save, X, Link, Plus, FileText, Loader2, Upload, Trash2 } from 'lucide-react'

import { usePageBreadcrumb } from '@/hooks'
import { Button } from '@/components/ui'
import { useCreateTopicMutation, useLecturerUploadFilesMutation } from '@/services/topicApi'
import {
	type CreateTopicPayload,
	type TopicType,
	type GetFieldNameReponseDto,
	type GetRequirementNameReponseDto,
	type ResponseMiniLecturerDto,
	type ResponseMiniStudentDto
} from '@/models'

import FieldsContainer from '@/features/student/TopicList/detail/components/FieldsContainer'
import type { GetMajorMiniDto } from '@/models/major.model'
import RequirementContainer from '@/features/student/TopicList/detail/components/RequirementContainer'
import CoSupervisorContainer from '@/features/student/TopicList/detail/components/CoSupervisorContainer'
import StudentContainer from '@/features/student/TopicList/detail/components/StudentContainer'
import { useGetMajorsQuery } from '@/services/major'
import { formatFileSize } from '@/utils/format-file-size'
import RichTextEditor from '@/components/common/RichTextEditor'

function CreateTopic2({
	periodId,
	refetchDraftTopics,
	refetchSubmittedTopics,
	onBack
}: {
	periodId?: string
	refetchDraftTopics?: () => void
	refetchSubmittedTopics?: () => void
	onBack: () => void
}) {
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Đăng đề tài' }])
	const [createTopic, { isLoading: loadingCreateTopic, isSuccess: successCreateTopic, error: createTopicError }] =
		useCreateTopicMutation()

	// Form state
	const [titleVN, setTitleVN] = useState('')
	const [titleEng, setTitleEng] = useState('')
	const [topicType, setTopicType] = useState<TopicType>('thesis')
	const [description, setDescription] = useState('')
	const [maxStudents, setMaxStudents] = useState<number>(1)
	const [selectedMajor, setSelectedMajor] = useState<GetMajorMiniDto | null>(null)
	const [selectedFiles, setSelectedFiles] = useState<File[]>([])
	const [allowManualApproval, setAllowManualApproval] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	// File states
	const [fileNames, setFileNames] = useState<string[]>([])

	// Fields
	const [selectedFields, setSelectedFields] = useState<GetFieldNameReponseDto[]>([])

	// Co-supervisors
	const [selectedCoSupervisors, setSelectedCoSupervisors] = useState<ResponseMiniLecturerDto[]>([])

	// Students
	const [selectedStudents, setSelectedStudents] = useState<ResponseMiniStudentDto[]>([])

	// Requirements
	const [selectedRequirements, setSelectedRequirements] = useState<GetRequirementNameReponseDto[]>([])

	// Majors query
	const { data: majorsOptions } = useGetMajorsQuery({ page: 1, limit: 0 })

	// Upload mutation
	const [uploadFiles, { isLoading: isUploading }] = useLecturerUploadFilesMutation()

	useEffect(() => {
		if (successCreateTopic) {
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
			setSelectedMajor(null)
			setSelectedFiles([])
			setFileNames([])
			setErrorMessage(null)
			toast({ title: 'Thành công', description: 'Đề tài đã được lưu thành công!' })
		}
	}, [successCreateTopic])

	// Reference links
	const [referenceLinks, setReferenceLinks] = useState<Array<{ id: string; url: string; label?: string }>>([])
	const [linkInput, setLinkInput] = useState('')
	const [linkLabel, setLinkLabel] = useState('')

	// Reference link handlers
	const isValidUrl = (urlString: string) => {
		try {
			new URL(urlString)
			return true
		} catch {
			return false
		}
	}

	const addReferenceLink = () => {
		if (!linkInput.trim() || !isValidUrl(linkInput)) {
			toast({ title: 'Lỗi', description: 'URL không hợp lệ', variant: 'destructive' })
			return
		}
		const newLink = {
			id: Date.now().toString(),
			url: linkInput,
			label: linkLabel || linkInput
		}
		setReferenceLinks([...referenceLinks, newLink])
		setLinkInput('')
		setLinkLabel('')
	}

	const removeReferenceLink = (id: string) => {
		setReferenceLinks(referenceLinks.filter((link) => link.id !== id))
	}

	const handleSave = async (periodId?: string) => {
		if (!selectedMajor) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng chọn ít nhất một ngành',
				variant: 'destructive'
			})
			return
		}
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

		const newTopic: CreateTopicPayload = {
			titleVN: titleVN,
			titleEng: titleEng,
			description: description,
			type: topicType,
			majorId: selectedMajor._id,
			maxStudents: maxStudents,
			periodId: periodId ? periodId : undefined,
			currentStatus: periodId ? 'submitted' : 'draft',
			currentPhase: periodId ? 'submit_topic' : 'empty',
			fieldIds: selectedFields.map((field) => field._id),
			requirementIds: selectedRequirements.map((req) => req._id),
			studentIds: selectedStudents.map((stu) => stu._id),
			lecturerIds: selectedCoSupervisors.map((lec) => lec._id),
			allowManualApproval: allowManualApproval
		}

		createTopic({
			topicData: newTopic,
			files: selectedFiles
		})
		if (periodId) {
			refetchSubmittedTopics?.()
		} else {
			refetchDraftTopics?.()
		}
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
		setLinkLabel('')
		setMaxStudents(1)
		setSelectedMajor(null)
		setSelectedFiles([])
		setFileNames([])
		setErrorMessage(null)
		toast({
			title: 'Đã hủy',
			description: 'Thông tin đã được xóa'
		})
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const filesArr = Array.from(e.target.files)
			const newFiles: File[] = []
			const newNames: string[] = []

			for (const file of filesArr) {
				if (selectedFiles.find((f) => f.name === file.name)) {
					toast({ title: 'Lỗi', description: `File "${file.name}" đã được chọn`, variant: 'destructive' })
					continue
				}
				newFiles.push(file)
				newNames.push(file.name)
			}

			setSelectedFiles((prev) => [...prev, ...newFiles])
			setFileNames((prev) => [...prev, ...newNames])
			setErrorMessage(null)
		}
	}

	const removeFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
		setFileNames((prev) => prev.filter((_, i) => i !== index))
	}

	const updateFileName = (index: number, newName: string) => {
		if (newName.trim() === '') return
		const isDuplicate = fileNames.some((name, i) => i !== index && name.toLowerCase() === newName.toLowerCase())
		if (isDuplicate) {
			toast({ title: 'Lỗi', description: `Tên file "${newName}" bị trùng`, variant: 'destructive' })
			return
		}
		setFileNames((prev) => {
			const newNames = [...prev]
			newNames[index] = newName
			return newNames
		})
	}

	return (
		<div className='h-full w-full pt-2'>
			<div className='mx-auto h-full'>
				<div className='flex h-full flex-col rounded-2xl border border-border bg-card p-6 pt-6 shadow-lg'>
					<div className='mb-4'>
						<h1 className='mb-2 text-xl font-bold text-foreground'>Tạo đề tài mới</h1>
						<p className='text-sm text-muted-foreground'>
							Điền đầy đủ thông tin để tạo đề tài khóa luận/nghiên cứu. Các trường có dấu * là bắt buộc.
						</p>
					</div>

					<div className='flex-1 space-y-4 overflow-y-auto pr-2'>
						{/* Essential Basic Info - Always Visible */}
						<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
							{/* Major */}
							<div className='space-y-2'>
								<Label className='flex items-center gap-2 text-base font-semibold'>
									<FileText className='h-4 w-4' />
									Ngành <span className='text-destructive'>*</span>
								</Label>
								<Select
									value={selectedMajor?._id ?? ''}
									onValueChange={(value) =>
										setSelectedMajor(
											majorsOptions?.data.find((major) => major._id === value) ?? null
										)
									}
								>
									<SelectTrigger className='bg-background'>
										<SelectValue placeholder='Chọn ngành...' />
									</SelectTrigger>
									<SelectContent>
										{majorsOptions?.data.map((major) => (
											<SelectItem key={major._id} value={major._id}>
												{major.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Topic Type */}
							<div className='space-y-2'>
								<Label className='flex items-center gap-2 text-base font-semibold'>
									<FileText className='h-4 w-4' />
									Loại đề tài <span className='text-destructive'>*</span>
								</Label>
								<Select value={topicType} onValueChange={(value) => setTopicType(value as TopicType)}>
									<SelectTrigger className='bg-background'>
										<SelectValue placeholder='Chọn loại đề tài...' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='thesis'>Khóa luận tốt nghiệp</SelectItem>
										<SelectItem value='scientific_research'>Nghiên cứu khoa học</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* Title VN */}
							<div className='space-y-2'>
								<Label className='text-base font-semibold'>
									Tiêu đề đề tài (VN) <span className='text-destructive'>*</span>
								</Label>
								<Input
									placeholder='Nhập tiêu đề đề tài...'
									value={titleVN}
									onChange={(e) => setTitleVN(e.target.value)}
									className='bg-background'
								/>
							</div>

							{/* Title ENG */}
							<div className='space-y-2'>
								<Label className='text-base font-semibold'>
									Tiêu đề đề tài (ENG) <span className='text-destructive'>*</span>
								</Label>
								<Input
									placeholder='Enter topic title in English...'
									value={titleEng}
									onChange={(e) => setTitleEng(e.target.value)}
									className='bg-background'
								/>
							</div>
						</div>

						{/* Accordion for Optional Sections */}
						<Accordion type='multiple' className='w-full'>
							{/* Details Section */}
							<AccordionItem value='details'>
								<AccordionTrigger className='text-base font-semibold'>
									Chi tiết đề tài <span className='ml-1 text-destructive'>*</span>
								</AccordionTrigger>
								<AccordionContent className='space-y-4 pt-2'>
									<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
										<FieldsContainer
											selectedFields={selectedFields}
											onSelectionChange={setSelectedFields}
										/>
										<RequirementContainer
											selectedRequirements={selectedRequirements}
											onSelectionChange={setSelectedRequirements}
										/>
									</div>
									<div className='space-y-2'>
										<div className='flex items-center justify-between'>
											<Label className='text-base font-semibold'>
												Mô tả đề tài <span className='text-destructive'>*</span>
											</Label>
											<DescriptionOptimizer
												currentDescription={description}
												onOptimize={setDescription}
											/>
										</div>
										<RichTextEditor
											value={description}
											onChange={setDescription}
											placeholder='Nhập mô tả chi tiết về đề tài...'
										/>
									</div>
								</AccordionContent>
							</AccordionItem>

							{/* Participants Section */}
							<AccordionItem value='participants'>
								<AccordionTrigger className='text-base font-semibold'>
									Người tham gia (tùy chọn)
								</AccordionTrigger>
								<AccordionContent className='space-y-4 pt-2'>
									<CoSupervisorContainer
										selectedCoSupervisors={selectedCoSupervisors}
										onSelectionChange={setSelectedCoSupervisors}
									/>
									<StudentContainer
										selectedStudents={selectedStudents}
										onSelectionChange={setSelectedStudents}
										maxStudents={maxStudents}
										setMaxStudents={setMaxStudents}
									/>
								</AccordionContent>
							</AccordionItem>

							{/* References Section */}
							<AccordionItem value='references'>
								<AccordionTrigger className='text-base font-semibold'>
									Tài liệu tham khảo (tùy chọn)
								</AccordionTrigger>
								<AccordionContent className='space-y-4 pt-2'>
									{/* Reference Links */}
									<div className='space-y-3 rounded-lg border bg-muted/30 p-3'>
										<div className='flex flex-col gap-2 md:flex-row'>
											<Input
												placeholder='Nhập URL tài liệu...'
												value={linkInput}
												onChange={(e) => setLinkInput(e.target.value)}
												className='flex-1 bg-background'
											/>
											<Input
												placeholder='Nhãn (tùy chọn)'
												value={linkLabel}
												onChange={(e) => setLinkLabel(e.target.value)}
												className='flex-1 bg-background'
											/>
											<Button
												type='button'
												variant='outline'
												size='sm'
												onClick={addReferenceLink}
												disabled={!linkInput.trim() || !isValidUrl(linkInput)}
											>
												<Plus className='mr-1 h-4 w-4' />
												Thêm
											</Button>
										</div>

										{referenceLinks.length > 0 && (
											<div className='space-y-2'>
												{referenceLinks.map((link) => (
													<div
														key={link.id}
														className='flex items-center justify-between rounded-md bg-background p-2'
													>
														<div className='flex items-center gap-2'>
															<Link className='h-4 w-4 text-blue-500' />
															<a
																href={link.url}
																target='_blank'
																rel='noopener noreferrer'
																className='text-sm underline'
															>
																{link.label}
															</a>
														</div>
														<Button
															variant='ghost'
															size='sm'
															onClick={() => removeReferenceLink(link.id)}
														>
															<Trash2 className='h-4 w-4' />
														</Button>
													</div>
												))}
											</div>
										)}
									</div>

									{/* File Upload */}
									<div className='space-y-3 rounded-lg border bg-muted/30 p-3'>
										<Label className='flex items-center gap-2 text-base font-medium'>
											<Upload className='h-4 w-4' />
											Tải lên file đính kèm
										</Label>
										<div className='flex items-center gap-2'>
											<Input
												type='file'
												multiple
												onChange={handleFileChange}
												className='flex-1'
												disabled={isUploading}
											/>
											{isUploading && <Loader2 className='h-4 w-4 animate-spin' />}
										</div>

										{selectedFiles.length > 0 && (
											<div className='mt-4 space-y-2'>
												{selectedFiles.map((file, idx) => (
													<div
														key={file.name + idx}
														className='flex items-center gap-3 rounded-md bg-background p-2'
													>
														<Input
															value={fileNames[idx]}
															onChange={(e) => updateFileName(idx, e.target.value)}
															placeholder='Đổi tên file...'
															className='flex-1'
														/>
														<span className='text-xs text-muted-foreground'>
															{formatFileSize(file.size)}
														</span>
														<Button
															variant='outline'
															size='sm'
															onClick={() => removeFile(idx)}
														>
															<X className='h-4 w-4' />
														</Button>
													</div>
												))}
											</div>
										)}
										{errorMessage && <p className='text-sm text-destructive'>{errorMessage}</p>}
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>

						{/* Allow Manual Approval - Always Visible */}
						<div className='flex items-center space-x-2'>
							<Checkbox
								id='allow-manual-approval'
								checked={allowManualApproval || topicType === 'scientific_research'}
								onCheckedChange={(checked) => {
									if (topicType !== 'scientific_research') {
										setAllowManualApproval(!!checked)
									}
								}}
								disabled={topicType === 'scientific_research'}
							/>
							<Label
								htmlFor='allow-manual-approval'
								className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
							>
								Sinh viên đăng ký phải được xét duyệt{' '}
								<span className='text-sm text-destructive'>
									{topicType === 'scientific_research' ? '(bắt buộc)' : ''}
								</span>
							</Label>
						</div>
					</div>

					{/* Action Buttons */}
					<div className='flex gap-3 border-t border-border pt-6'>
						{periodId ? (
							<Button
								disabled={loadingCreateTopic}
								onClick={() => {
									handleSave(periodId)
									refetchSubmittedTopics?.()
								}}
								className='flex-1'
								variant='default'
							>
								<Save className='mr-2 h-4 w-4' />
								Lưu và đăng đề tài
							</Button>
						) : (
							<Button
								disabled={loadingCreateTopic}
								onClick={() => handleSave()}
								className='hover:bg-primary-dark flex-1 bg-primary'
							>
								<Save className='mr-2 h-4 w-4' />
								Lưu đề tài
							</Button>
						)}

						<Button onClick={handleCancel} variant='outline' className='flex-1'>
							<X className='mr-2 h-4 w-4' />
							Hủy bỏ
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export { CreateTopic2 }
