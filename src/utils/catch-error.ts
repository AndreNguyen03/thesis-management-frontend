/* eslint-disable @typescript-eslint/no-explicit-any */
interface ApiError {
	status?: number
	data?: {
		message?: string
		error?: string
		errorCode?: string
		statusCode?: number
	}
	message?: string
}

export const getErrorMessage = (error: any): string => {
	const err = error as ApiError
	console.log('Lỗi API:', err)
	// Nếu có message từ backend
	if (err?.data?.message) {
		return err.data.message
	}

	// Xử lý theo errorCode từ backend (format mới)
	if (err?.data?.errorCode) {
		const errorCode = err.data.errorCode.toUpperCase()

		switch (errorCode) {
			case 'AUTHENTICATION_ERROR':
			case 'UNAUTHORIZED':
				return 'Bạn cần đăng nhập để thực hiện thao tác này.'
			case 'THESIS_NOT_FOUND':
				return 'Không tìm thấy đề tài này hoặc đã bị xóa.'
			case 'REGISTRATION_NOT_FOUND':
				return 'Không tìm thấy đăng ký này.'
			case 'THESIS_FULL':
				return 'Đề tài đã đủ số lượng sinh viên.'
			case 'ALREADY_REGISTERED':
				return 'Bạn đã đăng ký đề tài này rồi.'
			case 'DEADLINE_EXPIRED':
				return 'Đã hết hạn đăng ký đề tài này.'
			case 'FORBIDDEN':
			case 'PERMISSION_DENIED':
				return 'Bạn không có quyền thực hiện thao tác này.'
			case 'VALIDATION_ERROR':
				return 'Dữ liệu nhập vào không hợp lệ.'
			case 'DUPLICATE_DATA':
				return 'Dữ liệu đã tồn tại trong hệ thống.'
			default:
				// Fallback về message từ backend nếu có
				return err.data.message || err.data.errorCode
		}
	}

	// Fallback cho các trường hợp khác
	if (err?.message) {
		return err.message
	}

	return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'
}

// Hàm chuyên biệt cho cancel registration
export const getCancelRegistrationErrorMessage = (error: any): string => {
	const err = error as ApiError

	// Xử lý cụ thể cho cancel registration
	if (err?.data?.errorCode === 'THESIS_NOT_FOUND') {
		return 'Không tìm thấy đề tài này hoặc đã bị hủy đăng ký.'
	}

	if (err?.data?.errorCode === 'REGISTRATION_NOT_FOUND') {
		return 'Đăng ký này không tồn tại hoặc đã bị hủy.'
	}

	// Fallback về hàm chung
	return getErrorMessage(error) || 'Hủy đăng ký thất bại. Vui lòng thử lại.'
}

export const toErrorObject = (error: unknown): Error | null => {
	if (!error) return null
	return new Error(getErrorMessage(error))
}
