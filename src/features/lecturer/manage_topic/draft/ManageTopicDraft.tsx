import { DataTable } from './DataTable'
import { getColumns } from './Columns'
import { useGetDraftTopicsQuery } from '@/services/topicApi'

const ManageTopicDraft = () => {
	const draftTopics = useGetDraftTopicsQuery()
	const columns = getColumns()
	const data =
		draftTopics.data?.data.map((topic, index) => ({
			...topic,
			index: index + 1,
			time: {
				createdAt: topic.createdAt,
				updatedAt: topic.updatedAt
			}
		})) || []
	console.log('Draft Topics Data:', data)
	return (
		<div>
			<DataTable columns={columns} data={data} />
		</div>
	)
}

export default ManageTopicDraft
