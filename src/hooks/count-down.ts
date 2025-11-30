import { useEffect, useState } from 'react'

export function useCountdown(targetTime: string | number | Date | null) {
	const [countdown, setCountdown] = useState('')

	useEffect(() => {
		if (!targetTime) {
			setCountdown('')
			return
		}

		const end = new Date(targetTime).getTime()

		const updateCountdown = () => {
			const now = Date.now()
			const diff = end - now
			if (diff <= 0) {
				setCountdown('End')
				return
			}
			const days = Math.floor(diff / (1000 * 60 * 60 * 24))

			const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
			const seconds = Math.floor((diff % (1000 * 60)) / 1000)
			setCountdown(`${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`)
		}

		updateCountdown()
		const interval = setInterval(updateCountdown, 1000)
		return () => clearInterval(interval)
	}, [targetTime])

	return countdown
}
