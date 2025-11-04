import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import type { ITopicDetail } from '@/models/topic.model'
import { Badge, Button } from '@/components/ui'
import { useCreateRegistrationMutation, useDeleteRegistrationMutation } from '@/services/registrationApi'
import { useSaveTopicMutation, useUnsaveTopicMutation } from '@/services/topicApi'
import { Loader2 } from 'lucide-react'
import { getErrorMessage } from '@/utils/catch-error'
import { toast } from '@/hooks/use-toast'
const TopicDetail = ({ topic, onUpdate }: { topic: ITopicDetail; onUpdate: () => void }) => {
	const [createRegistration, { isLoading: isLoadingRegister }] = useCreateRegistrationMutation()
	const [deleteRegistration, { isLoading: isLoadingUnregister }] = useDeleteRegistrationMutation()
	const [unsaveTopic, { isLoading: isLoadingUnSave }] = useUnsaveTopicMutation()
	const [saveTopic, { isLoading: isLoadingSave }] = useSaveTopicMutation()

	const toggleRegistration = async () => {
		if (topic.isRegistered) {
			try {
				await deleteRegistration({ topicId: topic._id }).unwrap()
				toast({
					title: 'Thành công',
					description: 'Hủy đăng ký đề tài thành công'
				})
			} catch (error) {
				console.error('Error during cancel registration toggle:', error)

				toast({
					title: 'Lỗi',
					description: getErrorMessage(error),
					variant: 'destructive'
				})
			}
		} else {
			try {
				await createRegistration({ topicId: topic._id }).unwrap()
				toast({
					title: 'Thành công',
					description: 'Đăng ký đề tài thành công'
				})
			} catch (error) {
				console.error('Error during registration toggle:', error)
				toast({
					title: 'Lỗi',
					description: getErrorMessage(error),
					variant: 'destructive'
				})
			}
		}
		onUpdate()
	}
	const toggleSaveTopic = async () => {
		if (topic.isSaved) {
			try {
				await unsaveTopic({ topicId: topic._id }).unwrap()
				toast({
					title: 'Thành công',
					description: 'Bỏ lưu đề tài thành công'
				})
			} catch (error) {
				console.error('Error during unsave topic:', error)
				toast({
					title: 'Lỗi',
					description: getErrorMessage(error),
					variant: 'destructive'
				})
			}
		} else {
			try {
				await saveTopic({ topicId: topic._id }).unwrap()
				toast({
					title: 'Thành công',
					description: 'Lưu đề tài thành công'
				})
			} catch (error) {
				console.error('Error during save topic:', error)
				toast({
					title: 'Lỗi',
					description: getErrorMessage(error),
					variant: 'destructive'
				})
			}
		}
		onUpdate()
	}

	return (
		<div className='col-span-5 gap-4 space-y-10 rounded-md bg-white p-8 sm:col-span-3'>
			{/* Toàn bộ nội dung chi tiết đề tài */}
			<div className='flex flex-col justify-between gap-8'>
				<div>
					<DialogTitle className='mb-2 text-2xl font-bold text-primary'>{topic.title}</DialogTitle>
					<DialogDescription className='mb-4 flex flex-wrap items-center gap-2 text-base text-gray-600'>
						<span className='text-lg'>
							{topic.lecturerNames.length > 0 ? topic.lecturerNames.join(', ') : 'Chưa có giảng viên'}
						</span>
						•<span className='text-lg'>{topic.major}</span>
					</DialogDescription>
				</div>
				<div className='flex flex-wrap space-x-1'>
					<Badge variant='gray' className='h-fit text-sm'>
						<p>{topic.type}</p>
					</Badge>
					<Badge variant='destructive' className='h-fit text-sm'>
						<p>{topic.isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký'}</p>
					</Badge>
				</div>
			</div>

			<div className='space-y-6'>
				<div className='flex flex-col justify-between gap-5 sm:flex-row'>
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

				<div className='text-sm'>
					<Badge variant='outline' className='h-fit'>
						<p className='text-base'>Hạn đăng ký: {new Date(topic.deadline).toLocaleString('vi-VN')}</p>
					</Badge>
				</div>
			</div>
			<div className='flex'>
				<Button
					disabled={isLoadingRegister || isLoadingUnregister}
					variant='destructive'
					className='w-fit'
					onClick={() => {
						toggleRegistration()
					}}
				>
					{isLoadingRegister || isLoadingUnregister ? <Loader2 /> : null}
					{topic.isRegistered ? 'Hủy đăng ký' : 'Đăng ký đề tài'}
				</Button>
				<Button
					disabled={isLoadingUnSave || isLoadingSave}
					variant={topic.isSaved ? 'yellow' : 'gray'}
					className='ml-4 w-fit'
					onClick={() => {
						toggleSaveTopic()
					}}
				>
					{isLoadingUnSave || isLoadingSave ? <Loader2 /> : null}

					{topic.isSaved ? 'Bỏ lưu' : 'Lưu đề tài'}
				</Button>
			</div>
			<div className='flex flex-col items-center space-y-5'>
				<Badge variant='blue' className='w-fit text-base'>
					Tài liệu liên quan
				</Badge>
				<div className='grid grid-cols-5 justify-center gap-4 gap-x-20 gap-y-10 rounded-sm bg-blue-50 p-5'>
					{Array.from({ length: 10 }).map((_, idx) => (
						<div key={idx} className='bg-black'>
							d
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default TopicDetail
