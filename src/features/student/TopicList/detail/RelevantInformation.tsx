import RegistratorInformation from './components/RegistratorInformation'
import RegistrationDiary from './components/RegistrationDiary'
import type { IRegistration } from '@/@/models'

const RelevantInformation = ({
	studentNames,
	lecturerNames,
	historyRegistrations
}: {
	studentNames: string[]
	lecturerNames: string[]
	historyRegistrations: IRegistration[]
}) => {
	return (
		<div className='col-span-5 grid grid-rows-3 sm:col-span-2'>
			<div className='row-span-2'>
				<div className='flex h-fit flex-col space-y-8 rounded-lg bg-white p-5'>
					<RegistratorInformation studentNames={studentNames} lecturerNames={lecturerNames} />
					<RegistrationDiary historyRegistrations={historyRegistrations} />
				</div>
			</div>
			<div className='row-span-1 bg-black'>dsd</div>
		</div>
	)
}

export default RelevantInformation
