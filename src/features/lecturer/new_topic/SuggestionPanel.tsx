import { Check, Bookmark, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface Suggestion {
	vn: string
	en: string
	description?: string
	keywords?: { fields?: string[]; requirements?: string[] }
	// candidate matches mapped later
	candidateFields?: Array<{ id: string; name: string }>
	missingFields?: string[]
	candidateRequirements?: Array<{ id: string; name: string }>
	missingRequirements?: string[]
}

interface SuggestionPanelProps {
	suggestions: Suggestion[]
	onApply: (suggestion: Suggestion & { createMissing?: boolean }) => void | Promise<void>

	onClear: () => void
}

export function SuggestionPanel({ suggestions, onApply, onClear }: SuggestionPanelProps) {
	const [createMissing, setCreateMissing] = useState(false)
	const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({})
	const [appliedMap, setAppliedMap] = useState<Record<number, boolean>>({})

	// Reset applied state when suggestions change
	useEffect(() => {
		setAppliedMap({})
		setLoadingMap({})
	}, [suggestions])

	if (suggestions.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center py-8 text-center'>
				<div className='mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
					<Bookmark className='h-5 w-5 text-muted-foreground' />
				</div>
				<p className='text-sm font-medium text-foreground'>Chưa có gợi ý</p>
				<p className='mt-1 text-xs text-muted-foreground'>Sử dụng AI Generator để nhận gợi ý đề tài</p>
			</div>
		)
	}

	return (
		<div className='space-y-3'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Badge variant='secondary' className='text-xs'>
						{suggestions.length} gợi ý
					</Badge>
					<button
						type='button'
						onClick={() => setCreateMissing((s) => !s)}
						className={cn(
							'ml-2 rounded-full px-2 py-0.5 text-xs',
							createMissing ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
						)}
					>
						{createMissing ? 'Tạo mục thiếu: Bật' : 'Tạo mục thiếu: Tắt'}
					</button>
				</div>
				<Button
					variant='ghost'
					size='sm'
					onClick={onClear}
					className='h-7 text-xs text-muted-foreground hover:text-foreground'
				>
					<X className='mr-1 h-3 w-3' />
					Xóa tất cả
				</Button>
			</div>

			<div className='space-y-2'>
				{suggestions.map((suggestion, index) => (
					<div
						key={index}
						className={cn(
							'group rounded-lg border bg-card p-3 transition-all',
							'hover:border-primary/30 hover:shadow-sm',
							'animate-slide-up'
						)}
						style={{ animationDelay: `${index * 100}ms` }}
					>
						<div className='space-y-2'>
							<div>
								<p className='mb-1 text-xs font-medium text-muted-foreground'>Tiếng Việt</p>
								<div className='flex items-center gap-2'>
									<p className='text-sm leading-relaxed text-foreground'>{suggestion.vn}</p>
									{appliedMap[index] && (
										<Badge variant='secondary' className='text-xs'>
											Đã áp dụng
										</Badge>
									)}
								</div>
							</div>
							<div>
								<p className='mb-1 text-xs font-medium text-muted-foreground'>English</p>
								<p className='text-sm leading-relaxed text-muted-foreground'>{suggestion.en}</p>
							</div>

							{suggestion.description && (
								<div className='mt-2'>
									<p className='mb-1 text-xs font-medium text-muted-foreground'>Mô tả (AI gợi ý)</p>
									<div
										className='prose max-h-36 overflow-auto text-sm text-muted-foreground'
										dangerouslySetInnerHTML={{ __html: suggestion.description }}
									/>
								</div>
							)}

							{/* Mapping preview */}
							{(suggestion.candidateFields?.length || suggestion.missingFields?.length) && (
								<div className='mt-2'>
									<p className='mb-1 text-xs font-medium text-muted-foreground'>Lĩnh vực (gợi ý)</p>
									<div className='flex flex-wrap gap-2'>
										{suggestion.candidateFields?.map((f) => (
											<span key={f.id} className='rounded-md bg-muted/60 px-2 py-1 text-xs'>
												{f.name}
											</span>
										))}
										{suggestion.missingFields?.map((m) => (
											<span key={m} className='rounded-md bg-warning/20 px-2 py-1 text-xs'>
												+ {m}
											</span>
										))}
									</div>
								</div>
							)}

							{(suggestion.candidateRequirements?.length || suggestion.missingRequirements?.length) && (
								<div className='mt-2'>
									<p className='mb-1 text-xs font-medium text-muted-foreground'>
										Yêu cầu kỹ năng (gợi ý)
									</p>
									<div className='flex flex-wrap gap-2'>
										{suggestion.candidateRequirements?.map((r) => (
											<span key={r.id} className='rounded-md bg-muted/60 px-2 py-1 text-xs'>
												{r.name}
											</span>
										))}
										{suggestion.missingRequirements?.map((m) => (
											<span key={m} className='rounded-md bg-warning/20 px-2 py-1 text-xs'>
												+ {m}
											</span>
										))}
									</div>
								</div>
							)}
						</div>

						<div className='mt-3 flex items-center gap-1.5 border-t pt-3'>
							<Button
								size='sm'
								onClick={async () => {
									setLoadingMap((m) => ({ ...m, [index]: true }))
									try {
										await Promise.resolve(onApply({ ...suggestion, createMissing }))
										// Chỉ set applied khi thành công (không throw error)
										setAppliedMap((m) => ({ ...m, [index]: true }))
									} catch (err) {
										// Nếu reject (đang chờ confirm) hoặc lỗi thực sự
										// Không set appliedMap - để user có thể bấm lại
										console.log('Apply suggestion cancelled or waiting for confirmation')
									} finally {
										setLoadingMap((m) => ({ ...m, [index]: false }))
									}
								}}
								disabled={!!loadingMap[index] || !!appliedMap[index]}
								className='h-7 flex-1 gap-1.5 text-xs'
							>
								{appliedMap[index] ? (
									<>
										<Check className='h-3 w-3' />
										Đã áp dụng
									</>
								) : loadingMap[index] ? (
									'Đang áp dụng...'
								) : (
									<>
										<Check className='h-3 w-3' />
										Áp dụng
									</>
								)}
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
