import { useEffect, useState } from 'react'

export function CurrentTime() {
	const [now, setNow] = useState(new Date())

	useEffect(() => {
		const timer = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(timer)
	}, [])

	return <span className='font-semibold text-red-500'>{now.toLocaleString()}</span>
}
