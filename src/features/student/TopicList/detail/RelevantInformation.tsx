import RegistratorInformation from './components/RegistratorInformation'
import RegistrationDiary from './components/RegistrationDiary'
import type { IRegistration, ResponseMiniLecturerDto, ResponseMiniStudentDto } from '@/models'

const RelevantInformation = ({
	students,
	lecturers
	//historyRegistrations
}: {
	students: ResponseMiniStudentDto[]
	lecturers: ResponseMiniLecturerDto[]
	//historyRegistrations: IRegistration[]
}) => {
	return (
		<div className='col-span-5 grid grid-rows-3 sm:col-span-2'>
			<div className='row-span-2'>
				<div className='flex h-fit flex-col space-y-8'>
					<RegistratorInformation students={students} lecturers={lecturers} />
					{/* <RegistrationDiary historyRegistrations={historyRegistrations} /> */}
				</div>
			</div>
			<div className='row-span-1 bg-black'>dsd</div>
		</div>
	)
}

export default RelevantInformation
