import React, { useState } from 'react'
import { getColumns } from '../Columns'
import type { GetChatbotVerDto } from '@/models/chatbot-version'
import { DataTable } from '../DataTable'
interface ManageInforProps {
	chatbotVersion: GetChatbotVerDto
}
const ManageInfor: React.FC<ManageInforProps> = ({ chatbotVersion }) => {
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [editingValue, setEditingValue] = useState('')

	// Chuyển đổi dữ liệu sang đúng type Suggestion (có index)
	const suggestionEnables =
		chatbotVersion?.query_suggestions?.map((item, idx) => ({
			_id: item._id,
			index: idx + 1,
			content: item.content,
			status: item.enabled
		})) ?? []
	const handleEditContent = (_id: string, newContent: string) => {
		console.log('Saving content for index:', _id, 'with value:', newContent)
		setEditingIndex(null)
		setEditingValue('')
	}

	const columns = getColumns({
		editingIndex,
		editingValue,
		setEditingIndex,
		setEditingValue,
		onEditContent: handleEditContent
	})
	return (
		<>
			<div className='hover:cursor-pointer hover:border hover:border-gray-300 hover:bg-gray-100'>
				<span className='flex space-x-2'>
					<p className='text-[15px] text-muted-foreground text-zinc-700'>Tên hiển thị:</p>
					<p className='text-[15px] text-muted-foreground'>{chatbotVersion.name}</p>
				</span>
				<span className='flex space-x-2 text-lg'>
					<p className='text-[15px] text-muted-foreground text-zinc-700'>Mô tả ngắn:</p>
					<p className='text-[15px] text-muted-foreground'>{chatbotVersion.description}</p>
				</span>
				<span className='flex space-x-2 text-[15px]'>
					<p className='text-[15px] text-muted-foreground text-zinc-700'>Trạng thái:</p>
					<p className='text-[15px] text-muted-foreground'>
						{chatbotVersion.status ? (
							<span className='text-green-500'>Đang hoạt động</span>
						) : (
							<span className='text-red-500'>Ngừng hoạt động</span>
						)}
					</p>
				</span>
			</div>
			<div className='overflow-hidden rounded-md border'>
				<DataTable columns={columns} data={suggestionEnables} />
			</div>
		</>
	)
}

export default ManageInfor
