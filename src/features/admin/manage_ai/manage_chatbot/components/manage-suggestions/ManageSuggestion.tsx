import { Button } from '@/components/ui'
import { Switch } from '@/components/ui/switch'
import type { GetQuerySuggestionDto } from '@/models/chatbot-version'
import { Check, Loader, Trash2, X } from 'lucide-react'
import { useState } from 'react'

export const ManageSuggestion = ({
	suggestion,
	isMultiChoice,
	selectionIds,
	setSelectionIds,
	handleToggleSuggestion,
	handleDeleteSuggestion,
	handleEditSuggestion,
	isLoadingEditting
}: {
	suggestion: GetQuerySuggestionDto
	isMultiChoice: boolean
	selectionIds: string[]
	setSelectionIds: React.Dispatch<React.SetStateAction<string[]>>
	handleToggleSuggestion: (suggestion: GetQuerySuggestionDto) => void
	handleDeleteSuggestion: (id: string) => void
	handleEditSuggestion: (suggestionId: string, content: string) => Promise<boolean>
	isLoadingEditting?: boolean
}) => {
	const [isEditting, setIsEditing] = useState<boolean>(false)
	const [editedContent, setEditedContent] = useState<string>(suggestion.content)
	return (
		<div
			key={suggestion._id}
			className='group flex items-center justify-between gap-10 rounded-lg border p-3 hover:bg-accent'
		>
			<div className='flex w-fit min-w-[500px] items-center gap-3'>
				<Switch checked={suggestion.enabled} onCheckedChange={() => handleToggleSuggestion(suggestion)} />
				{isEditting ? (
					<>
						<input
							className='w-full'
							value={editedContent}
							onChange={(e) => setEditedContent(e.target.value)}
						/>
						{isLoadingEditting ? (
							<Loader className='h-5 w-5 animate-spin' />
						) : (
							<button
								onClick={async () => {
									if (await handleEditSuggestion(suggestion._id, editedContent)) {
										setIsEditing(false)
									}
								}}
								className='rounded-sm bg-green-500 disabled:bg-gray-600'
								disabled={isLoadingEditting || editedContent.trim() === suggestion.content.trim()}
							>
								<Check className='h-6 w-6 p-1 font-semibold text-white' />
							</button>
						)}
						<button
							onClick={() => {
								setIsEditing(false)
								setEditedContent(suggestion.content)
							}}
						>
							<X className='h-6 w-6 rounded-sm bg-red-500 p-1 font-semibold text-white' />
						</button>
					</>
				) : (
					<p
						className='cursor-pointer p-2 text-sm hover:bg-slate-100'
						onDoubleClick={() => setIsEditing(true)}
					>
						{suggestion.content}
					</p>
				)}
			</div>

			{isMultiChoice ? (
				<input
					type='checkbox'
					checked={selectionIds.includes(suggestion._id)}
					onChange={(e) => {
						if (e.target.checked) {
							setSelectionIds([...selectionIds, suggestion._id])
						} else {
							setSelectionIds(selectionIds.filter((id) => id !== suggestion._id))
						}
					}}
				/>
			) : (
				<div className='flex items-center gap-2 opacity-0 group-hover:opacity-100'>
					<Button
						size='sm'
						variant='ghost'
						className='hover:text-red-600'
						onClick={() => handleDeleteSuggestion(suggestion._id)}
					>
						<Trash2 className='h-4 w-4' />
					</Button>
				</div>
			)}
		</div>
	)
}

export default ManageSuggestion
