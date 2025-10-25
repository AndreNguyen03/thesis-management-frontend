import { useEffect, useState } from 'react'

import { notifyError } from '@/components/ui/Toast'
import { getErrorMessage } from '@/utils/catch-error'
import { CancelRegisteredCard } from '../card/CancelRegisteredCard'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import { useAppSelector } from '../../../../../store/configureStore'

export const CanceledThesisRegistration = () => {
	const user = useAppSelector((state) => state.auth.user)
	//const { data: canceledRegistrations = [] } = useGetCanceledRegistrationQuery()
	//const [createRegistration, { isLoading: isRegistering, isSuccess }] = useCreateRegistrationMutation()

	const handleRegister = async (thesisId: string) => {
		await new Promise((resolve) => setTimeout(resolve, 500))

		try {
			// await createRegistration({ thesisId }).unwrap()
			await new Promise((resolve) => setTimeout(resolve, 500))
			// setRegistrations((prev) => prev.filter((reg) => reg.thesis._id !== thesisId))
		} catch (err) {
			const errorMessage = getErrorMessage(err)
			notifyError(errorMessage)
		}
	}
	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Danh sách đề tài', path: '/thesis' },
		{ label: 'Đề tài đã hủy' }
	])
	return (
		<div className='grid-cols1 grid gap-2'>
			{/* {registrations.map((registration) => (
				<CancelRegisteredCard
					key={registration.thesis._id}
					registration={registration}
					onRegister={() => handleRegister(registration.thesis._id)}
					isRegistering={isRegistering}
					isSuccess={isSuccess}
					isRegistered={registration.thesis.registrationIds.some((reg) => reg.registrantId._id === user?.id)}
				/>
			))} */}
		</div>
	)
}
