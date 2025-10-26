import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import type { Topic } from '../../../../models/topic.model'
import { Badge, Button } from '../../../../components/ui'
const TopicDetail = ({ topic }: { topic: Topic }) => {
	return (
		<div className='col-span-3 grid space-y-4 p-4'>
			{/* Toàn bộ nội dung chi tiết đề tài */}
			<div className='flex flex-row justify-between'>
				<div>
					<div className='flex flex-row gap-5'>
						<DialogTitle className='mb-2 text-2xl font-bold text-primary'>{topic.title}</DialogTitle>
						<Badge variant={'gray'} className='h-fit text-lg'>
							{topic.type}
						</Badge>
					</div>
					<DialogDescription className='mb-4 flex flex-wrap items-center gap-2 text-base text-gray-600'>
						<span className='text-lg'>
							{topic.lecturerNames.length > 0 ? topic.lecturerNames.join(', ') : 'Chưa có giảng viên'}
						</span>
						•<span className='text-lg'>{topic.major}</span>
					</DialogDescription>
				</div>
				<div>
					<Badge variant='destructive' className='h-fit text-sm'>
						<p>{topic.isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký'}</p>
					</Badge>
				</div>
			</div>

			<div className='space-y-2'>
				<div className='flex justify-between'>
					<div>
						<h4 className='mb-2 text-lg font-semibold text-gray-800'>Lĩnh vực</h4>
						<div className='flex flex-wrap gap-2'>
							{topic.fieldNames.map((field: string) => (
								<Badge key={field} variant='blue' className={'text-md px-3 py-1'}>
									{field}
								</Badge>
							))}
						</div>
					</div>
					<div>
						<h4 className='mb-2 text-lg font-semibold text-gray-800'>Yêu cầu kỹ năng</h4>
						<div className='flex flex-wrap gap-2'>
							{topic.requirementNames.map((req: string) => (
								<Badge key={req} variant='secondary' className={'text-md px-3 py-1'}>
									{req}
								</Badge>
							))}
						</div>
					</div>
					<div className='rounded-lg bg-gray-50 p-4'>
						<span className='font-medium text-gray-700'>Số lượng SV:</span>
						<p className='mt-1 text-gray-600'>
							{topic.studentNames.length}/{topic.maxStudents}
						</p>
					</div>
				</div>

				<div>
					<h4 className='mb-2 text-lg font-semibold text-gray-800'>Mô tả chi tiết</h4>
					<p className='rounded-lg bg-gray-50 p-4 text-lg text-gray-700'>{topic.description}</p>
				</div>

				<div className='grid grid-cols-2 gap-6 text-sm'>
					<Badge variant='outline' className='h-fit w-fit'>
						<p className='text-base'>Hạn đăng ký: {new Date(topic.deadline).toLocaleString('vi-VN')}</p>
					</Badge>
				</div>
			</div>
			<div className='flex'>
				<Button variant='destructive' className='w-fit'>
					{topic.isRegistered ? 'Hủy đăng ký' : 'Đăng ký đề tài'}
				</Button>
				<Button variant={topic.isSaved ? 'yellow' : 'gray'} className='ml-4 w-fit'>
					{topic.isSaved ? 'Bỏ lưu' : 'Lưu đề tài'}
				</Button>
			</div>
		</div>
	)
}

export default TopicDetail
