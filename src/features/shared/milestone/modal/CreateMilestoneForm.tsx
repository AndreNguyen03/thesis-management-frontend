import { MilestoneType, type PayloadFacultyCreateMilestone } from '@/models/milestone.model'
import { useState } from 'react'
import { toast } from 'sonner'
import { useFacultyCreateMilestoneMutation } from '@/services/milestoneApi'
import { Loader2, Plus } from 'lucide-react'
import RichTextEditor from '@/components/common/RichTextEditor'
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'

// Template cột mốc được định nghĩa sẵn
const MILESTONE_TEMPLATES = [
	{
		id: 'midterm-report',
		title: 'Báo cáo giữa kỳ',
		description: `<h3>Yêu cầu báo cáo giữa kỳ</h3>
<ul>
<li>Hoàn thành phần lý thuyết và thiết kế hệ thống</li>
<li>Trình bày các kết quả nghiên cứu đã đạt được</li>
<li>Báo cáo tiến độ thực hiện đề tài (50%)</li>
<li>Nộp báo cáo theo định dạng quy định</li>
</ul>`,
		type: MilestoneType.SUBMISSION
	},
	{
		id: 'final-report',
		title: 'Báo cáo cuối kỳ',
		description: `<h3>Yêu cầu báo cáo cuối kỳ</h3>
<ul>
<li>Hoàn thành toàn bộ nội dung đề tài</li>
<li>Nộp sản phẩm/mã nguồn (nếu có)</li>
<li>Báo cáo đầy đủ kết quả và đánh giá</li>
<li>Chuẩn bị slide thuyết trình cho buổi bảo vệ</li>
<li>Nộp báo cáo theo định dạng quy định</li>
</ul>`,
		type: MilestoneType.SUBMISSION
	},
	{
		id: 'thesis-defense',
		title: 'Đợt bảo vệ khóa luận',
		description: `<h3>Yêu cầu bảo vệ khóa luận</h3>
<ul>
<li>Thuyết trình kết quả nghiên cứu trước hội đồng</li>
<li>Trả lời câu hỏi của hội đồng</li>
<li>Thời gian thuyết trình: 15-20 phút</li>
<li>Chuẩn bị slide và demo sản phẩm (nếu có)</li>
<li>Trang phục lịch sự, chuyên nghiệp</li>
</ul>`,
		type: MilestoneType.DEFENSE
	}
]

const CreateMilestoneForm = ({ periodId }: { periodId: string }) => {
	const [createMilestone, { isLoading: isCreating }] = useFacultyCreateMilestoneMutation()
	const [isCollapsed, setIsCollapsed] = useState(true)
	const [periodNum, setPeriodNum] = useState<string>('đợt 1')
	const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
	const [newMilestone, setNewMilestone] = useState<PayloadFacultyCreateMilestone>({
		periodId: periodId,
		title: '',
		description: '',
		dueDate: '',
		type: MilestoneType.SUBMISSION
	})
	// --- FIX: Cập nhật logic chọn template ---

	const handleCreateMilestone = async () => {
		if (!newMilestone.title || !newMilestone.dueDate) {
			toast.error('Vui lòng chọn đầy đủ tiêu đề và hạn nộp', { richColors: true })
			return
		}
		try {
			await createMilestone({ ...newMilestone, title: `${newMilestone.title} - ${periodNum}` }).unwrap()
			toast.success('Tạo cột mốc thành công', { richColors: true })

			// Reset form
			setSelectedTemplateId('')
			setNewMilestone({
				periodId: periodId,
				title: '',
				description: '',
				dueDate: '',
				type: MilestoneType.SUBMISSION
			})
		} catch (error) {
			console.error('Error creating milestone:', error)
			toast.error('Xảy ra lỗi khi tạo cột mốc', {
				richColors: true,
				description: (error as any)?.data?.message || ''
			})
		}
	}
	1
	const handleSelectTemplate = (index: string) => {
		setSelectedTemplateId(index)
		const template = MILESTONE_TEMPLATES[parseInt(index)]
		if (!template) return

		setNewMilestone((prev) => ({
			...prev,
			title: template.title,
			description: template.description,
			type: template.type
		}))
	}
	return (
		<div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
			<h3
				className='mb-3 flex w-fit cursor-pointer items-center gap-2 font-semibold text-blue-900 hover:bg-slate-200'
				onClick={() => setIsCollapsed((prev) => !prev)}
			>
				<Plus className='h-5 w-5' />
				Tạo cột mốc mới
			</h3>
			{!isCollapsed && (
				<div className='grid gap-3'>
					<div className='flex gap-3'>
						<div className='flex flex-col gap-3'>
							<label className='mb-1 block text-sm font-medium'>Chọn loại cột mốc *</label>
							<Select value={selectedTemplateId} onValueChange={(value) => handleSelectTemplate(value)}>
								<SelectTrigger className='w-fit rounded border px-3 py-2'>
									<SelectValue placeholder='-- Chọn template --' />
								</SelectTrigger>
								<SelectContent>
									{MILESTONE_TEMPLATES.map((template, index) => (
										<SelectItem key={template.id} value={index.toString()}>
											{template.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{newMilestone.type === MilestoneType.DEFENSE && (
							<div className='flex flex-col gap-3'>
								<label className='mb-1 block text-sm font-medium'>Chọn đợt</label>
								<Select value={periodNum} onValueChange={(value) => setPeriodNum(value)}>
									<SelectTrigger className='w-fit rounded border px-3 py-2'>
										<SelectValue placeholder='-- Chọn template --' />
									</SelectTrigger>
									<SelectContent>
										{['đợt 1', 'đợt 2', 'đợt 3', 'đợt 4', 'đợt 5'].map((template, index) => (
											<SelectItem key={template} value={template}>
												{template}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>
					{selectedTemplateId && (
						<>
							<div>
								<label className='mb-1 block text-sm font-medium'>Tiêu đề *</label>
								<Input
									type='text'
									value={newMilestone.title}
									onChange={(e) => setNewMilestone((prev) => ({ ...prev, title: e.target.value }))}
									placeholder='Nhập tiêu đề cột mốc'
									className='w-full'
								/>
							</div>
							<div>
								<label className='mb-1 block text-sm font-medium'>Nội dung</label>
								<RichTextEditor
									value={newMilestone.description}
									onChange={(data) => setNewMilestone((prev) => ({ ...prev, description: data }))}
									placeholder='Nhập nội dung mô tả'
								/>
							</div>

							<div className='grid grid-cols-2 gap-3'>
								<div>
									<label className='mb-1 block text-sm font-medium'>Ngày hạn nộp *</label>
									<input
										type='datetime-local'
										min={new Date(Date.now() + 86400000).toISOString().slice(0, 16)}
										className='w-full rounded border px-3 py-2'
										value={newMilestone.dueDate}
										onChange={(e) =>
											setNewMilestone({
												...newMilestone,
												dueDate: e.target.value
											})
										}
									/>
								</div>
							</div>
							<Button onClick={handleCreateMilestone} disabled={isCreating} className='w-full'>
								{isCreating ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Đang tạo...
									</>
								) : (
									<>
										<Plus className='mr-2 h-4 w-4' />
										Tạo cột mốc
									</>
								)}
							</Button>
						</>
					)}
				</div>
			)}
		</div>
	)
}

export default CreateMilestoneForm
