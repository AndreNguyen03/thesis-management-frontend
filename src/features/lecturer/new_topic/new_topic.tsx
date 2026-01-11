/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { AIGenerator as AITitleGenerator } from './AIGenerator'
import type { ApplyGeneratedResponse, GeneratedSuggestionWithMatches } from '@/models/chatbot-ai.model'
import { SuggestionPanel } from './SuggestionPanel'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription
} from '@/components/ui/Dialog'
import { useGetFieldsQuery } from '@/services/fieldApi'
import { useGetRequirementsQuery } from '@/services/requirementApi'
import { useApplyGeneratedTopicMutation } from '@/services/chatbotApi'

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

	// AI Title Generator Handlers

	type TitleSuggestion = GeneratedSuggestionWithMatches

	type DraftStatus = 'idle' | 'saving' | 'saved' | 'error'

	const [isGenerating, setIsGenerating] = useState(false)
	const [showPreview, setShowPreview] = useState(false)
	const [draftStatus, setDraftStatus] = useState<DraftStatus>('idle')
	const [lastSaved, setLastSaved] = useState<Date | undefined>()
	const [suggestions, setSuggestions] = useState<TitleSuggestion[]>([])

	// fields & requirements data for mapping
	const { data: fieldsResp } = useGetFieldsQuery({ page: 1, limit: 0 })
	const allFields = useMemo(() => fieldsResp?.data ?? [], [fieldsResp?.data])
	const { data: reqResp } = useGetRequirementsQuery({ page: 1, limit: 0 })
	const allRequirements = useMemo(() => reqResp?.data ?? [], [reqResp?.data])
	const [applyGeneratedTopic] = useApplyGeneratedTopicMutation()

	// Form state
	const [details, setDetails] = useState('')
	const [tags, setTags] = useState<string[]>([])

	// Auto-save draft
	useEffect(() => {
		const timer = setTimeout(() => {
			if (titleVN || details) {
				setDraftStatus('saving')
				setTimeout(() => {
					setDraftStatus('saved')
					setLastSaved(new Date())
				}, 800)
			}
		}, 2000)

		return () => clearTimeout(timer)
	}, [titleVN, titleEng, details, tags])

	const handleGenerateTitles = useCallback(
		async (titles: TitleSuggestion[]) => {
			setIsGenerating(true)
			try {
				// map incoming suggestions to find existing fields/requirements
				const mapped = titles.map((t) => {
					const kwsFields = (t.keywords?.fields ?? []) as string[]
					const kwsReqs = (t.keywords?.requirements ?? []) as string[]

					const candidateFields: Array<{ id: string; name: string }> = []
					const missingFields: string[] = []
					for (const kw of kwsFields) {
						const found = allFields.find((f) => f.name.toLowerCase().includes(kw.toLowerCase()))
						if (found) candidateFields.push({ id: found._id, name: found.name })
						else if (kw) missingFields.push(kw)
					}

					const candidateRequirements: Array<{ id: string; name: string }> = []
					const missingRequirements: string[] = []
					for (const kw of kwsReqs) {
						const found = allRequirements.find((r) => r.name.toLowerCase().includes(kw.toLowerCase()))
						if (found) candidateRequirements.push({ id: found._id, name: found.name })
						else if (kw) missingRequirements.push(kw)
					}

					return {
						...t,
						candidateFields,
						missingFields,
						candidateRequirements,
						missingRequirements
					}
				})

				setSuggestions(mapped)
			} catch (err: any) {
				console.error('map suggestions failed', err)
				toast({
					title: 'Lỗi xử lý gợi ý',
					description: err?.message ?? 'Không thể xử lý gợi ý AI',
					variant: 'destructive'
				})
			} finally {
				setIsGenerating(false)
			}
		},
		[allFields, allRequirements]
	)

	const [confirmOpen, setConfirmOpen] = useState(false)
	const [pendingSuggestion, setPendingSuggestion] = useState<TitleSuggestion | null>(null)
	const [isApplying, setIsApplying] = useState(false)

	const applyConfirmed = async (suggestion: TitleSuggestion) => {
		setIsApplying(true)
		try {
			// set titles and description
			setTitleVN(suggestion.vn)
			setTitleEng(suggestion.en)
			if (suggestion.description) setDescription(suggestion.description)

			// collect existing ids
			const fieldIds: string[] = suggestion.candidateFields?.map((f) => f.id) ?? []
			const requirementIds: string[] = suggestion.candidateRequirements?.map((r) => r.id) ?? []



            let resp: ApplyGeneratedResponse = { createdFields: [], createdRequirements: [] }

			// create missing via backend batch endpoint
			if ((suggestion.missingFields?.length ?? 0) + (suggestion.missingRequirements?.length ?? 0) > 0) {
				try {
					resp = await applyGeneratedTopic({
						missingFields: suggestion.missingFields ?? [],
						missingRequirements: suggestion.missingRequirements ?? []
					}).unwrap()

					const createdFields = resp.createdFields ?? []
					const createdRequirements = resp.createdRequirements ?? []

					for (const f of createdFields) {
						fieldIds.push(f._id)
					}

					for (const r of createdRequirements) {
						requirementIds.push(r._id)
					}
				} catch (err) {
					console.error('applyGeneratedTopic failed', err)
					toast({ title: 'Lỗi', description: 'Tạo mục mới thất bại', variant: 'destructive' })
				}
			}

			// update selected fields/requirements in form
			// prepare created DTOs to add to selection (created items may not be present in allFields/allRequirements yet)
			const createdFieldDtos: GetFieldNameReponseDto[] = (resp?.createdFields ?? []).map((f: any) => ({
				_id: f._id,
				name: f.name,
				slug: f.slug
			}))

			const createdReqDtos: GetRequirementNameReponseDto[] = (resp?.createdRequirements ?? []).map((r: any) => ({
				_id: r._id,
				name: r.name,
				slug: r.slug
			}))

			const newSelectedFields = [
				...selectedFields,
				...(fieldIds
					.map((id) => allFields.find((f) => f._id === id))
					.filter(Boolean) as GetFieldNameReponseDto[]),
				...createdFieldDtos
			]
			setSelectedFields(newSelectedFields)

			const newSelectedReqs = [
				...selectedRequirements,
				...(requirementIds
					.map((id) => allRequirements.find((r) => r._id === id))
					.filter(Boolean) as GetRequirementNameReponseDto[]),
				...createdReqDtos
			]
			setSelectedRequirements(newSelectedReqs)
		} finally {
			setIsApplying(false)
		}
	}

	const handleApplySuggestion = (suggestion: TitleSuggestion & { createMissing?: boolean }) => {
		const hasMissing =
			(suggestion.missingFields && suggestion.missingFields.length > 0) ||
			(suggestion.missingRequirements && suggestion.missingRequirements.length > 0)
		if (suggestion.createMissing && hasMissing) {
			setPendingSuggestion(suggestion)
			setConfirmOpen(true)
			return
		}

		// no confirm needed
		applyConfirmed(suggestion)
	}

	//

	return (
		<div className='grid w-full grid-cols-1 gap-6 px-6 pt-4 md:grid-cols-6'>
			<div className='md:col-span-4'>
				<div className='flex flex-col rounded-2xl border border-border bg-card p-4 pt-4 shadow-lg'>
					<div className='mb-6 flex items-start justify-between gap-4'>
						<div>
							<h1 className='mb-1 text-2xl font-extrabold tracking-tight text-foreground'>Tạo đề tài mới</h1>
							<p className='text-sm text-muted-foreground'>Điền thông tin cơ bản và chi tiết, sau đó lưu đề tài.</p>
						</div>
						<div className='text-sm text-muted-foreground'>
							<span className='inline-block rounded-md bg-muted/20 px-3 py-1'>Loại: {topicType}</span>
						</div>
					</div>

					<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Xác nhận tạo mục mới</DialogTitle>
								<DialogDescription>
									Những mục dưới đây sẽ được tự động tạo trong hệ thống. Bạn có muốn tiếp tục?
								</DialogDescription>
							</DialogHeader>

							<div className='mt-4 space-y-3'>
								{pendingSuggestion?.missingFields && pendingSuggestion.missingFields.length > 0 && (
									<div>
										<div className='font-medium'>Lĩnh vực sẽ tạo:</div>
										<ul className='list-inside list-disc'>
											{pendingSuggestion.missingFields.map((n, i) => (
												<li key={`f-${i}`}>{n}</li>
											))}
										</ul>
									</div>
								)}

								{pendingSuggestion?.missingRequirements &&
									pendingSuggestion.missingRequirements.length > 0 && (
										<div>
											<div className='font-medium'>Yêu cầu sẽ tạo:</div>
											<ul className='list-inside list-disc'>
												{pendingSuggestion.missingRequirements.map((n, i) => (
													<li key={`r-${i}`}>{n}</li>
												))}
											</ul>
										</div>
									)}
							</div>

							<DialogFooter className='mt-6'>
								<button
									className='rounded border px-3 py-1'
									onClick={() => {
										setConfirmOpen(false)
										setPendingSuggestion(null)
									}}
								>
									Hủy
								</button>
								<button
									className='ml-3 rounded bg-primary px-3 py-1 text-white disabled:opacity-60'
									disabled={isApplying}
									onClick={async () => {
										if (!pendingSuggestion) return
										setConfirmOpen(false)
										const s = pendingSuggestion
										setPendingSuggestion(null)
										await applyConfirmed(s)
									}}
								>
									{isApplying ? 'Đang tạo...' : 'Xác nhận và tạo'}
								</button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<div className='space-y-6 pr-2'>
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
					<div className='flex flex-col gap-3 border-t border-border pt-6 md:flex-row'>
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
				<div className='md:col-span-2'>
				{/* AI Generator Card */}
				<div className='card-elevated sticky top-6 rounded-xl border bg-card p-4'>
					<AITitleGenerator
						onGenerate={handleGenerateTitles}
						isLoading={isGenerating}
					/>

					<div className='mt-6 border-t pt-5'>
						<h4 className='mb-3 text-sm font-semibold text-foreground'>Gợi ý từ AI</h4>
						<div className='max-h-[420px] overflow-auto pr-1'>
							<SuggestionPanel
								suggestions={suggestions}
								onApply={handleApplySuggestion}
								onClear={() => setSuggestions([])}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export { CreateTopic2 }
