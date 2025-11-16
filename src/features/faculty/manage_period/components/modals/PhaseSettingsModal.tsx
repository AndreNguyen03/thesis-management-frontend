import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Bell, Save, Info } from 'lucide-react'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Dialog as PreviewDialog, DialogContent as PreviewContent } from '@/components/ui/dialog'
import type { PhaseType } from '@/models/period'

// Mock danh sách giảng viên có sẵn
const allLecturersMock = [
	'Nguyễn Văn A',
	'Trần Thị B',
	'Lê Văn C',
	'Phạm Thị D',
	'Nguyễn Thị E',
	'Trần Văn F',
	'Lê Thị G',
	'Phạm Văn H',
	'Nguyễn Văn I',
	'Trần Thị J',
	'Lê Văn K',
	'Phạm Thị L'
]

interface PhaseSettingsModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	phase: PhaseType
	status: 'not_started' | 'ongoing' | 'completed'
	initialStart?: string
	initialEnd?: string
	lecturers?: string[]
}

export function PhaseSettingsModal({
	open,
	onOpenChange,
	phase,
	status,
	initialStart = '',
	initialEnd = '',
	lecturers = []
}: PhaseSettingsModalProps) {
	const [startTime, setStartTime] = useState(initialStart)
	const [endTime, setEndTime] = useState(initialEnd)
	const [message, setMessage] = useState('')
	const [previewOpen, setPreviewOpen] = useState(false)

	const [selectedLecturers, setSelectedLecturers] = useState<string[]>(lecturers)
	const [tempSelected, setTempSelected] = useState<string[]>(lecturers)
	const [lecturerDropdownOpen, setLecturerDropdownOpen] = useState(false)
	const [searchText, setSearchText] = useState('')

	const isPhase1 = phase === 'submit_topic'
	const isPhase2 = phase === 'open_registration'
	const isPhase4 = phase === 'completion'

	const isTimeInvalid = startTime && endTime ? endTime <= startTime : false

	const statusMap = {
		not_started: { text: 'Chưa bắt đầu', variant: 'gray' as const },
		ongoing: { text: 'Đang diễn ra', variant: 'lightBlue' as const },
		completed: { text: 'Đã hoàn thành', variant: 'registered' as const }
	}

	const toggleTemp = (name: string) => {
		if (tempSelected.includes(name)) {
			setTempSelected(tempSelected.filter((l) => l !== name))
		} else {
			setTempSelected([...tempSelected, name])
		}
	}

	const selectAllTemp = () => setTempSelected([...allLecturersMock])
	const clearAllTemp = () => setTempSelected([])

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className='flex max-h-[90vh] max-w-2xl flex-col'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2 text-xl font-semibold'>
							<Info className='h-5 w-5 text-primary' />
							Thiết lập Pha {phase}: - Trạng thái:{' '}
							<Badge variant={statusMap[status].variant}>{statusMap[status].text}</Badge>
						</DialogTitle>
					</DialogHeader>

					<div className='flex-1 space-y-6 overflow-y-auto py-4 pr-1'>
						{/* TIME SETTINGS */}
						<section className='space-y-4 rounded-lg border p-4'>
							<div className='flex items-center gap-2'>
								<Calendar className='h-5 w-5 text-primary' />
								<h3 className='font-semibold'>Thiết lập thời gian</h3>
							</div>

							<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
								<div>
									<label className='text-sm font-medium'>Bắt đầu</label>
									<input
										type='datetime-local'
										className='w-full rounded border px-3 py-2'
										value={startTime}
										onChange={(e) => setStartTime(e.target.value)}
									/>
								</div>
								<div>
									<label className='text-sm font-medium'>Kết thúc</label>
									<input
										type='datetime-local'
										className={`w-full rounded border px-3 py-2 ${isTimeInvalid ? 'border-red-500' : ''}`}
										value={endTime}
										onChange={(e) => setEndTime(e.target.value)}
									/>
									{isTimeInvalid && (
										<p className='mt-1 text-xs text-red-500'>
											* Thời gian kết thúc phải sau thời gian bắt đầu
										</p>
									)}
								</div>
							</div>
						</section>

						{/* PHASE 1: LECTURERS */}
						{isPhase1 && (
							<section className='space-y-4 rounded-lg border p-4'>
								<div className='flex items-center gap-2'>
									<Users className='h-5 w-5 text-primary' />
									<h3 className='font-semibold'>Giảng viên nộp</h3>
								</div>

								{/* Hiển thị chip */}
								<div className='flex flex-wrap gap-2'>
									{selectedLecturers.length > 0 ? (
										selectedLecturers.map((name) => (
											<div
												key={name}
												className='flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-sm'
											>
												{name}
												<button
													type='button'
													className='text-xs text-red-500'
													onClick={() =>
														setSelectedLecturers(
															selectedLecturers.filter((l) => l !== name)
														)
													}
												>
													×
												</button>
											</div>
										))
									) : (
										<p className='italic text-muted-foreground'>Chưa có giảng viên nào được chọn</p>
									)}
								</div>

								<div className='relative mt-2'>
									<Button
										variant='outline'
										size='sm'
										onClick={() => {
											setLecturerDropdownOpen(!lecturerDropdownOpen)
											setTempSelected(selectedLecturers)
										}}
									>
										Chọn giảng viên
									</Button>

									{lecturerDropdownOpen && (
										<div className='absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded border bg-white p-2 shadow-lg'>
											<input
												type='text'
												placeholder='Tìm giảng viên...'
												className='mb-2 w-full rounded border px-2 py-1'
												value={searchText}
												onChange={(e) => setSearchText(e.target.value)}
											/>

											<div className='mb-2 flex justify-between'>
												<Button size='sm' onClick={selectAllTemp}>
													Chọn tất cả
												</Button>
												<Button size='sm' onClick={clearAllTemp}>
													Bỏ chọn tất cả
												</Button>
											</div>

											{allLecturersMock
												.filter((l) => l.toLowerCase().includes(searchText.toLowerCase()))
												.map((name) => (
													<label
														key={name}
														className='flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-100'
													>
														<input
															type='checkbox'
															checked={tempSelected.includes(name)}
															onChange={() => toggleTemp(name)}
														/>
														{name}
													</label>
												))}

											<Button
												size='sm'
												className='mt-2 w-full'
												onClick={() => {
													setSelectedLecturers(tempSelected)
													setLecturerDropdownOpen(false)
												}}
											>
												Xác nhận
											</Button>
										</div>
									)}
								</div>
							</section>
						)}

						{/* PHASE 1 & 2: SEND NOTIFICATION */}
						{(isPhase1 || isPhase2) && (
							<section className='space-y-4 rounded-lg border p-4'>
								<div className='flex items-center gap-2'>
									<Bell className='h-5 w-5 text-primary' />
									<h3 className='font-semibold'>Gửi thông báo</h3>
								</div>
								<p className='text-sm text-muted-foreground'>
									Gửi thông báo cho {isPhase1 ? 'giảng viên' : 'sinh viên'}.
								</p>
								<Textarea
									placeholder='Nhập nội dung thông báo...'
									value={message}
									onChange={(e) => setMessage(e.target.value)}
								/>
								<div className='flex gap-2'>
									<Button variant='outline' size='sm' onClick={() => setPreviewOpen(true)}>
										Xem trước
									</Button>
									<Button size='sm'>Gửi thông báo</Button>
								</div>
							</section>
						)}

						{/* PHASE 4: SAVE TO LIBRARY */}
						{isPhase4 && (
							<section className='space-y-4 rounded-lg border p-4'>
								<div className='flex items-center gap-2'>
									<Save className='h-5 w-5 text-primary' />
									<h3 className='font-semibold'>Lưu vào Thư viện số</h3>
								</div>
								<p className='text-sm text-muted-foreground'>Lưu toàn bộ đề tài để tra cứu về sau.</p>
								<Button className='flex items-center gap-2'>
									<Save className='h-4 w-4' /> Lưu vào Thư viện số
								</Button>
							</section>
						)}
					</div>

					<DialogFooter>
						<Button disabled={isTimeInvalid}>Lưu tất cả thay đổi</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* PREVIEW MODAL */}
			<PreviewDialog open={previewOpen} onOpenChange={setPreviewOpen}>
				<PreviewContent className='max-w-lg space-y-4'>
					<h2 className='text-lg font-semibold'>Xem trước thông báo</h2>
					<div className='whitespace-pre-wrap rounded border bg-muted p-4 text-sm'>
						{message || 'Không có nội dung.'}
					</div>
					<div className='flex justify-end'>
						<Button onClick={() => setPreviewOpen(false)}>Đóng</Button>
					</div>
				</PreviewContent>
			</PreviewDialog>
		</>
	)
}
