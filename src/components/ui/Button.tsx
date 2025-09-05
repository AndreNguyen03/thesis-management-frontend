export function Button({ onClick }: { onClick: () => void }) {
	return (
		<button onClick={onClick} className='rounded bg-blue-500 px-4 py-2 text-white'>
			Click me
		</button>
	)
}
