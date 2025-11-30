export const getRegistrationStatus = (status: string) => {
	if (status === RegistrationStatus.CANCELED) {
		return 'Đã hủy'
	}
	if (status === RegistrationStatus.PENDING) {
		return 'Đang chờ duyệt'
	}
	if (status === RegistrationStatus.APPROVED) {
		return 'Đã duyệt'
	}
	if (status === RegistrationStatus.REJECTED) {
		return 'Đã từ chối'
	}
}
export const RegistrationStatus = {
	PENDING: 'pending',
	APPROVED: 'approved',
	REJECTED: 'rejected',
	CANCELED: 'canceled'
}
