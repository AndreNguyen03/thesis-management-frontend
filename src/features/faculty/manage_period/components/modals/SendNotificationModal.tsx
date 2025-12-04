import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/Dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Users } from 'lucide-react'
import type { PhaseType } from '@/models/period.model'

interface NotificationTemplate {
	id: string
	label: string
	content: string
}

const notificationTemplates: Record<PhaseType, NotificationTemplate[]> = {
	empty: [],
	submit_topic: [
		{
			id: 'remind_submit_topic',
			label: 'Nhắc nộp đề tài',
			content:
				'Kính gửi {teacherName},\n\nBạn hiện chưa nộp đủ số lượng đề tài cho kỳ học {periodName}.\nVui lòng hoàn thành trước {deadline}.\n\nTrân trọng,\nPhòng đào tạo'
		},
		{
			id: 'remind_complete_topic_info',
			label: 'Nhắc bổ sung thông tin đề tài',
			content:
				'Kính gửi {teacherName},\n\nĐề tài của bạn còn thiếu một số thông tin bắt buộc.\nVui lòng cập nhật trước {deadline}.\n\nTrân trọng,\nPhòng đào tạo'
		},
		{
			id: 'remind_min_topics',
			label: 'Nhắc xác nhận số lượng đề tài tối thiểu',
			content:
				'Kính gửi {teacherName},\n\nBạn cần nộp tối thiểu {minTopics} đề tài trong kỳ học {periodName}.\nVui lòng hoàn thành trước {deadline}.\n\nTrân trọng,\nPhòng đào tạo'
		}
	],
	open_registration: [
		{
			id: 'remind_student_register',
			label: 'Nhắc sinh viên đăng ký đề tài',
			content:
				'Kính gửi {studentName},\n\nBạn chưa đăng ký đề tài cho kỳ học {periodName}.\nHạn cuối đăng ký: {deadline}.\n\nTrân trọng,\nPhòng đào tạo'
		},
		{
			id: 'remind_teacher_confirm',
			label: 'Nhắc giảng viên xác nhận',
			content:
				'Kính gửi {teacherName},\n\nSinh viên đã đăng ký đề tài của bạn. Vui lòng xác nhận trước {deadline}.\n\nTrân trọng,\nPhòng đào tạo'
		},
		{
			id: 'remind_student_complete_profile',
			label: 'Nhắc sinh viên hoàn thành hồ sơ',
			content:
				'Kính gửi {studentName},\n\nBạn cần hoàn thành hồ sơ đăng ký đề tài trước {deadline}.\n\nTrân trọng,\nPhòng đào tạo'
		}
	],
	execution: [
		{
			id: 'remind_submit_final_docs',
			label: 'Nhắc nộp tài liệu cuối',
			content:
				'Kính gửi {studentName},\n\nBạn chưa nộp tài liệu cuối cho đề tài {topicTitle}.\nHạn cuối: {deadline}.\n\nTrân trọng,\nPhòng đào tạo'
		},
		{
			id: 'remind_teacher_review',
			label: 'Nhắc giảng viên đánh giá',
			content:
				'Kính gửi {teacherName},\n\nBạn cần đánh giá sinh viên {studentName} cho đề tài {topicTitle}.\nHạn cuối: {deadline}.\n\nTrân trọng,\nPhòng đào tạo'
		}
	],
	completion: [
		{
			id: 'notify_completion',
			label: 'Thông báo hoàn thành',
			content: 'Kính gửi {recipientName},\n\nĐề tài {topicTitle} đã hoàn thành.\n\nTrân trọng,\nPhòng đào tạo'
		}
	]
}

interface SendNotificationModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	phaseType: PhaseType
	onSend: () => Promise<void>
}

