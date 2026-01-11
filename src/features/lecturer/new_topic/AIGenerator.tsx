import { useState } from 'react'
import { toast } from '@/hooks/use-toast'
import { Sparkles, Loader2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/textarea'
import { useGenerateTopicMutation } from '@/services/chatbotApi'
import type { GeneratedSuggestion as GeneratedSuggestionType } from '@/models/chatbot-ai.model'

type GeneratedSuggestion = GeneratedSuggestionType

interface AIGeneratorProps {
	onGenerate: (titles: GeneratedSuggestion[]) => void
	isLoading?: boolean
	topicType?: string
}

export const AIGenerator = ({ onGenerate, isLoading, topicType }: AIGeneratorProps) => {
	const [prompt, setPrompt] = useState('')
	const [generateTopic] = useGenerateTopicMutation()

	const handleGenerate = async () => {
		if (!prompt.trim()) return

		try {
			const res = await generateTopic({ prompt, limit: 5 }).unwrap()
			const items: GeneratedSuggestion[] = (res?.suggestions ?? []).map((s: any) => ({
				vn: s.titleVN ?? s.title ?? s.vn ?? '',
				en: s.titleEN ?? s.title_en ?? s.en ?? '',
				description: s.description ?? s.desc ?? s.body,
				keywords: s.keywords ?? s.metadata
			}))

			onGenerate(items)
			return
		} catch (err) {
			console.error('generateTopic failed', err)
			toast({
				title: 'Lỗi kết nối AI',
				description: 'Không thể kết nối tới dịch vụ AI, sử dụng gợi ý mẫu.',
				variant: 'destructive'
			})

			const words = prompt
				.toLowerCase()
				.replace(/[^a-z0-9\sàáâãèéêìíòóôõùúýỳỷưăâđơếộ]/gi, ' ')
				.split(/\s+/)
				.filter(Boolean)

			const keywords = words.slice(0, 4)

			onGenerate([
				{
					vn: `${prompt} - Phương án 1`,
					en: `${prompt} - Option 1`,
					description: `<p>${prompt} - Mô tả mẫu</p>`,
					keywords: { fields: keywords, requirements: keywords.slice(0, 2) }
				}
			])
		}
	}

	// ✅ JSX phải return ở đây
	return (
		<div className='space-y-3'>
			<div className='flex items-center gap-2'>
				<div className='ai-gradient flex h-8 w-8 items-center justify-center rounded-lg'>
					<Sparkles className='h-4 w-4 text-blue-400' />
				</div>
				<div>
					<h3 className='text-sm font-semibold'>AI Gợi ý</h3>
					<p className='text-xs text-muted-foreground'>Mô tả ý tưởng để nhận gợi ý</p>
				</div>
			</div>

			<Textarea
				value={prompt}
				onChange={(e) => setPrompt(e.target.value)}
				placeholder='Ví dụ: Xây dựng hệ thống gợi ý đề tài bằng AI...'
				className='min-h-[80px]'
			/>

			<Button
				onClick={handleGenerate}
				disabled={isLoading || !prompt.trim()}
				className='w-full gap-2'
			>
				{isLoading ? (
					<>
						<Loader2 className='h-4 w-4 animate-spin' />
						Đang tạo...
					</>
				) : (
					<>
						<Wand2 className='h-4 w-4' />
						Tạo gợi ý
					</>
				)}
			</Button>
		</div>
	)
}
