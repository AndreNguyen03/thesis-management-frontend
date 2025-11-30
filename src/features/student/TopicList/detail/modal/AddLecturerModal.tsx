import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import type { ResponseMiniLecturerDto } from '@/models/users'
import { useAssignLecturerToTopicMutation, useUnassignLecturerFromTopicMutation } from '@/services/registrationApi'

import AddingCoSupervisorContainer from '../components/AddingCoSupervisor'
import { toast } from '@/hooks/use-toast'
import type { ITopicDetail } from '@/models'
interface AddLecturertModalProps {
	topic: ITopicDetail
	open: boolean
	onCancel: () => void
	onRefetch: () => void
}
const AddLecturerModal: React.FC<AddLecturertModalProps> = ({ topic, open, onCancel, onRefetch }) => {
	const [assignLecturerToTopic, { isLoading: isLoadingAssign, isError: isAssignErrror }] =
		useAssignLecturerToTopicMutation()
	const [unassignLecturerFromTopic] = useUnassignLecturerFromTopicMutation()

	const handleConfirm = async (lecturerId: string) => {
		assignLecturerToTopic({ topicId: topic._id, lecturerId: lecturerId })
		if (isAssignErrror)
			toast({
				title: 'Thêm giảng viên đồng hướng dẫn thất bại',
				description: 'Đã có lỗi xảy ra trong quá trình thêm giảng viên đồng hướng dẫn',
				variant: 'destructive'
			})
		onRefetch()
	}
	const handleDelete = async (lecturerId: string) => {
		unassignLecturerFromTopic({ topicId: topic._id, lecturerId: lecturerId })
		if (isAssignErrror)
			toast({
				title: 'Xóa giảng viên đồng hướng dẫn thất bại',
				description: 'Đã có lỗi xảy ra trong quá trình xóa giảng viên đồng hướng dẫn',
				variant: 'destructive'
			})
		onRefetch()
	}
	return (
		<Dialog open={open} onOpenChange={onCancel}>
			<DialogContent className='max-w-screen-sm'>
				<DialogHeader>
					<DialogTitle className='text-lg font-semibold text-blue-600'>Thêm người đồng hướng dẫn</DialogTitle>
				</DialogHeader>
				<div className='py-2 text-sm font-semibold text-gray-700'>
					Hiện tại, đề tài có thể có tối đa 2 giảng viên đồng hướng dẫn
				</div>
				<AddingCoSupervisorContainer
					selectedCoSupervisors={topic.lecturers}
					handleConfirm={handleConfirm}
					handleDelete={handleDelete}
				/>
			</DialogContent>
		</Dialog>
	)
}

export default AddLecturerModal
