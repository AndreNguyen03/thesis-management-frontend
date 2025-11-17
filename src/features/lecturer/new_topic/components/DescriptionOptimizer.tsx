import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DescriptionOptimizerProps {
	currentDescription: string
	onOptimize: (optimizedDescription: string) => void
}

export function DescriptionOptimizer({ currentDescription, onOptimize }: DescriptionOptimizerProps) {
	const [open, setOpen] = useState(false)
	const [isOptimizing, setIsOptimizing] = useState(false)
	const [optimizedText, setOptimizedText] = useState('')
	const { toast } = useToast()

	const handleOptimize = async () => {
		if (!currentDescription.trim()) {
			toast({
				title: 'Lỗi',
				description: 'Vui lòng nhập mô tả trước khi tối ưu',
				variant: 'destructive'
			})
			return
		}

		setIsOptimizing(true)
		setOpen(true)

		// Simulate API call for optimization
		// In a real app, this would call an AI service
		setTimeout(() => {
			const optimized = `${currentDescription.trim()}\n\nĐây là phiên bản đã được tối ưu với cấu trúc rõ ràng hơn, ngữ pháp chuẩn xác và các điểm nhấn được làm nổi bật. Mô tả bao gồm các yêu cầu kỹ thuật, phạm vi nghiên cứu và kết quả mong đợi một cách có hệ thống.`
			setOptimizedText(optimized)
			setIsOptimizing(false)
		}, 1500)
	}

	const handleAccept = () => {
		onOptimize(optimizedText)
		setOpen(false)
		toast({
			title: 'Thành công',
			description: 'Đã áp dụng mô tả được tối ưu'
		})
	}

	const handleCancel = () => {
		setOpen(false)
		setOptimizedText('')
	}

	return (
		<>
			<Button
				type='button'
				variant='outline'
				onClick={handleOptimize}
				disabled={!currentDescription.trim()}
				className='whitespace-nowrap transition-colors hover:bg-secondary'
			>
				<Sparkles className='mr-2 h-4 w-4' />
				Tối ưu Description
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className='flex max-h-[80vh] max-w-4xl flex-col overflow-hidden bg-card'>
					<DialogHeader>
						<DialogTitle className='text-xl font-semibold'>So sánh mô tả</DialogTitle>
						<DialogDescription>
							Xem xét mô tả gốc và mô tả đã được tối ưu để quyết định áp dụng
						</DialogDescription>
					</DialogHeader>

					<div className='flex-1 overflow-y-auto'>
						<div className='grid gap-4 md:grid-cols-2'>
							<div className='space-y-2'>
								<h3 className='text-sm font-semibold text-muted-foreground'>Mô tả gốc</h3>
								<div className='min-h-[200px] rounded-lg border border-border bg-muted/50 p-4'>
									<p className='whitespace-pre-wrap text-sm'>{currentDescription}</p>
								</div>
							</div>

							<div className='space-y-2'>
								<div className='flex items-center gap-2'>
									<ArrowRight className='h-4 w-4 text-primary' />
									<h3 className='text-sm font-semibold text-primary'>Mô tả đã tối ưu</h3>
								</div>
								<div className='min-h-[200px] rounded-lg border border-primary/20 bg-secondary p-4'>
									{isOptimizing ? (
										<div className='flex h-full items-center justify-center'>
											<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary'></div>
										</div>
									) : (
										<p className='whitespace-pre-wrap text-sm'>{optimizedText}</p>
									)}
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className='gap-2'>
						<Button type='button' variant='outline' onClick={handleCancel} disabled={isOptimizing}>
							Hủy
						</Button>
						<Button
							type='button'
							onClick={handleAccept}
							disabled={isOptimizing}
							className='hover:bg-primary-dark bg-primary transition-colors'
						>
							Đồng ý áp dụng
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