export function SendNotificationModal({ open, onOpenChange, phaseType, onSend }: SendNotificationModalProps) {
	const [selectedTemplate, setSelectedTemplate] = useState<string>('')
	const [content, setContent] = useState<string>('')
	const [isSending, setIsSending] = useState(false)
	const [showRecipients, setShowRecipients] = useState(false)

	const templates = notificationTemplates[phaseType] || []

	const handleTemplateChange = (templateId: string) => {
		setSelectedTemplate(templateId)
		const template = templates.find((t) => t.id === templateId)
		if (template) {
			setContent(template.content)
		}
	}

	const handleSend = async () => {
		setIsSending(true)
		try {
			await onSend()
			onOpenChange(false)
			// Reset form
			setSelectedTemplate('')
			setContent('')
		} finally {
			setIsSending(false)
		}
	}

	// Mock recipient list - in real app, this would come from the action data
	const mockRecipients = Array.from({ length: action.count }, (_, i) => ({
		id: `recipient-${i}`,
		name: i % 2 === 0 ? `Nguyễn Văn ${String.fromCharCode(65 + i)}` : `Trần Thị ${String.fromCharCode(65 + i)}`,
		email: `user${i}@example.com`
	}))

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>Gửi thông báo</DialogTitle>
						<DialogDescription>{action.label}</DialogDescription>
					</DialogHeader>

					<div className='space-y-6 py-4'>
						{/* Template Selection */}
						<div className='space-y-2'>
							<Label htmlFor='template'>Chọn mẫu thông báo</Label>
							<Select value={selectedTemplate} onValueChange={handleTemplateChange}>
								<SelectTrigger id='template'>
									<SelectValue placeholder='-- Chọn mẫu --' />
								</SelectTrigger>
								<SelectContent>
									{templates.map((template) => (
										<SelectItem key={template.id} value={template.id}>
											{template.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Recipient Count */}
						<div className='flex items-center justify-between rounded-lg border bg-muted/30 p-4'>
							<div className='flex items-center gap-2'>
								<Users className='h-5 w-5 text-muted-foreground' />
								<span className='text-sm font-medium'>Sẽ gửi cho:</span>
								<Badge variant='secondary' className='font-mono'>
									{action.count} người
								</Badge>
							</div>
							<Button variant='ghost' size='sm' onClick={() => setShowRecipients(true)}>
								Xem chi tiết danh sách
							</Button>
						</div>

						{/* Content Preview */}
						{content && (
							<div className='space-y-2'>
								<Label htmlFor='content'>Nội dung gửi</Label>
								<Textarea
									id='content'
									value={content}
									onChange={(e) => setContent(e.target.value)}
									rows={10}
									className='font-mono text-sm bg-white'
								/>
								<p className='text-xs text-muted-foreground'>
									Các biến như {'{teacherName}'}, {'{periodName}'}, {'{deadline}'} sẽ được tự động
									thay thế.
								</p>
							</div>
						)}
					</div>

					<DialogFooter>
						<Button variant='outline' onClick={() => onOpenChange(false)} disabled={isSending}>
							Hủy
						</Button>
						<Button onClick={handleSend} disabled={!selectedTemplate || isSending}>
							{isSending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Đang gửi...
								</>
							) : (
								'Gửi thông báo'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Recipients List Drawer */}
			<Sheet open={showRecipients} onOpenChange={setShowRecipients}>
				<SheetContent className='w-full overflow-y-auto sm:max-w-lg'>
					<SheetHeader>
						<SheetTitle>Danh sách người nhận</SheetTitle>
						<SheetDescription>Tổng cộng {action.count} người sẽ nhận thông báo này</SheetDescription>
					</SheetHeader>
					<div className='mt-6 space-y-2'>
						{mockRecipients.map((recipient, index) => (
							<div
								key={recipient.id}
								className='flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50'
							>
								<div className='flex items-center gap-3'>
									<div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary'>
										{index + 1}
									</div>
									<div>
										<p className='text-sm font-medium'>{recipient.name}</p>
										<p className='text-xs text-muted-foreground'>{recipient.email}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</SheetContent>
			</Sheet>
		</>
	)
}
