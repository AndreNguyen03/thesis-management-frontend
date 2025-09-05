import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { Assistant } from '@/features/shared/ai-assistant'
import { useTest } from '@/hooks/useTest'

function App() {
	const [count, setCount] = useState(0)
	const { message } = useTest()

	return (
		<div className='p-4'>
			<h1 className='text-2xl font-bold'>Vite + React + TS Test</h1>
			<p>Count: {count}</p>
			<Button onClick={() => setCount((c) => c + 1)} />
			<Input />
			<Assistant />
			<p>{message}</p>
		</div>
	)
}

export default App
