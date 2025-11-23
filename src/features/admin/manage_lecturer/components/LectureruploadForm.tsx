import { useState } from 'react'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Download, Eye, X } from 'lucide-react'
import CSVPreviewModal from './PreviewModal'

export interface LecturerRecord {
	name: string
	email: string
	department: string
	code: string
	status: 'pending' | 'processing' | 'success' | 'error'
	error?: string
}

interface LecturerUploadFormProps {
	onFileSelect: (data: string) => void
	onProcessStart: (records: LecturerRecord[]) => void
	onClose: () => void
}

export default function LecturerUploadForm({ onFileSelect, onProcessStart, onClose }: LecturerUploadFormProps) {
	const [fileName, setFileName] = useState<string | null>(null)
	const [csvContent, setCsvContent] = useState<string | null>(null)
	const [previewData, setPreviewData] = useState<string[][] | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [showPreview, setShowPreview] = useState(false)

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		if (!file.name.endsWith('.csv')) {
			setError('Vui lòng chọn file CSV')
			return
		}
		setError(null)
		setFileName(file.name)

		const reader = new FileReader()
		reader.onload = (event) => {
			const content = event.target?.result as string
			setCsvContent(content)
			onFileSelect(content)
			const lines = content.split('\n').filter((line) => line.trim())
			const rows = lines.map((line) => line.split(',').map((cell) => cell.trim()))
			setPreviewData(rows.slice(0, 6)) // header + 5 rows
		}
		reader.readAsText(file)
	}

	const handleDownloadTemplate = () => {
		const template =
			'Họ tên,Email,Khoa,Mã giảng viên\nNguyễn Văn A,nguyena@example.com,CNTT,GV001\nTrần Thị B,tranb@example.com,QTKD,GV002'
		const blob = new Blob([template], { type: 'text/csv' })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'mau-csv-giang-vien.csv'
		a.click()
		window.URL.revokeObjectURL(url)
	}

	const handleProcessStart = () => {
		if (!csvContent) {
			setError('Vui lòng chọn file CSV')
			return
		}

		const lines = csvContent
			.split('\n')
			.filter((line) => line.trim())
			.slice(1)
		const records: LecturerRecord[] = lines
			.map((line) => {
				const [name, email, department, code] = line.split(',').map((cell) => cell.trim())
				return { name, email, department, code, status: 'pending' as const }
			})
			.filter((r) => r.name && r.email)

		if (records.length === 0) {
			setError('File CSV không chứa dữ liệu hợp lệ')
			return
		}

		onProcessStart(records)
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
			<div className='flex w-full max-w-2xl flex-col rounded-lg bg-card shadow-lg'>
				{/* Header */}
				<div className='flex items-center justify-between border-b border-border p-4'>
					<h2 className='text-lg font-semibold text-foreground'>Tạo hàng loạt</h2>
					<Button type='button' variant='ghost' size='sm' onClick={onClose} className='h-8 w-8 p-0'>
						<X className='h-4 w-4' />
					</Button>
				</div>

				{/* Content */}
				<CardContent className='flex-1 space-y-4 overflow-auto p-4'>
					{/* Hướng dẫn */}
					<div className='rounded-lg border border-border/20 bg-muted p-3 text-sm text-foreground'>
						<p className='text-lg'>
							Tải lên file CSV chứa danh sách giảng viên để tạo tài khoản hàng loạt.
						</p>
						<p className='mt-1 text-muted-foreground'>
							File CSV cần có các cột:{' '}
							<span className='font-medium'>Họ tên, Email, Khoa, Mã giảng viên</span>. Bạn có thể tải{' '}
							<span className='cursor-pointer font-medium underline' onClick={handleDownloadTemplate}>
								mẫu CSV
							</span>{' '}
							để làm theo.
						</p>
					</div>

					{/* Upload */}
					<div className='flex flex-col gap-3 sm:flex-row'>
						<label className='flex-1'>
							<input type='file' accept='.csv' onChange={handleFileChange} className='hidden' />
							<Button
								type='button'
								variant='outline'
								className='w-full cursor-pointer bg-transparent'
								asChild
							>
								<span>Chọn file CSV</span>
							</Button>
						</label>

						<Button type='button' variant='ghost' onClick={handleDownloadTemplate} className='gap-2'>
							<Download className='h-4 w-4' />
							<span>Tải mẫu CSV</span>
						</Button>
					</div>

					{/* File đã chọn */}
					{fileName && (
						<div className='flex items-center justify-between rounded-lg bg-primary/10 p-3 text-sm'>
							<span className='text-foreground'>✓ {fileName}</span>
							{previewData && previewData.length > 1 && (
								<Button
									type='button'
									variant='ghost'
									size='sm'
									onClick={() => setShowPreview(true)}
									className='gap-2'
								>
									<Eye className='h-4 w-4' />
									<span>Xem trước</span>
								</Button>
							)}
						</div>
					)}

					{/* Error */}
					{error && (
						<Alert variant='destructive'>
							<AlertCircle className='h-4 w-4' />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
				</CardContent>

				{/* Footer */}
				{fileName && (
					<div className='flex justify-end border-t border-border p-4'>
						<Button onClick={handleProcessStart} size='lg' className='gap-2'>
							Bắt đầu tạo tài khoản
						</Button>
					</div>
				)}
			</div>

			{previewData && (
				<CSVPreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} data={previewData} />
			)}
		</div>
	)
}
