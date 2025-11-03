import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CSVPreviewModalProps {
	isOpen: boolean
	onClose: () => void
	data: string[][]
}

export default function CSVPreviewModal({ isOpen, onClose, data }: CSVPreviewModalProps) {
	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
			<div className='w-full max-w-2xl rounded-lg bg-card shadow-lg'>
				<div className='flex items-center justify-between border-b border-border p-4'>
					<h2 className='text-lg font-semibold text-foreground'>Xem trước dữ liệu CSV</h2>
					<Button type='button' variant='ghost' size='sm' onClick={onClose} className='h-8 w-8 p-0'>
						<X className='h-4 w-4' />
					</Button>
				</div>

				<div className='overflow-x-auto p-4'>
					<table className='w-full text-sm'>
						<tbody>
							{data.map((row, rowIdx) => (
								<tr
									key={rowIdx}
									className={`border-b border-border/50 ${rowIdx === 0 ? 'bg-muted' : 'hover:bg-muted/50'}`}
								>
									{row.map((cell, cellIdx) => (
										<td
											key={cellIdx}
											className={`px-4 py-3 ${rowIdx === 0 ? 'font-semibold text-foreground' : 'text-foreground'}`}
										>
											{cell || '-'}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}
