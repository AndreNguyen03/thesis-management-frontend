import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import type { ResponseMiniLecturerDto } from '@/models/users'
import { useAssignStudentToTopicMutation, useUnassignStudentFromTopicMutation } from '@/services/registrationApi'

import AddingCoSupervisorContainer from '../components/AddingCoSupervisor'
import { toast } from '@/hooks/use-toast'
import type { ITopicDetail } from '@/models'
import AddingStudentsContainer from '../components/AddingStudentContainer'
import { getErrorMessage } from '@/utils/catch-error'
interface AddLecturertModalProps {
	topic: ITopicDetail
	open: boolean
	onCancel: () => void
	onRefetch: () => void
	goToApproval: () => void
}
const AddStudentModal: React.FC<AddLecturertModalProps> = ({ topic, open, onCancel, onRefetch, goToApproval }) => {
	const [assignStudentToTopic, { isLoading: isLoadingAssign, isError: isAssignErrror }] =
		useAssignStudentToTopicMutation()
	const [unassignStudentFromTopic] = useUnassignStudentFromTopicMutation()
	const handleConfirm = async (studentId: string) => {
		await assignStudentToTopic({ topicId: topic._id, studentId: studentId })
		if (isAssignErrror) {
			toast({
				title: 'Thêm sinh viên vào đề tài thất bại',	
				description:
					getErrorMessage(isAssignErrror) || 'Đã có lỗi xảy ra trong quá trình thêm sinh viên vào đề tài',
				variant: 'destructive'
			})
			return
		}
		onRefetch()
	}
	const handleDelete = async (studentId: string) => {
		await unassignStudentFromTopic({ topicId: topic._id, studentId: studentId })
		if (isAssignErrror)
			toast({
				title: 'Xóa sinh viên khỏi đề tài thất bại',
				description: 'Đã có lỗi xảy ra trong quá trình xóa sinh viên khỏi đề tài',
				variant: 'destructive'
			})
		onRefetch()
	}

	return (
		<Dialog open={open} onOpenChange={onCancel}>
			<DialogContent className='max-w-screen-sm'>
				<DialogHeader>
					<DialogTitle className='text-lg font-semibold text-blue-600'>Thêm sinh viên</DialogTitle>
				</DialogHeader>
				<div className='py-2 text-sm font-semibold text-gray-700'>
					Hiện tại, đề tài có thể có tối đa {topic.maxStudents} sinh viên
				</div>
				<AddingStudentsContainer
					students={topic.students}
					handleConfirm={handleConfirm}
					handleDelete={handleDelete}
					goToApproval={goToApproval}
				/>
			</DialogContent>
		</Dialog>
	)
}

export default AddStudentModal
