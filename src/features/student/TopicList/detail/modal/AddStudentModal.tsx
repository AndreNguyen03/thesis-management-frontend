import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { useAssignStudentToTopicMutation, useUnassignStudentFromTopicMutation } from '@/services/registrationApi'

import { toast } from 'sonner'

import type { ITopicDetail } from '@/models'
import AddingStudentsContainer from '../components/AddingStudentContainer'
interface AddLecturertModalProps {
	topic: ITopicDetail
	open: boolean
	onCancel: () => void
	onRefetch: () => void
	goToApproval: () => void
}
const AddStudentModal: React.FC<AddLecturertModalProps> = ({ topic, open, onCancel, onRefetch, goToApproval }) => {
	const [assignStudentToTopic, { isLoading: isLoadingAssign }] = useAssignStudentToTopicMutation()
	const [unassignStudentFromTopic] = useUnassignStudentFromTopicMutation()
	const handleConfirm = async (studentId: string) => {
		try {
			await assignStudentToTopic({ topicId: topic._id, studentId }).unwrap()
			toast.success('Đã thêm sinh viên vào đề tài')
			onRefetch()
		} catch (error: any) {
			if (error?.data?.errorCode === 'STUDENT_ALREADY_REGISTERED') {
				toast.error('Sinh viên đã đăng ký đề tài này rồi')
			} else if (error?.data?.errorCode === 'STUDENT_JUST_REGISTER_ONE_TOPIC_EACH_TYPE') {
				toast.error('Sinh viên đã đăng ký đề tài khác ')
			} else {
				toast.error('Đã có lỗi xảy ra trong quá trình thêm sinh viên vào đề tài')
			}
		}
	}

	const handleDelete = async (studentId: string) => {
		try {
			await unassignStudentFromTopic({ topicId: topic._id, studentId }).unwrap()
			toast.success('Đã xóa sinh viên khỏi đề tài')
			onRefetch()
		} catch (error: any) {
			toast.error('Đã có lỗi xảy ra trong quá trình xóa sinh viên khỏi đề tài')
		}
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
