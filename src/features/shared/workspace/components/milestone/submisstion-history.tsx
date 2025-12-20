import type { Submission } from "@/models/milestone.model"
import { FileText, History } from "lucide-react"

// --- History Component (New) ---
export const SubmissionHistoryList = ({ history }: { history: Submission[] }) => {
	if (!history || history.length === 0) return null
	return (
		<div className='mt-4 border-t border-slate-100 pt-4'>
			<h4 className='mb-3 flex items-center gap-2 text-xs font-bold uppercase text-slate-500'>
				<History className='h-3.5 w-3.5' /> Lịch sử nộp bài
			</h4>
			<div className='ml-1.5 space-y-3 border-l-2 border-slate-200 pl-2'>
				{history.map((sub, idx) => (
					<div key={idx} className='relative pl-4'>
						<div className='absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-slate-300'></div>
						<p className='mb-1 text-xs text-slate-500'>{sub.date}</p>
						<div className='flex items-center gap-2 rounded border border-slate-100 bg-slate-50 p-2 text-sm text-slate-700'>
							<FileText className='h-3.5 w-3.5 text-slate-400' />
							<span className='max-w-[150px] truncate'>{sub.files[0]?.name}</span>
						
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
