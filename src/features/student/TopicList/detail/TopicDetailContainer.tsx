import { Button } from '@/components/ui'
import { useNavigate, useParams } from 'react-router-dom'

import { ChevronLeft } from 'lucide-react'
import { useGetTopicByIdQuery } from '../../../../services/topicApi'
import TopicDetail from './TopicDetail'
import RelevantInformation from './RelevantInformation'
import { useEffect, useState } from 'react'
import type { ITopicDetail } from '@/models'
import { Dialog, DialogContent } from '@/components/ui/Dialog'

export const TopicDetailContainer = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	// Call the query hook unconditionally but skip fetching when no id is present
	const { data: topicData, isLoading, refetch } = useGetTopicByIdQuery({ id: id! }, { skip: !id })

	const [topic, setTopic] = useState<ITopicDetail | undefined>(undefined)

	useEffect(() => {
		if (topicData) {
			setTopic(topicData)
		}
	}, [topicData])

	// If no id was provided, render an error after hooks have been called
	if (!id) {
		return <div>Invalid topic id</div>
	}

	const handleUpdate = async () => {
		const { data } = await refetch()
		if (data) setTopic(data)
	}
	if (isLoading) {
		return <div>Loading...</div>
	}
	if (topic == null) {
		return <div>Topic not found</div>
	}
	return (
		<div className='col-span-2 min-h-[500px]'>
			<Dialog open={true} onOpenChange={() => navigate(-1)}>
				<DialogContent
					hideClose={true}
					className='flex h-full flex-col overflow-auto rounded-xl bg-[#F2F4FF] p-8 shadow-xl sm:min-w-full sm:overflow-hidden'
				>
					<div className='px-4'>
						<Button variant='back' className='w-fit' onClick={() => navigate(-1)}>
							<ChevronLeft className='size-6' />
							<p>Quay lại</p>
						</Button>
					</div>
					<div className='grid space-x-5 px-4 md:grid-cols-5'>
						<TopicDetail topic={topic} onUpdate={handleUpdate} />
						<RelevantInformation
							studentNames={topic.studentNames}
							lecturerNames={topic.lecturerNames}
							historyRegistrations={topic.allUserRegistrations}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
