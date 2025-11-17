import React, { useState } from 'react'
import { DataTable } from '../DataTable'
import type { GetChatbotVerDto } from '@/models/chatbot-version'
import { getColumns } from '../Columns'
interface ManageInforProps {
	chatbotVersion: GetChatbotVerDto
}
const ManageSuggestion: React.FC<ManageInforProps> = ({ chatbotVersion }) => {
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [editingValue, setEditingValue] = useState('')
	const suggestionUnenables =
		chatbotVersion?.query_unenable_suggestions?.map((item, idx) => ({
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
		<div className='overflow-hidden rounded-md border'>
			<DataTable columns={columns} data={suggestionUnenables} />
		</div>
	)
}

export default ManageSuggestion
