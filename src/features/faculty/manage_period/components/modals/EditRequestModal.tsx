import type { GeneralTopic } from '@/models'
import React, { useEffect, useState } from 'react'

interface EditRequestModalProps {
	open: boolean
	topic: GeneralTopic | null
	initialValue?: string
	onClose: () => void
	onConfirm: (text: string) => void
}

const EditRequestModal: React.FC<EditRequestModalProps> = ({ open, topic, initialValue = '', onClose, onConfirm }) => {
	const [text, setText] = useState(initialValue)

	useEffect(() => {
		setText(initialValue)
	}, [initialValue, open])

	if (!open || !topic) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center'>
			<div className='absolute inset-0 bg-black/50' onClick={onClose} />
			<div className='relative z-10 w-full max-w-2xl rounded bg-white p-6 shadow-lg'>
				<h3 className='mb-2 text-lg font-semibold'>Yêu cầu chỉnh sửa đề tài: {topic.titleVN}</h3>
				<p className='mb-4 text-sm text-gray-600'>
					Vui lòng nhập yêu cầu chỉnh sửa (mô tả chi tiết những thay đổi mong muốn).
				</p>
				<textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					className='h-40 w-full resize-y rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300'
					placeholder='Ghi rõ thay đổi cần chỉnh sửa, phần nào cần cập nhật...'
				/>
				<div className='mt-4 flex justify-end gap-2'>
					<button className='rounded bg-gray-200 px-3 py-1' onClick={onClose}>
						Hủy
					</button>
					<button
						className='rounded bg-indigo-600 px-3 py-1 text-white'
						onClick={() => {
							onConfirm(text)
						}}
					>
						Gửi yêu cầu
					</button>
				</div>
			</div>
		</div>
	)
}

export default EditRequestModal
