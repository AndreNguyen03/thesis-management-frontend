import { useState, useEffect } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import type { Topic } from '@/models/period.model'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EditTopicModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	topic: Topic | null
}

export function EditTopicModal({ open, onOpenChange, topic }: EditTopicModalProps) {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [instructor, setInstructor] = useState('')
	const [status, setStatus] = useState('')

	useEffect(() => {
		if (topic) {
			setTitle(topic.title)
			setDescription('')
			setInstructor(topic.instructor)
			setStatus(topic.status)
		}
	}, [topic])

	const handleSave = () => {
		if (!title.trim()) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng nhập tên đề tài',
				variant: 'destructive'
			})
			return
		}

		toast({
			title: 'Thành công',
			description: 'Đã cập nhật thông tin đề tài'
		})
		onOpenChange(false)
	}

	if (!topic) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[600px]'>
				<DialogHeader>
					<DialogTitle>Chỉnh sửa đề tài</DialogTitle>
					<DialogDescription>Cập nhật thông tin đề tài {topic.id}</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<div className='space-y-2'>
						<Label htmlFor='title'>Tên đề tài</Label>
						<Input
							id='title'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder='Nhập tên đề tài'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='instructor'>Giảng viên hướng dẫn</Label>
						<Input
							id='instructor'
							value={instructor}
							onChange={(e) => setInstructor(e.target.value)}
							placeholder='Tên giảng viên'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='status'>Trạng thái</Label>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='pending'>Chờ duyệt</SelectItem>
								<SelectItem value='approved'>Đã duyệt</SelectItem>
								<SelectItem value='rejected'>Từ chối</SelectItem>
								<SelectItem value='in_progress'>Đang thực hiện</SelectItem>
								<SelectItem value='paused'>Tạm dừng</SelectItem>
								<SelectItem value='completed'>Hoàn thành</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='description'>Mô tả đề tài</Label>
						<Textarea
							id='description'
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder='Nhập mô tả chi tiết về đề tài...'
							rows={6}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)}>
						Hủy
					</Button>
					<Button onClick={handleSave}>Lưu thay đổi</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
