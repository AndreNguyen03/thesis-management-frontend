import { toast } from 'react-toastify'

export function notifyError(message: string) {
	toast.error(message, {
		position: 'top-right',
		autoClose: 3000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		theme: 'light'
	})
}

export function notifySuccess(message: string) {
	toast.success(message, {
		position: 'top-right',
		autoClose: 3000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		theme: 'light'
	})
}
