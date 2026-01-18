import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { DescriptionOptimizer } from './components/DescriptionOptimizer'
import { toast } from '@/hooks/use-toast'
import { Save, X, Link, Plus, FileText, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'

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

function CreateTopic({
	periodId,
	refetchDraftTopics,
	refetchSubmittedTopics
}: {
	periodId?: string
	refetchDraftTopics?: () => void
	refetchSubmittedTopics?: () => void
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
	//File
	// Handle file section
	const [fileNames, setFileNames] = useState<string[]>([])
	// Fields
	const [selectedFields, setSelectedFields] = useState<GetFieldNameReponseDto[]>([])
	// Co-supervisors
	const [selectedCoSupervisors, setSelectedCoSupervisors] = useState<ResponseMiniLecturerDto[]>([])
	// Students
	const [selectedStudents, setSelectedStudents] = useState<ResponseMiniStudentDto[]>([])
	// Requirements
	const [selectedRequirements, setSelectedRequirements] = useState<GetRequirementNameReponseDto[]>([])
	//Lấy danh sách các ngành dựa theo khoa của giảng viên
	// lấy danh sách các major cùng thuộc một khoa với đề tài
	const { data: majorsOptions } = useGetMajorsQuery({ page: 1, limit: 0 })
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
			setAllowManualApproval(false)
		}
	}, [successCreateTopic])

	// Reference links
	const [referenceLinks, setReferenceLinks] = useState<Array<{ id: string; url: string }>>([])
	const [linkInput, setLinkInput] = useState('')

	// Reference link handlers
	const isValidUrl = (urlString: string) => {
		try {
			new URL(urlString)
			return true
		} catch {
			return false
		}
	}

	//Tải lên nhiều file
	const [uploadFiles, { isLoading: isUploading }] = useLecturerUploadFilesMutation()

	//handle save file
	// const handleSaveManyFiles = async () => {
	// 	await Promise.all([
	// 		selectedFiles.length > 0 ? uploadFiles({ topicId: topicId, files: selectedFiles }).unwrap() : null
	// 	])
	// 	toast({ title: 'Thành công', description: 'Cập nhật tài liệu thành công' })
	// 	setSelectedFiles([])
	// 	setFileNames([])

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

		// Debug log
		console.log('🔍 DEBUG CreateTopic (OLD) - allowManualApproval:', {
			topicType,
			stateValue: allowManualApproval,
			willSend: topicType === 'scientific_research' ? true : allowManualApproval
		})

		const newTopic: CreateTopicPayload = {
			titleVN: titleVN,
			titleEng: titleEng,
			description: description,
			type: topicType,
			majorId: selectedMajor?._id,
			maxStudents: maxStudents,
			periodId: periodId ? periodId : undefined, // nếu nộp luôn thì periodId còn không thì undefined
			currentStatus: periodId ? 'submitted' : 'draft',
			currentPhase: periodId ? 'submit_topic' : 'empty',
			fieldIds: selectedFields.map((field) => field._id),
			requirementIds: selectedRequirements.map((req) => req._id),
			studentIds: selectedStudents.map((stu) => stu._id),
			lecturerIds: selectedCoSupervisors.map((lec) => lec._id),
			allowManualApproval: topicType === 'scientific_research' ? true : allowManualApproval
		}

		console.log('📤 Payload CreateTopic (OLD):', newTopic)

		createTopic({
			topicData: newTopic,
			files: selectedFiles
		})
		refetchDraftTopics?.()

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
		toast({
			title: 'Đã hủy',
			description: 'Thông tin đã được xóa'
		})
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const filesArr = Array.from(e.target.files)
			// Cộng dồn file đã chọn trước đó
			for (let i = 0; i < filesArr.length; i++) {
				if (selectedFiles.findIndex((f) => f.name === filesArr[i].name) !== -1) {
					setErrorMessage(`File "${filesArr[i].name}" đã được chọn hoặc đã tồn tại.`)
					return
				}
			}
			setSelectedFiles((prev) => [...prev, ...filesArr])
			setFileNames((prev) => [...prev, ...filesArr.map((f) => f.name)])
			setErrorMessage(null)
		}
	}
	return (
		<div className='mx-10 h-full w-full pt-2'>
			<div className='mx-auto h-full'>
				<div className='flex h-full flex-col rounded-2xl border border-border bg-card p-6 pt-6 shadow-lg'>
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
							{majorsOptions && majorsOptions.data && (
								<select
									value={selectedMajor?._id ?? ''}
									onChange={(e) =>
										setSelectedMajor(
											majorsOptions.data.find((major) => major._id === e.target.value) ?? null
										)
									}
									className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2 font-[5px]'
								>
									<option value='' disabled>
										Chọn ngành...
									</option>
									{majorsOptions?.data.map((major) => (
										<option key={major._id} value={major._id}>
											{major.name}
										</option>
									))}
								</select>
							)}
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
									<SelectValue placeholder='Chọn loại đề tài...' defaultValue={'thesis'} />
								</SelectTrigger>
								<SelectContent className='bg-popover'>
									<SelectItem value='thesis'>Khóa luận tốt nghiệp</SelectItem>
									<SelectItem value='scientific_research'>Nghiên cứu khoa học</SelectItem>
								</SelectContent>
							</Select>
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

						{/* Lĩnh vực */}
						<FieldsContainer selectedFields={selectedFields} onSelectionChange={setSelectedFields} />
						{/* Requirements */}
						<RequirementContainer
							selectedRequirements={selectedRequirements}
							onSelectionChange={setSelectedRequirements}
						/>

						{/* Description */}
						<div className='col-span-2 space-y-2'>
							<div className='flex items-center gap-2'>
								<Label htmlFor='description' className='text-base font-semibold'>
									Mô tả đề tài <span className='text-destructive'>*</span>
								</Label>
								<DescriptionOptimizer currentDescription={description} onOptimize={setDescription} />
							</div>

							<div className='flex gap-2'>
								<div className='w-full'>
									<RichTextEditor
										value={description}
										onChange={(data) => setDescription(data)}
										placeholder='Nhập mô tả chi tiết về đề tài...'
									/>
								</div>
							</div>
						</div>

						{/* Co-supervisors */}
						<CoSupervisorContainer
							selectedCoSupervisors={selectedCoSupervisors}
							onSelectionChange={setSelectedCoSupervisors}
						/>

						{/* Student */}
						<StudentContainer
							selectedStudents={selectedStudents}
							onSelectionChange={setSelectedStudents}
							maxStudents={maxStudents}
							setMaxStudents={setMaxStudents}
						/>

						{/* Tài liệu tham khảo*/}
						<div className='flex flex-col gap-2'>
							<span className='text-lg font-medium'>Tài liệu tham khảo</span>
							{/* Nút tải lên file */}
							<div className='mb-4 ml-4 flex flex-col gap-2'>
								<div className='flex w-full gap-4'>
									<input
										type='file'
										multiple
										onChange={handleFileChange}
										className='rounded border px-2 py-1'
										disabled={isUploading}
									/>
								</div>
								{/* Hiển thị file đã chọn */}

								{selectedFiles.length > 0 && (
									<>
										<div className='mt-2 flex flex-col gap-2'>
											{selectedFiles.map((file, idx) => (
												<div key={file.name + idx} className='flex items-center gap-2'>
													<input
														type='text'
														value={fileNames[idx]}
														onChange={(e) => {
															const newName = e.target.value.trim()
															// Kiểm tra trùng tên
															const isDuplicate = fileNames.some(
																(name, i) => i !== idx && name === newName
															)
															if (isDuplicate) {
																setErrorMessage(`Tên file "${newName}" bị trùng.`)
																return
															}
															const newNames = [...fileNames]
															newNames[idx] = newName
															setFileNames(newNames)
														}}
														className='w-1/2 rounded border px-2 py-1'
													/>
													<span className='text-[13px] font-normal text-gray-400'>
														{formatFileSize(file.size)}
													</span>

													<Button
														variant='outline'
														size='sm'
														onClick={() => {
															setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))
															setFileNames(fileNames.filter((_, i) => i !== idx))
														}}
													>
														<X className='h-4 w-4' />
													</Button>
												</div>
											))}
										</div>
									</>
								)}
								{errorMessage && <p className='text-sm text-red-600'>{errorMessage}</p>}
							</div>
						</div>

						{/* Allow Manual Approval */}
						<div className='col-span-2 flex items-center gap-2'>
							<input
								type='checkbox'
								disabled={topicType === 'scientific_research'}
								checked={allowManualApproval || topicType === 'scientific_research'}
								onChange={(e) => setAllowManualApproval(e.target.checked)}
								id='allow-manual-approval'
								className='h-4 w-4'
							/>
							<Label htmlFor='allow-manual-approval' className='text-base font-semibold'>
								Sinh viên đăng ký phải được xét duyệt{' '}
								<span className='text-sm text-red-600'>
									{topicType === 'scientific_research' ? '(bắt buộc)' : ''}
								</span>
							</Label>
						</div>

						{/* Action Buttons */}
						<div className='col-span-2 flex gap-3 border-t border-border pt-6'>
							{periodId ? (
								<div className='flex flex-col items-center justify-center gap-1'>
									<Button
										disabled={loadingCreateTopic}
										onClick={() => {
											handleSave(periodId)
											refetchSubmittedTopics?.()
										}}
										variant={'outline_gray'}
									>
										<Save className='mr-2 h-4 w-4' />
										Lưu và đăng đề tài
									</Button>
								</div>
							) : (
								<Button
									disabled={loadingCreateTopic}
									onClick={() => handleSave()}
									className='hover:bg-primary-dark flex-1 bg-primary transition-colors'
								>
									<Save className='mr-2 h-4 w-4' />
									Lưu đề tài
								</Button>
							)}

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
