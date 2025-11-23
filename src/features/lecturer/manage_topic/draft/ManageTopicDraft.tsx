import { DataTable } from './DataTable'
import { getColumns } from './Columns'
import { useGetDraftTopicsQuery } from '@/services/topicApi'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { CreateTopic } from '../../new_topic'
import { Eye } from 'lucide-react'

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
		<div className='h-screen'>
			<ResizablePanelGroup direction='vertical' className='rounded-lg border'>
				<ResizablePanel defaultSize={50}>
					<div>
						<DataTable columns={columns} data={data} />
					</div>
				</ResizablePanel>
				<ResizableHandle>
					<Eye className='h-4 w-4 text-gray-500' />
				</ResizableHandle>

				<ResizablePanel defaultSize={50}>
					<CreateTopic />
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	)
}

export default ManageTopicDraft
