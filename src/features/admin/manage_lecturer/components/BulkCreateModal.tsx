import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, Download, Eye } from 'lucide-react'
import { useCreateBatchLecturersMutation } from '@/services/lecturerApi'
import type { CreateBatchLecturerDto } from '@/models'
import * as XLSX from 'xlsx'
import { ScrollArea } from '@/components/ui/scroll-area'
import PreviewModal from './PreviewModal'

export interface LecturerRecord {
	name: string
	title: string
	faculty: string
	phone?: string
	status: 'pending' | 'success' | 'error'
	error?: string
}

interface BulkCreateLecturersProps {
	isOpen: boolean
	onClose: () => void
}

export default function BulkCreateLecturers({ isOpen, onClose }: BulkCreateLecturersProps) {
	const [fileName, setFileName] = useState<string | null>(null)
	const [allRows, setAllRows] = useState<string[][] | null>(null)
	const [records, setRecords] = useState<LecturerRecord[]>([])
	const [error, setError] = useState<string | null>(null)
	const [showPreview, setShowPreview] = useState(false)
	const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all')
	const [created, setCreated] = useState(false) // để disable nút sau khi tạo

	const fileInputRef = useRef<HTMLInputElement>(null)
	const [createBatchLecturers, { isLoading }] = useCreateBatchLecturersMutation()

	if (!isOpen) return null

	const resetState = () => {
		setFileName(null)
		setRecords([])
		setError(null)
		setShowPreview(false)
		setFilter('all')
	}

	const handleClose = () => {
		resetState()
		onClose()
	}

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (!files || files.length === 0) {
			setError('Không có file nào được chọn')
			return
		}

		const file = files[0]
		const isCSV = file.name.endsWith('.csv')
		const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')

		if (!isCSV && !isXLSX) {
			setError('Vui lòng chọn file CSV hoặc XLSX')
			return
		}

		setError(null)
		setFileName(file.name)

		const readFile = (file: File, isCSV: boolean) =>
			new Promise<string | ArrayBuffer>((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = () => {
					if (!reader.result) reject('File rỗng')
					else resolve(reader.result)
				}
				reader.onerror = (err) => reject(err)
				if (isCSV) reader.readAsText(file)
				else reader.readAsBinaryString(file)
			})

		try {
			const result = await readFile(file, isCSV)
			let rows: string[][] = []

			if (isCSV) {k
				const content = result as string
				rows = content
					.split('\n')
					.filter((line) => line.trim())
					.map((line) => line.split(',').map((cell) => cell.trim()))
			} else {
				const workbook = XLSX.read(result, { type: 'binary' })
				const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
				rows = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 })
			}

			setAllRows(rows)
		} catch (err: any) {
			setError('Không thể đọc file: ' + err.message)
		}
	}

	const handleDownloadTemplate = () => {
		const template = 'Họ tên,Học vị,Khoa,Số điện thoại\nNguyễn Văn A,ThS,CNTT,0987654321'
		const blob = new Blob([template], { type: 'text/csv' })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'mau-csv-giang-vien.csv'
		a.click()
		window.URL.revokeObjectURL(url)
	}

	const handleCreateLecturers = async (records: LecturerRecord[]) => {
		const dtos: CreateBatchLecturerDto[] = records.map((r) => ({
			fullName: r.name,
			title: r.title,
			facultyName: r.faculty,
			phone: r.phone
		}))

		const res = await createBatchLecturers(dtos).unwrap()

		return records.map((r) => {
			const ok = res.success.find((s) => s.fullName === r.name)
			if (ok) return { ...r, status: 'success' as const, error: undefined }

			const fail = res.failed.find((f) => f.fullName === r.name)
			return { ...r, status: 'error' as const, error: fail?.reason ?? 'Lỗi không xác định' }
		})
	}

	const handleStart = async () => {
		if (!allRows) return

		const rowsToCreate = allRows.slice(1) // bỏ header
		const parsedRecords = rowsToCreate
			.map(([name, title, faculty, phone]) => ({
				name,
				title,
				faculty,
				phone,
				status: 'pending' as const
			}))
			.filter((r) => r.name && r.title && r.faculty)

		if (parsedRecords.length === 0) {
			setError('File không chứa dữ liệu hợp lệ')
			return
		}

		setRecords(parsedRecords)
		const result = await handleCreateLecturers(parsedRecords)
		setRecords(result)
		setCreated(true)
	}

	const success = records.filter((r) => r.status === 'success')
	const failed = records.filter((r) => r.status === 'error')
	const filtered = filter === 'all' ? records : filter === 'success' ? success : failed

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
			<Card className='w-full max-w-3xl'>
				<CardHeader className='flex-row items-center justify-between'>
					<CardTitle className='text-lg font-semibold'>Tạo giảng viên hàng loạt</CardTitle>
					<Button variant='ghost' size='icon' onClick={handleClose}>
						<X className='h-5 w-5' />
					</Button>
				</CardHeader>

				<CardContent className='space-y-4'>
					{/* Upload */}
					<div className='flex gap-3'>
						<input
							type='file'
							accept='.csv,.xlsx,.xls'
							ref={fileInputRef}
							onChange={handleFileChange}
							className='hidden'
						/>
						<Button variant='outline' className='flex-1' onClick={() => fileInputRef.current?.click()}>
							Chọn file CSV/XLSX
						</Button>
						<Button variant='ghost' onClick={handleDownloadTemplate}>
							<Download className='h-4 w-4' /> Tải mẫu CSV
						</Button>
					</div>

					{/* Preview */}
					{fileName && (
						<div className='flex items-center justify-between rounded bg-primary/10 p-2'>
							<span>✓ {fileName}</span>
							{allRows && (
								<Button variant='ghost' size='sm' onClick={() => setShowPreview(true)}>
									<Eye className='h-4 w-4' /> Xem trước
								</Button>
							)}
						</div>
					)}

					{error && (
						<Alert variant='destructive'>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Start button */}
					<Button onClick={handleStart} disabled={isLoading || !allRows || created}>
						{isLoading ? 'Đang tạo...' : created ? 'Đã tạo xong' : 'Bắt đầu tạo tài khoản'}
					</Button>

					{/* Statistics */}
					{isLoading && records.length > 0 && (
						<div className='mt-2 flex gap-3'>
							<Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
								Tất cả ({records.length})
							</Button>
							<Button
								variant={filter === 'success' ? 'default' : 'outline'}
								onClick={() => setFilter('success')}
							>
								Thành công ({success.length})
							</Button>
							<Button
								variant={filter === 'failed' ? 'default' : 'outline'}
								onClick={() => setFilter('failed')}
							>
								Thất bại ({failed.length})
							</Button>
						</div>
					)}

					{/* Result table */}
					{isLoading && records.length > 0 && failed.length > 0 && (
						<Card className='mt-2 border'>
							<ScrollArea className='h-[300px] w-full'>
								<table className='w-full text-sm'>
									<thead className='sticky top-0 z-10 bg-muted'>
										<tr>
											<th className='px-4 py-2 text-left'>Tên</th>
											<th className='px-4 py-2 text-left'>Học vị</th>
											<th className='px-4 py-2 text-left'>Khoa</th>
											<th className='px-4 py-2 text-left'>SĐT</th>
											<th className='px-4 py-2 text-left'>Trạng thái</th>
										</tr>
									</thead>
									<tbody>
										{filtered.map((r, idx) => (
											<tr key={idx} className='border-t'>
												<td className='px-4 py-2'>{r.name}</td>
												<td className='px-4 py-2'>{r.title}</td>
												<td className='px-4 py-2'>{r.faculty}</td>
												<td className='px-4 py-2'>{r.phone || '-'}</td>
												<td
													className={`px-4 py-2 ${
														r.status === 'success' ? 'text-green-600' : 'text-red-600'
													}`}
												>
													{r.status === 'success' ? 'Thành công' : r.error || 'Thất bại'}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</ScrollArea>
						</Card>
					)}
					{isLoading && records.length > 0 && failed.length === 0 && (
						<div className='mt-2 text-center text-green-600'>Tất cả giảng viên đã được tạo thành công!</div>
					)}
				</CardContent>
			</Card>

			{allRows && <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} data={allRows} />}
		</div>
	)
}
