import { Badge, Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { useNavigate, useParams } from 'react-router-dom'

import { ChevronLeft } from 'lucide-react'
import { useGetTopicByIdQuery } from '../../../../services/topicApi'
import TopicDetail from './TopicDetail'
import RelevantInformation from './RelevantInformation'

export const TopicDetailContainer = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	if (!id) {
		return <div>Invalid topic id</div>
	}

	const { data: topic, isLoading } = useGetTopicByIdQuery({ id })
	if (isLoading) {
		return <div>Loading...</div>
	}
	if (topic == null) {
		return <div>Topic not found</div>
	}

	return (
		<div className='col-span-2'>
			<Dialog open={true} onOpenChange={() => navigate(-1)}>
				<DialogContent
					hideClose={true}
					className='flex h-full max-w-full flex-col rounded-xl bg-white p-8 shadow-xl'
				>
					<div className='px-4'>
						<Button variant='back' className='w-fit' onClick={() => navigate(-1)}>
							<ChevronLeft className='size-6' />
							<p>Quay lại</p>
						</Button>
					</div>
					<div className='grid grid-cols-5 gap-5'>
						<TopicDetail topic={topic} />
						<RelevantInformation studentNames={topic.studentNames} lecturerNames={topic.lecturerNames} />
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
