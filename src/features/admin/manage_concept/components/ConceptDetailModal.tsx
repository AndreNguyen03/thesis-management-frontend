import { ConceptCandidate } from '../types'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface ConceptDetailModalProps {
	candidate: ConceptCandidate | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ConceptDetailModal({ candidate, open, onOpenChange }: ConceptDetailModalProps) {
	if (!candidate) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-h-[90vh] max-w-3xl'>
				<DialogHeader>
					<DialogTitle>Chi tiết Concept Candidate</DialogTitle>
					<DialogDescription>
						{formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true, locale: vi })}
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className='max-h-[70vh]'>
					<div className='space-y-6 pr-4'>
						{/* Basic Info */}
						<div>
							<h3 className='mb-3 text-sm font-medium text-gray-700'>Thông tin cơ bản</h3>
							<div className='space-y-2 rounded-lg bg-gray-50 p-4'>
								<div className='grid grid-cols-3 gap-2'>
									<span className='text-sm text-gray-500'>Canonical:</span>
									<span className='col-span-2 font-mono font-semibold'>{candidate.canonical}</span>
								</div>
								<div className='grid grid-cols-3 gap-2'>
									<span className='text-sm text-gray-500'>Tần suất:</span>
									<span className='col-span-2'>
										<Badge variant='secondary'>{candidate.frequency}</Badge>
									</span>
								</div>
								<div className='grid grid-cols-3 gap-2'>
									<span className='text-sm text-gray-500'>Trạng thái:</span>
									<span className='col-span-2'>
										<Badge>{candidate.status}</Badge>
									</span>
								</div>
							</div>
						</div>

						{/* Variants */}
						<div>
							<h3 className='mb-3 text-sm font-medium text-gray-700'>
								Biến thể ({candidate.variants.length})
							</h3>
							<div className='flex flex-wrap gap-2'>
								{candidate.variants.map((v, idx) => (
									<Badge key={idx} variant='outline'>
										{v}
									</Badge>
								))}
							</div>
						</div>

						<Separator />

						{/* Suggestions */}
						{(candidate.suggestedLabel || candidate.suggestedParent) && (
							<>
								<div>
									<h3 className='mb-3 text-sm font-medium text-gray-700'>Gợi ý tự động</h3>
									<div className='space-y-2 rounded-lg bg-blue-50 p-4'>
										{candidate.suggestedLabel && (
											<div className='grid grid-cols-3 gap-2'>
												<span className='text-sm text-gray-600'>Label:</span>
												<span className='col-span-2 font-medium'>
													{candidate.suggestedLabel}
												</span>
											</div>
										)}
										{candidate.suggestedParent && (
											<div className='grid grid-cols-3 gap-2'>
												<span className='text-sm text-gray-600'>Parent:</span>
												<span className='col-span-2 font-mono text-sm'>
													{candidate.suggestedParent}
												</span>
											</div>
										)}
										{candidate.suggestedAliases && candidate.suggestedAliases.length > 0 && (
											<div className='grid grid-cols-3 gap-2'>
												<span className='text-sm text-gray-600'>Aliases:</span>
												<div className='col-span-2 flex flex-wrap gap-1'>
													{candidate.suggestedAliases.map((a, idx) => (
														<Badge key={idx} variant='outline' className='text-xs'>
															{a}
														</Badge>
													))}
												</div>
											</div>
										)}
									</div>
								</div>
								<Separator />
							</>
						)}

						{/* Examples */}
						<div>
							<h3 className='mb-3 text-sm font-medium text-gray-700'>
								Ví dụ sử dụng ({candidate.examples.length})
							</h3>
							<div className='space-y-2'>
								{candidate.examples.map((example, idx) => (
									<div key={idx} className='rounded-lg bg-gray-50 p-3 text-sm'>
										<div className='mb-1 flex items-center gap-2'>
											<Badge variant='outline' className='text-xs'>
												{example.profileType}
											</Badge>
											<span className='font-mono text-xs text-gray-500'>{example.profileId}</span>
										</div>
										<div className='flex items-center gap-2'>
											<span className='text-gray-600'>Từ field:</span>
											<Badge variant='secondary' className='text-xs'>
												{example.source}
											</Badge>
										</div>
										<div className='mt-1'>
											<span className='text-gray-600'>Token:</span>
											<span className='ml-2 font-mono font-medium'>{example.token}</span>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Rejection Reason (if rejected) */}
						{candidate.rejectionReason && (
							<>
								<Separator />
								<div>
									<h3 className='mb-3 text-sm font-medium text-red-600'>Lý do từ chối</h3>
									<div className='rounded-lg bg-red-50 p-3 text-sm text-red-900'>
										{candidate.rejectionReason}
									</div>
								</div>
							</>
						)}

						{/* Approval Info (if approved) */}
						{candidate.approvedConceptKey && (
							<>
								<Separator />
								<div>
									<h3 className='mb-3 text-sm font-medium text-green-600'>Đã phê duyệt</h3>
									<div className='rounded-lg bg-green-50 p-3'>
										<div className='grid grid-cols-3 gap-2 text-sm'>
											<span className='text-gray-600'>Concept Key:</span>
											<span className='col-span-2 font-mono font-medium text-green-900'>
												{candidate.approvedConceptKey}
											</span>
										</div>
										{candidate.approvedAt && (
											<div className='mt-2 grid grid-cols-3 gap-2 text-sm'>
												<span className='text-gray-600'>Thời gian:</span>
												<span className='col-span-2 text-gray-700'>
													{formatDistanceToNow(new Date(candidate.approvedAt), {
														addSuffix: true,
														locale: vi
													})}
												</span>
											</div>
										)}
									</div>
								</div>
							</>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}
