import { useState } from 'react'
import { ConceptCandidate } from '../types'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface ConceptApprovalDialogProps {
	candidate: ConceptCandidate | null
	open: boolean
	onOpenChange: (open: boolean) => void
	onApprove: (data: {
		key: string
		label: string
		aliases: string[]
		parent?: string
		description?: string
	}) => Promise<void>
}

export function ConceptApprovalDialog({ candidate, open, onOpenChange, onApprove }: ConceptApprovalDialogProps) {
	const [key, setKey] = useState('')
	const [label, setLabel] = useState('')
	const [aliases, setAliases] = useState('')
	const [parent, setParent] = useState('')
	const [description, setDescription] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Auto-fill từ suggestions khi candidate thay đổi
	useState(() => {
		if (candidate) {
			setLabel(candidate.suggestedLabel || candidate.canonical)
			setParent(candidate.suggestedParent || '')
			setAliases((candidate.suggestedAliases || candidate.variants).join(', '))

			// Generate key từ parent + label
			if (candidate.suggestedParent && candidate.suggestedLabel) {
				const normalizedLabel = candidate.suggestedLabel
					.toLowerCase()
					.replace(/[^a-z0-9\s]/g, '')
					.trim()
					.replace(/\s+/g, '_')
				setKey(`${candidate.suggestedParent}.${normalizedLabel}`)
			}
		}
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			await onApprove({
				key,
				label,
				aliases: aliases
					.split(',')
					.map((a) => a.trim())
					.filter(Boolean),
				parent: parent || undefined,
				description: description || undefined
			})

			// Reset form
			setKey('')
			setLabel('')
			setAliases('')
			setParent('')
			setDescription('')
			onOpenChange(false)
		} catch (error) {
			console.error('Approve failed:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!candidate) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Phê duyệt Concept</DialogTitle>
					<DialogDescription>Xác nhận thông tin và thêm concept mới vào ontology</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4'>
					{/* Candidate Info */}
					<div className='space-y-2 rounded-lg bg-gray-50 p-4'>
						<div className='flex items-center justify-between'>
							<span className='text-sm font-medium text-gray-700'>Canonical:</span>
							<span className='font-mono font-semibold'>{candidate.canonical}</span>
						</div>
						<div className='flex items-center justify-between'>
							<span className='text-sm font-medium text-gray-700'>Tần suất:</span>
							<Badge variant='secondary'>{candidate.frequency}</Badge>
						</div>
						{candidate.variants.length > 1 && (
							<div>
								<span className='text-sm font-medium text-gray-700'>Variants:</span>
								<div className='mt-1 flex flex-wrap gap-1'>
									{candidate.variants.map((v, idx) => (
										<Badge key={idx} variant='outline' className='text-xs'>
											{v}
										</Badge>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Form Fields */}
					<div className='space-y-4'>
						<div>
							<Label htmlFor='key'>
								Concept Key <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='key'
								value={key}
								onChange={(e) => setKey(e.target.value)}
								placeholder='it.ai.deep_learning'
								className='font-mono'
								required
							/>
							<p className='mt-1 text-xs text-gray-500'>Format: parent.child_name (snake_case)</p>
						</div>

						<div>
							<Label htmlFor='label'>
								Label <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='label'
								value={label}
								onChange={(e) => setLabel(e.target.value)}
								placeholder='Deep Learning'
								required
							/>
						</div>

						<div>
							<Label htmlFor='parent'>Parent Concept</Label>
							<Input
								id='parent'
								value={parent}
								onChange={(e) => setParent(e.target.value)}
								placeholder='it.ai'
								className='font-mono'
							/>
						</div>

						<div>
							<Label htmlFor='aliases'>Aliases (phân cách bằng dấu phẩy)</Label>
							<Input
								id='aliases'
								value={aliases}
								onChange={(e) => setAliases(e.target.value)}
								placeholder='dl, deep neural network, DNN'
							/>
						</div>

						<div>
							<Label htmlFor='description'>Mô tả</Label>
							<Textarea
								id='description'
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder='Mô tả ngắn gọn về concept...'
								rows={3}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
							Hủy
						</Button>
						<Button type='submit' disabled={isSubmitting}>
							{isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
							Phê duyệt
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
