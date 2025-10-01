export function BackButton({ onClick }: { onClick: () => void }) {
	return (
		<button onClick={onClick} className='mb-4 flex items-center gap-2 text-blue-600'>
			← Quay lại
		</button>
	)
}
