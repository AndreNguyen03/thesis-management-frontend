export function Expertise({ expertise }: { expertise: string[] }) {
	return (
		<div className='flex flex-wrap gap-2'>
			{expertise.map((e) => (
				<span key={e} className='rounded bg-gray-200 px-2 py-1 text-xs'>
					{e}
				</span>
			))}
		</div>
	)
}
