import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { X, AlertCircle, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils' // Hàm tiện ích của shadcn (nếu có)

export function FlashBanner() {
	const location = useLocation()
	const navigate = useNavigate() // Dùng để clear state
	const [isVisible, setIsVisible] = useState(false)

	// Lấy state từ router
	const state = location.state as {
		flashType?: 'ERROR' | 'SUCCESS' | 'INFO'
		message?: string
		reasonSub?: string
		actionUrl?: string
	} | null

	useEffect(() => {
		// Nếu có state thì hiện banner
		if (state?.flashType) {
			setIsVisible(true)

			// Tùy chọn: Tự động ẩn sau 10 giây
			const timer = setTimeout(() => handleClose(), 10000)
			return () => clearTimeout(timer)
		}
	}, [location.key]) // Chạy lại khi location thay đổi (key thay đổi)

	const handleClose = () => {
		setIsVisible(false)
		navigate(location.pathname, { replace: true, state: {} })
	}

	if (!isVisible || !state || !state.flashType) return null

	// Cấu hình màu sắc
	const styles = {
		ERROR: 'bg-red-50 border-red-200 text-red-800',
		SUCCESS: 'bg-green-50 border-green-200 text-green-800',
		INFO: 'bg-blue-50 border-blue-200 text-blue-800'
	}

	const currentStyle = styles[state.flashType || 'INFO']
	const handleGo = () => {
		setIsVisible(false)
		if (state.flashType === 'ERROR')
			navigate(state.actionUrl!, {
				state: {
					notiType: 'REJECTED',
					message: state.message,
					reasonSub: state.reasonSub
				}
			})
		else navigate(state.actionUrl!)
	}
	return (
		<div className='top-21 fixed z-30 w-full border-b bg-gray-50'>
			<div
				className={cn(
					'min-w-0 max-w-[calc(100vw-4rem)] border-b px-4 py-3 shadow-sm transition-all duration-300 ease-in-out',
					currentStyle
				)}
			>
				<div className='flex items-start justify-center gap-3'>
					<div className='flex items-start gap-3'>
						{state.flashType === 'ERROR' && <AlertCircle className='mt-0.5 h-5 w-5 shrink-0' />}
						{state.flashType === 'SUCCESS' && <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0' />}

						<div>
							<p className='text-sm font-bold'>{state.message}</p>
							{state.reasonSub && <p className='mt-1 text-sm opacity-90'>{state.reasonSub}</p>}
						</div>
						{state.actionUrl && (
							<button
								title='Đi tới trang'
								onClick={handleGo}
								className='rounded bg-blue-600 px-2 py-1 text-white transition hover:bg-blue-700'
							>
								<ArrowUpRight className='h-4 w-4' />
							</button>
						)}
					</div>

					<button
						onClick={handleClose}
						className='shrink-0 rounded-full p-1 transition-colors hover:bg-black/5'
					>
						<X className='h-4 w-4' />
					</button>
				</div>
			</div>
		</div>
	)
}
