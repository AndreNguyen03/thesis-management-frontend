/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import type { CreateTopicPayload } from '@/models/topic.model'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, X, Plus, Info, Upload, Sparkles, FileCheck } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'


import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui'
import { useDebounce } from '@/hooks'

interface TopicEditDialogProps {
	topic: CreateTopicPayload
	open: boolean
	onOpenChange: (open: boolean) => void
}

// const EXAMPLE_DESCRIPTION = `Ví dụ mô tả đề tài tốt:

// **Mục tiêu:**
// Xây dựng hệ thống quản lý sinh viên giúp nhà trường theo dõi điểm, lịch học, và thông tin cá nhân một cách hiệu quả.

// **Phạm vi:**
// - Module đăng nhập, phân quyền người dùng
// - Quản lý thông tin sinh viên, giảng viên
// - Tra cứu điểm, lịch học theo thời gian thực
// - Thống kê, báo cáo theo kỳ học

// **Kết quả mong đợi:**
// - Website responsive hoạt động trên mọi thiết bị
// - API RESTful đầy đủ tài liệu
// - Báo cáo đồ án hoàn chỉnh với phân tích yêu cầu, thiết kế hệ thống, và hướng phát triển`

interface Student {
	id: string
	name: string
	studentCode: string
}

export function TopicEditDialog({ topic, open, onOpenChange }: TopicEditDialogProps) {
	const { toast } = useToast()
	// form data
	const [formData, setFormData] = useState<CreateTopicPayload>(topic)

	// // requirement state
	const [skills, setSkills] = useState<string[]>(topic?.requirements || [])
	const [skillInput, setSkillInput] = useState('')

	// reference link state
	const [references, setReferences] = useState<{ name: string; url?: string }[]>(topic?.references || [])

	// confirmation dialog
	const [showConfirmation, setShowConfirmation] = useState(false)

	// // ai loading state
	const [aiLoading, setAiLoading] = useState<string | null>(null)

	// date state
	const [date, setDate] = useState<Date | undefined>(topic?.deadline ? new Date(topic.deadline) : undefined)
	const [openFieldCombo, setOpenFieldCombo] = useState(false)
	const [openSkillCombo, setOpenSkillCombo] = useState(false)

	// error state
	const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})

	// student query state
	const [studentQuery, setStudentQuery] = useState('')
	const [studentResults, setStudentResults] = useState<Student[]>([])
	const [selectedStudents, setSelectedStudents] = useState<Student[]>([])

	// lecturer query state
	const [searching, setSearching] = useState(false)

	// debounce query
	const debouncedQuery = useDebounce(studentQuery, 500) // debounce 500ms

	const [query, setQuery] = useState('')

	const filteredAdvisors = query
		? advisors.filter((advisor) => advisor.name.toLowerCase().includes(query.toLowerCase()))
		: advisors

	const addStudent = (student: Student) => {
		if (!selectedStudents.find((s) => s.studentCode === student.studentCode)) {
			const newList = [...selectedStudents, student]
			setSelectedStudents(newList)

			setFormData({
				title: formData.title || '',
				description: formData.description || '',
				type: formData.type || 'Đồ án',
				majorId: formData.majorId || '',
				departmentId: formData.departmentId || '',
				lecturerIds: formData.lecturerIds || [],
				maxStudents: formData.maxStudents || 1,
				studentIds: newList.map((s) => s.studentCode),
				coAdvisorIds: formData.coAdvisorIds || [],
				fileIds: formData.fileIds || [],
				deadline: formData.deadline,
				requirements: formData.requirements || [],
				references: formData.references || []
			})
		}
	}
	const removeStudent = (studentCode: string) => {
		const newList = selectedStudents.filter((s) => s.studentCode !== studentCode)
		setSelectedStudents(newList)
		setFormData({ ...formData, studentIds: newList.map((s) => s.studentCode) })
	}

	useEffect(() => {
		const fetchStudents = async () => {
			if (!debouncedQuery.trim()) {
				setStudentResults([])
				return
			}
			setSearching(true)
			try {
				// giả sử bạn có API GET /api/students?query=<mssv>
				const res = await fetch(`/api/students?query=${debouncedQuery}`)
				const data = await res.json()
				setStudentResults(data)
			} catch (err) {
				console.error(err)
			} finally {
				setSearching(false)
			}
		}
		fetchStudents()
	}, [debouncedQuery])

	const handleAddSkill = (skill?: string) => {
		const skillToAdd = skill || skillInput.trim()
		if (skillToAdd && !skills.includes(skillToAdd)) {
			setSkills([...skills, skillToAdd])
			setSkillInput('')
			setOpenSkillCombo(false)
		}
	}

	const handleRemoveSkill = (skill: string) => {
		setSkills(skills.filter((s) => s !== skill))
	}

	const handleAddReference = () => {
		setReferences([...references, { name: '' }])
	}

	const handleRemoveReference = (index: number) => {
		setReferences(references.filter((_, i) => i !== index))
	}

	const handleReferenceChange = (index: number, field: 'name' | 'url', value: string) => {
		const newRefs = [...references]
		newRefs[index] = { ...newRefs[index], [field]: value }
		setReferences(newRefs)
	}

	// // ví dụ dùng fetch tới backend AI endpoint
	const handleAIOptimizeDescription = async () => {
		if (!formData.title?.trim()) return toast({ title: 'Vui lòng nhập tiêu đề đề tài' })

		setAiLoading('optimize')
		try {
			const res = await fetch('/api/ai/optimize-description', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: formData.title,
					description: formData.description || ''
				})
			})
			const data = await res.json()
			setFormData({ ...formData, description: data.optimizedDescription })
			toast({ title: 'Đã tối ưu mô tả đề tài' })
		} catch {
			toast({ title: 'Lỗi khi tối ưu mô tả', variant: 'destructive' })
		} finally {
			setAiLoading(null)
		}
	}

	const handleAISuggestSkills = async () => {
		if (!formData.title?.trim()) return toast({ title: 'Vui lòng nhập tiêu đề đề tài' })

		setAiLoading('skills')
		try {
			const res = await fetch('/api/ai/suggest-skills', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: formData.title,
					description: formData.description || ''
				})
			})
			const data = await res.json()
			setFormData({ ...formData, requirements: data.skills })
			toast({ title: 'Đã gợi ý kỹ năng phù hợp' })
		} catch {
			toast({ title: 'Lỗi khi gợi ý kỹ năng', variant: 'destructive' })
		} finally {
			setAiLoading(null)
		}
	}

	const handleAICheckDuplicate = async () => {
		if (!formData.title?.trim()) return toast({ title: 'Vui lòng nhập tiêu đề đề tài' })

		setAiLoading('duplicate')
		try {
			const res = await fetch('/api/ai/check-duplicate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: formData.title,
					description: formData.description || ''
				})
			})
			const data = await res.json()
			if (data.similarTopics.length > 0)
				toast({
					title: 'Phát hiện đề tài tương tự',
					description: data.similarTopics.map((t: any) => t.title).join(', ')
				})
			else toast({ title: 'Không phát hiện trùng lặp' })
		} catch {
			toast({ title: 'Lỗi khi kiểm tra trùng lặp', variant: 'destructive' })
		} finally {
			setAiLoading(null)
		}
	}

	const handleSaveDraft = () => {
		toast({
			title: 'Đã lưu bản nháp thành công!',
			description: 'Bạn có thể quay lại chỉnh sửa sau.'
		})
		onOpenChange(false)
	}

	const handlePublish = () => {
		const errors: Record<string, boolean> = {}

		if (!formData?.title?.trim()) errors.title = true
		if (!formData?.requirements) errors.requirements = true
		if (!formData?.type) errors.type = true
		if (!date) errors.deadline = true

		setValidationErrors(errors)

		if (Object.keys(errors).length > 0) {
			toast({
				variant: 'destructive',
				title: 'Thiếu thông tin bắt buộc!',
				description: 'Vui lòng điền đầy đủ thông tin trước khi đăng.'
			})
			return
		}
		setShowConfirmation(true)
	}

	const confirmPublish = () => {
		if (!formData) return
		toast({
			title: 'Đăng đề tài thành công!',
			description: `Đề tài "${formData.title}" đã được đăng cho sinh viên.`
		})
		setShowConfirmation(false)
		onOpenChange(false)
	}

	if (!topic || !formData) return null

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Đăng đề tài mới</DialogTitle>
						<DialogDescription>Tạo đề tài cho sinh viên đăng ký trong học kỳ</DialogDescription>
					</DialogHeader>

					<TooltipProvider>
						<div className='space-y-6 py-4'>
							{/* Thông tin cơ bản */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										Thông tin cơ bản
										<Tooltip>
											<TooltipTrigger asChild>
												<Info className='h-4 w-4 cursor-help text-muted-foreground' />
											</TooltipTrigger>
											<TooltipContent>
												<p>Thông tin bắt buộc để sinh viên hiểu rõ đề tài</p>
											</TooltipContent>
										</Tooltip>
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='space-y-2'>
										<Label
											htmlFor='title'
											className={cn(validationErrors.title && 'text-destructive')}
										>
											Tên đề tài *
										</Label>
										<Input
											id='title'
											value={formData.title}
											onChange={(e) => {
												setFormData({ ...formData, title: e.target.value })
												setValidationErrors({ ...validationErrors, title: false })
											}}
											placeholder='VD: Xây dựng hệ thống quản lý sinh viên'
											className={cn(
												validationErrors.title &&
													'border-destructive focus-visible:ring-destructive'
											)}
										/>
										<div className='flex justify-end'>
											<Button
												type='button'
												variant='outline'
												className='w-fit'
												onClick={handleAIOptimizeDescription}
												disabled={!!aiLoading}
											>
												<Sparkles className='mr-2 h-4 w-4' />
												{aiLoading === 'optimize' ? 'Đang xử lý...' : 'Kiểm tra trùng lặp đề tài'}
											</Button>
										</div>
									</div>

									<div className='space-y-2'>
										<div className='flex items-center gap-2'>
											<Label htmlFor='description'>Mô tả chi tiết</Label>
											<Tooltip>
												<TooltipTrigger asChild>
													<Info className='h-4 w-4 cursor-help text-muted-foreground' />
												</TooltipTrigger>
												<TooltipContent className='max-w-xs'>
													<p>Mô tả mục tiêu, phạm vi và kết quả mong đợi của đề tài</p>
												</TooltipContent>
											</Tooltip>
										</div>
										<Textarea
											id='description'
											value={formData.description || ''}
											onChange={(e) => setFormData({ ...formData, description: e.target.value })}
											placeholder='Mô tả chi tiết về đề tài, mục tiêu, phạm vi, kết quả mong đợi...'
											rows={5}
										/>
										<div className='flex justify-end'>
											<Button
												type='button'
												variant='outline'
												className='w-fit'
												onClick={handleAIOptimizeDescription}
												disabled={!!aiLoading}
											>
												<Sparkles className='mr-2 h-4 w-4' />
												{aiLoading === 'optimize' ? 'Đang xử lý...' : 'Tối ưu mô tả đề tài'}
											</Button>
										</div>
									</div>

									<div className='grid grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<Label
												htmlFor='type'
												className={cn(validationErrors.type && 'text-destructive')}
											>
												Loại đề tài *
											</Label>
											<Select
												value={formData.type}
												onValueChange={(value) => {
													setFormData({ ...formData, type: value as any })
													setValidationErrors({ ...validationErrors, type: false })
												}}
											>
												<SelectTrigger
													className={cn(validationErrors.type && 'border-destructive')}
												>
													<SelectValue placeholder='Chọn loại' />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='Đồ án'>Đồ án</SelectItem>
													<SelectItem value='Khóa luận'>Khóa luận</SelectItem>
													<SelectItem value='NCKH'>NCKH</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className='grid grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<div className='flex items-center gap-2'>
												<Label htmlFor='maxRegistrations'>Số lượng sinh viên *</Label>
												<Tooltip>
													<TooltipTrigger asChild>
														<Info className='h-4 w-4 cursor-help text-muted-foreground' />
													</TooltipTrigger>
													<TooltipContent>
														<p>Số lượng sinh viên tối đa có thể đăng ký đề tài này</p>
													</TooltipContent>
												</Tooltip>
											</div>
											<Select
												value={formData.maxStudents.toString()}
												onValueChange={(value) =>
													setFormData({
														...formData,
														maxStudents: parseInt(value)
													})
												}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='1'>1 sinh viên</SelectItem>
													<SelectItem value='2'>2 sinh viên</SelectItem>
													<SelectItem value='3'>3 sinh viên</SelectItem>
													<SelectItem value='4'>4 sinh viên</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className='space-y-2'>
											<div className='flex items-center gap-2'>
												<Label className={cn(validationErrors.deadline && 'text-destructive')}>
													Hạn đăng ký *
												</Label>
												<Tooltip>
													<TooltipTrigger asChild>
														<Info className='h-4 w-4 cursor-help text-muted-foreground' />
													</TooltipTrigger>
													<TooltipContent>
														<p>Ngày cuối cùng sinh viên có thể đăng ký đề tài này</p>
													</TooltipContent>
												</Tooltip>
											</div>
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant='outline'
														className={cn(
															'w-full justify-start text-left font-normal',
															!date && 'text-muted-foreground',
															validationErrors.deadline && 'border-destructive'
														)}
													>
														<CalendarIcon className='mr-2 h-4 w-4' />
														{date
															? format(date, 'dd/MM/yyyy', { locale: vi })
															: 'Chọn ngày'}
													</Button>
												</PopoverTrigger>
												<PopoverContent className='w-auto p-0' align='start'>
													<Calendar
														mode='single'
														selected={date}
														onSelect={(newDate) => {
															setDate(newDate)
															if (newDate) {
																setFormData({
																	...formData,
																	deadline: format(newDate, 'yyyy-MM-dd')
																})
															}
															setValidationErrors({
																...validationErrors,
																deadline: false
															})
														}}
														disabled={(date) => date < new Date()}
														initialFocus
														className='pointer-events-auto'
													/>
												</PopoverContent>
											</Popover>
										</div>
									</div>
									
									<div className='space-y-2'>
										<Label htmlFor='coAdvisor'>Giảng viên đồng hướng dẫn</Label>
										<Command>
											<CommandInput
												placeholder='Nhập tên giảng viên (nếu có)'
												value={query}
												onValueChange={(text) => setQuery(text)}
											/>
											<CommandGroup>
												{filteredAdvisors.length === 0 && (
													<CommandEmpty>Không có giảng viên</CommandEmpty>
												)}
												{filteredAdvisors.map((advisor) => (
													<CommandItem
														key={advisor.id}
														onSelect={() => {
															setFormData({ ...formData, coAdvisorId: advisor.id })
															setQuery(advisor.name) // hiển thị tên đã chọn
														}}
													>
														{advisor.name}
													</CommandItem>
												))}
											</CommandGroup>
										</Command>
									</div>

									<div className='space-y-2'>
										<Label>Đã có sinh viên?</Label>
										<Popover open={!!studentQuery && studentResults.length > 0}>
											<PopoverTrigger asChild>
												<Input
													placeholder='Nhập mã số sinh viên...'
													value={studentQuery}
													onChange={(e) => setStudentQuery(e.target.value)}
												/>
											</PopoverTrigger>
											<PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
												<Command>
													<CommandInput
														placeholder='Tìm kiếm sinh viên...'
														value={studentQuery}
														onValueChange={setStudentQuery}
													/>
													<CommandList>
														{searching ? (
															<CommandEmpty>Đang tìm kiếm...</CommandEmpty>
														) : studentResults.length === 0 ? (
															<CommandEmpty>Không tìm thấy sinh viên</CommandEmpty>
														) : (
															<CommandGroup heading='Kết quả'>
																{studentResults.map((student) => (
																	<CommandItem
																		key={student.id}
																		value={student.studentCode}
																		onSelect={() => addStudent(student)}
																	>
																		{student.name} — {student.studentCode}
																	</CommandItem>
																))}
															</CommandGroup>
														)}
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>

										{selectedStudents.length > 0 && (
											<div className='mt-2 space-y-2'>
												{selectedStudents.map((student) => (
													<Card
														key={student.studentCode}
														className='border-primary/30 bg-primary/5'
													>
														<CardContent className='flex items-center justify-between py-2 text-sm'>
															<div>
																<p>
																	<span className='font-medium'>Tên: </span>
																	{student.name}
																</p>
																<p>
																	<span className='font-medium'>MSSV: </span>
																	{student.studentCode}
																</p>
															</div>
															<Button
																size='sm'
																variant='ghost'
																className='text-xs'
																onClick={() => removeStudent(student.studentCode)}
															>
																<X className='mr-1 h-3 w-3' />
																Xóa
															</Button>
														</CardContent>
													</Card>
												))}
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Yêu cầu kỹ năng</CardTitle>
									<CardDescription>Kỹ năng sinh viên cần có để thực hiện đề tài</CardDescription>
								</CardHeader>
								<CardContent className='space-y-3'>
									<div className='flex gap-2'>
										<Popover open={openSkillCombo} onOpenChange={setOpenSkillCombo}>
											<PopoverTrigger asChild>
												<div className='relative flex-1'>
													<Input
														value={skillInput}
														onChange={(e) => {
															setSkillInput(e.target.value)
															setOpenSkillCombo(true)
														}}
														onKeyDown={(e) => {
															if (e.key === 'Enter') {
																e.preventDefault()
															}
														}}
														placeholder='Nhập hoặc chọn kỹ năng...'
														onFocus={() => setOpenSkillCombo(true)}
													/>
												</div>
											</PopoverTrigger>
											<PopoverContent
												className='w-[--radix-popover-trigger-width] p-0'
												align='start'
											>
												<Command>
													<CommandInput
														placeholder='Tìm kiếm kỹ năng...'
														value={skillInput}
														onValueChange={setSkillInput}
													/>
													<CommandList>
														{skills.length === 0 || !skillInput ? (
															<CommandEmpty>Không có kỹ năng phù hợp</CommandEmpty>
														) : (
															<CommandGroup heading='Kỹ năng'>
																{skills
																	.filter((skill) =>
																		skill
																			.toLowerCase()
																			.includes(skillInput.toLowerCase())
																	)
																	.map((skill) => (
																		<CommandItem
																			key={skill}
																			value={skill}
																			onSelect={() => handleAddSkill(skill)}
																		>
																			<Plus className='mr-2 h-4 w-4' />
																			<div className='flex flex-col'>
																				<span>{skill}</span>
																				{skill && (
																					<span className='text-xs text-muted-foreground'>
																						{skill}
																					</span>
																				)}
																			</div>
																		</CommandItem>
																	))}
															</CommandGroup>
														)}
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
										<Button type='button' size='icon'>
											<Plus className='h-4 w-4' />
										</Button>
									</div>
									<div className='flex justify-end'>
										<Button
											type='button'
											variant='outline'
											className='w-fit'
											onClick={handleAISuggestSkills}
											disabled={!!aiLoading}
										>
											<FileCheck className='mr-2 h-4 w-4' />
											{aiLoading === 'skills' ? 'Đang xử lý...' : 'Gợi ý yêu cầu kỹ năng'}
										</Button>
									</div>

									{skills.length > 0 && (
										<div className='flex flex-wrap gap-2'>
											{skills.map((skill) => (
												<Badge key={skill} variant='secondary' className='pl-3 pr-1'>
													{skill}
													<Button
														type='button'
														variant='ghost'
														size='sm'
														className='ml-2 h-4 w-4 p-0 hover:bg-transparent'
														onClick={() => handleRemoveSkill(skill)}
													>
														<X className='h-3 w-3' />
													</Button>
												</Badge>
											))}
										</div>
									)}
								</CardContent>
							</Card>
							{/* Tài liệu tham khảo */}
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Upload className='h-5 w-5' />
										Tài liệu tham khảo
									</CardTitle>
									<CardDescription>
										Thêm link hoặc mô tả tài liệu để sinh viên tham khảo
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-3'>
									{references.map((ref, index) => (
										<div key={index} className='flex items-start gap-2'>
											<div className='flex-1 space-y-2'>
												<Input
													placeholder='Tên tài liệu'
													value={ref.name}
													onChange={(e) =>
														handleReferenceChange(index, 'name', e.target.value)
													}
												/>
												<Input
													placeholder='Link (tùy chọn)'
													value={ref.url || ''}
													onChange={(e) =>
														handleReferenceChange(index, 'url', e.target.value)
													}
												/>
											</div>
											<Button
												type='button'
												variant='ghost'
												size='icon'
												onClick={() => handleRemoveReference(index)}
											>
												<X className='h-4 w-4' />
											</Button>
										</div>
									))}
									<Button
										type='button'
										variant='outline'
										onClick={handleAddReference}
										className='w-full'
									>
										<Plus className='mr-2 h-4 w-4' />
										Thêm tài liệu
									</Button>
								</CardContent>
							</Card>
							{/* AI Tools
							<Card className='border-primary/20 bg-primary/5'>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Sparkles className='h-5 w-5 text-primary' />
										Công cụ hỗ trợ AI
									</CardTitle>
									<CardDescription>
										Giúp bạn hoàn thiện đề tài nhanh hơn và chính xác hơn
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-2'>
									<Button
										type='button'
										variant='outline'
										className='w-full justify-start'
										onClick={handleAIOptimizeDescription}
										disabled={!!aiLoading}
									>
										<Sparkles className='mr-2 h-4 w-4' />
										{aiLoading === 'optimize' ? 'Đang xử lý...' : 'Tối ưu mô tả đề tài'}
									</Button>
									<Button
										type='button'
										variant='outline'
										className='w-full justify-start'
										onClick={handleAISuggestSkills}
										disabled={!!aiLoading}
									>
										<FileCheck className='mr-2 h-4 w-4' />
										{aiLoading === 'skills' ? 'Đang xử lý...' : 'Gợi ý yêu cầu kỹ năng'}
									</Button>
									
								</CardContent>
							</Card> */}
						</div>
					</TooltipProvider>

					{/* <AIOptimizeDialog
						open={aiDialog.open}
						currentDescription={formData.description}
						suggested={aiDialog.suggestedDescription}
						onChange={(val) => setAiDialog({ ...aiDialog, suggestedDescription: val })}
						onConfirm={() => {
							setFormData({ ...formData, description: aiDialog.suggestedDescription })
							setAiDialog({ open: false, suggestedDescription: '' })
						}}
						onCancel={() => setAiDialog({ open: false, suggestedDescription: '' })}
					/>

					<AISkillSuggestDialog
						open={aiSkillDialog.open}
						skills={aiSkillDialog.skills}
						onConfirm={(selected) => {
							setFormData({
								...formData,
								requirements: [...new Set([...(formData.requirements || []), ...selected])]
							})
							setAiSkillDialog({ open: false, skills: [] })
						}}
						onCancel={() => setAiSkillDialog({ open: false, skills: [] })}
					/>

					<AIDuplicateDialog
						open={duplicateDialog.open}
						topics={duplicateDialog.topics}
						onClose={() => setDuplicateDialog({ open: false, topics: [] })}
					/> */}

					<DialogFooter className='sticky bottom-0 border-t bg-background pt-4'>
						<Button variant='outline' onClick={() => onOpenChange(false)}>
							Hủy
						</Button>
						<Button variant='outline' onClick={handleSaveDraft}>
							Lưu bản nháp
						</Button>
						<Button onClick={handlePublish}>Đăng đề tài</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận đăng đề tài</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc muốn đăng đề tài "{formData?.title}" cho sinh viên đăng ký không? Sau khi đăng,
							sinh viên sẽ có thể xem và đăng ký đề tài này.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={confirmPublish}>Xác nhận</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
