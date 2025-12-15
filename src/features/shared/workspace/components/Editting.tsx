import { useEffect, useState } from 'react'
import { getFileIcon } from './DocumentsPanel'
import { Button } from '@/components/ui'
import { Edit, TicketIcon, X } from 'lucide-react'
import { formatFileSize } from '@/utils/format-file-size'

const Editting = ({
	file,
	index,
	onRemoveDraftFile,
	isUploading,
	onEditting
}: {
	file: File
	index: number
	onRemoveDraftFile: () => void
	isUploading: boolean
	onEditting: (input: string) => void
}) => {
	const [isEditing, setEditting] = useState(false)

	// Get filename and extension
	const lastDotIndex = file.name.lastIndexOf('.')
	const originalName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name
	const extension = lastDotIndex !== -1 ? file.name.substring(lastDotIndex + 1) : ''

	const [editedName, setEditedName] = useState(originalName)
	const [backupName, setBackupName] = useState(file.name)
	return (
		<div
			key={file.name + index}
			className='group flex items-center gap-4 rounded-xl border border-border bg-card p-2 transition-shadow hover:shadow-md'
		>
			<div className='shrink-0 rounded-lg bg-secondary p-2'>{getFileIcon(file.type as any)}</div>

			<div className='min-w-0 flex-1'>
				<div className='flex items-center gap-2'>
					{isEditing ? (
						<>
							<input
								className='flex-1 rounded border border-border bg-background p-1 text-sm'
								value={editedName}
								onChange={(e) => setEditedName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										const newFileName = extension ? `${editedName}.${extension}` : editedName
										onEditting(newFileName.trim())
										setEditting(false)
									}
									if (e.key === 'Escape') {
										setEditedName(originalName)
										setEditting(false)
									}
								}}
								autoFocus
							/>
							{extension && <span className='text-xs text-muted-foreground'>.{extension}</span>}
							<Button
								size='sm'
								className='h-7'
								onMouseDown={(e) => {
									e.preventDefault()
									const newFileName = extension ? `${editedName}.${extension}` : editedName
									onEditting(newFileName)
									setEditting(false)
								}}
							>
								Lưu
							</Button>
							<Button
								size='sm'
								variant='outline'
								className='h-7'
								onClick={() => {
									setEditedName(originalName)
									setEditting(false)
									onEditting(backupName)
								}}
							>
								Hủy
							</Button>
						</>
					) : (
						<>
							<p className='truncate text-sm font-medium text-foreground'>{file.name}</p>
							<Edit
								onClick={() => {
									setBackupName(file.name)
									setEditting(true)
								}}
								className='h-4 w-4 cursor-pointer text-gray-400 hover:text-gray-500'
							/>
						</>
					)}
				</div>
				<div className='mt-1 flex items-center gap-3 text-muted-foreground'>
					<span className='text-[11px]'>{formatFileSize(file.size)}</span>
				</div>
			</div>

			<div className='flex items-center gap-1 transition-opacity'>
				<button
					onClick={onRemoveDraftFile}
					disabled={isUploading}
					className='rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
				>
					<X className='h-4 w-4' />
				</button>
			</div>
		</div>
	)
}

export default Editting
