import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import type { MilestoneType, PayloadCreateMilestone } from '@/models/milestone.model'
import React, { type Dispatch } from 'react'

const CreateMilestone = ({
	open,
	setShowCreateModal,
	onCreateMilestone,
	newMilestone,
	setNewMilestone
}: {
	open: boolean
	setShowCreateModal: (v: boolean) => void
	onCreateMilestone: () => void
	newMilestone: PayloadCreateMilestone
	setNewMilestone: Dispatch<React.SetStateAction<PayloadCreateMilestone>>
}) => {
	return (
		<Dialog open={open} onOpenChange={setShowCreateModal}>
			<DialogContent>
				<DialogTitle className='mb-4 text-xl font-bold text-slate-800'>Tạo mốc deadline Mới</DialogTitle>
				<div className='relative w-full max-w-lg rounded-xl bg-white p-6 shadow-lg'>
					<form
						onSubmit={(e) => {
							e.preventDefault()
							onCreateMilestone()
						}}
						className='space-y-4'
					>
						{/* ...Các trường nhập liệu như cũ... */}
						<div>
							<label className='block text-sm font-medium text-slate-700'>Tiêu đề</label>
							<input
								type='text'
								value={newMilestone.title}
								onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
								required
								className='mt-1 w-full rounded-lg border px-3 py-2'
								placeholder='Nhập tiêu đề...'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-slate-700'>Mô tả</label>
							<textarea
								value={newMilestone.description}
								onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
								rows={3}
								className='mt-1 w-full rounded-lg border px-3 py-2'
								placeholder='Nhập mô tả...'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-slate-700'>Ngày hết hạn</label>
							<input
								type='datetime-local'
								value={newMilestone.dueDate}
								min={new Date().toISOString().slice(0, 16)}
								onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
								required
								className='mt-1 w-full rounded-lg border px-3 py-2'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-slate-700'>Mức độ</label>
							<select
								value={newMilestone.type}
								onChange={(e) =>
									setNewMilestone({ ...newMilestone, type: e.target.value as MilestoneType })
								}
								className='mt-1 w-full rounded-lg border px-3 py-2'
							>
								<option value='STANDARD' title='Deadline thông thường'>
									Nộp báo cáo
								</option>
							
							</select>
						</div>
						<div className='flex items-center justify-end gap-2 pt-4'>
							<button
								type='button'
								onClick={() => setShowCreateModal(false)}
								className='rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200'
							>
								Hủy
							</button>
							<button
								type='submit'
								className='rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700'
							>
								Tạo mới
							</button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default CreateMilestone
