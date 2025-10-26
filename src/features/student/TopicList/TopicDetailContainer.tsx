import { Badge, Button, CardDescription } from '@/components/ui'
import { DialogHeader } from '@/components/ui/Dialog'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetTopicByIdQuery } from '../../../services/topicApi'

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
		<div>
			<Button onClick={() => navigate(-1)} className='mb-4 text-sm text-blue-600 hover:underline'>
				Quay lại
			</Button>
			<Dialog open={true} onOpenChange={() => navigate(-1)}>
				<DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>{topic.title}</DialogTitle>
						<DialogDescription>
							{topic.lecturerNames.length > 0 ? topic.lecturerNames.join(', ') : 'Chưa có giảng viên'}•{' '}
							{topic.major}
						</DialogDescription>
					</DialogHeader>
					<div className='space-y-4'>
						<div>
							<h4 className='mb-2 font-medium'>Mô tả chi tiết</h4>
							<p className='text-sm text-muted-foreground'>{topic.description}</p>
						</div>

						<div>
							<h4 className='mb-2 font-medium'>Yêu cầu kỹ năng</h4>
							<div className='flex flex-wrap gap-2'>
								{topic.requirementNames.map((req: string) => (
									<Badge key={req} variant='secondary'>
										{req}
									</Badge>
								))}
							</div>
						</div>

						<div className='grid grid-cols-2 gap-4 text-sm'>
							<div>
								<span className='font-medium'>Lĩnh vực:</span>
								<p className='text-muted-foreground'>{topic.field}</p>
							</div>
							<div>
								<span className='font-medium'>Số lượng SV:</span>
								<p className='text-muted-foreground'>
									{topic.studentNames.length}/{topic.maxStudents}
								</p>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
