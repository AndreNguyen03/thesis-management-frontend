import { useState } from 'react'

import { Button } from '@/components/ui/button'
import LecturerUploadForm from './LectureruploadForm'
import CSVPreviewModal from './CSVPreviewModal'
import LecturerProgressTable from './LecturerProgressTable'
import LecturerSummary from './LecturerSummary'

export interface LecturerRecord {
	name: string
	email: string
	department: string
	code: string
	status: 'pending' | 'processing' | 'success' | 'error'
	error?: string
}

interface MultiStepModalProps {
	isOpen: boolean
	onClose: () => void
}

export function BulkCreateModal({ isOpen, onClose }: MultiStepModalProps) {
	const [step, setStep] = useState(1)
	const [csvContent, setCsvContent] = useState<string | null>(null)
	const [records, setRecords] = useState<LecturerRecord[]>([])

	if (!isOpen) return null

	const handleFileSelect = (content: string) => {
		setCsvContent(content)
	}

	const handleProcessStart = (parsedRecords: LecturerRecord[]) => {
		setRecords(parsedRecords)
		setStep(3)

		// Simulate processing
		parsedRecords.forEach((r, idx) => {
			setTimeout(() => {
				setRecords((prev) =>
					prev.map((rec, i) =>
						i === idx
							? {
									...rec,
									status: Math.random() > 0.2 ? 'success' : 'error',
									error: Math.random() > 0.2 ? undefined : 'Lỗi tạo tài khoản'
								}
							: rec
					)
				)

				// Khi tất cả xong, chuyển sang step 4
				if (idx === parsedRecords.length - 1) {
					setTimeout(() => setStep(4), 500)
				}
			}, idx * 500)
		})
	}

	const handleNextStep = () => {
		if (step === 1 && csvContent) setStep(2)
	}

	const handleBackStep = () => {
		setStep((prev) => Math.max(prev - 1, 1))
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
			<div className='max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-card shadow-lg'>
				{/* Step content */}
				{step === 1 && (
					<div className='p-4'>
						<LecturerUploadForm
							onFileSelect={handleFileSelect}
							onProcessStart={handleProcessStart}
							onClose={onClose}
						/>
						{csvContent && (
							<Button onClick={handleNextStep} className='mt-4 w-full'>
								Tiếp theo
							</Button>
						)}
					</div>
				)}

				{step === 2 && csvContent && (
					<div className='p-4'>
						<CSVPreviewModal
							isOpen={true}
							onClose={() => setStep(1)}
							data={csvContent.split('\n').map((line) => line.split(',').map((cell) => cell.trim()))}
						/>
						<div className='mt-4 flex gap-2'>
							<Button onClick={handleBackStep} className='flex-1'>
								Quay lại
							</Button>
							<Button onClick={() => setStep(3)} className='flex-1'>
								Bắt đầu tạo tài khoản
							</Button>
						</div>
					</div>
				)}

				{step === 3 && records.length > 0 && (
					<div className='p-4'>
						<LecturerProgressTable lecturers={records} />
					</div>
				)}

				{step === 4 && (
					<div className='p-4'>
						<LecturerSummary
							successCount={records.filter((r) => r.status === 'success').length}
							errorCount={records.filter((r) => r.status === 'error').length}
							lecturers={records}
							onClose={onClose}
						/>
					</div>
				)}
			</div>
		</div>
	)
}
