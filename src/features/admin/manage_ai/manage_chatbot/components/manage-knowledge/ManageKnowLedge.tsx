import { useState } from 'react'
import { getColumns } from './Columns'
import { DataTable } from './DataTable'
import { useGetKnowledgeSourcesQuery } from '@/services/chatbotApi'

const ManageKnowLedge = () => {
	const { data: knowledgeSources, error, isLoading } = useGetKnowledgeSourcesQuery()
	console.log('knowledgeSources', knowledgeSources)
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [editingValue, setEditingValue] = useState('')

	const suggestionEnables =
		knowledgeSources?.data.map((item, idx) => ({
			index: idx + 1,
			ownerName: item.owner_info.fullName,
			...item
		})) ?? []
	const handleEditContent = (_id: string, newContent: string) => {
		console.log('Saving content for index:', _id, 'with value:', newContent)
		setEditingIndex(null)
		setEditingValue('')
	}

	const columns = getColumns()

	// 	{
	// 	editingIndex,
	// 	editingValue,
	// 	setEditingIndex,
	// 	setEditingValue,
	// 	onEditContent: handleEditContent
	// }
	return (
		<div className='overflow-hidden rounded-md border'>
			<DataTable columns={columns} data={suggestionEnables} />
		</div>
	)
}

export default ManageKnowLedge
