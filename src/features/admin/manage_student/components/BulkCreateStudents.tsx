/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, Download, Eye, CheckCircle, XCircle, Upload, FileText } from 'lucide-react'
import { useCreateBatchStudentsMutation } from '@/services/studentApi'
import type { CreateBatchStudentDto } from '@/models'
import * as XLSX from 'xlsx'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import PreviewModal from './PreviewModal'

export interface StudentRecord {
	fullName: string
	studentCode: string
	className: string
	major: string
	faculty: string
	phone?: string
	email?: string
	status: 'pending' | 'success' | 'error'
	error?: string
}

interface BulkCreateStudentsProps {
	isOpen: boolean
	onClose: () => void
}

export function BulkCreateStudents({ isOpen, onClose }: BulkCreateStudentsProps) {
	const [fileName, setFileName] = useState<string | null>(null)
	const [allRows, setAllRows] = useState<string[][] | null>(null)
	const [records, setRecords] = useState<StudentRecord[]>([])
	const [error, setError] = useState<string | null>(null)
	const [showPreview, setShowPreview] = useState(false)
	const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all')
	const [created, setCreated] = useState(false)
	const [step, setStep] = useState<'upload' | 'results'>('upload') // Track steps for better flow

	const fileInputRef = useRef<HTMLInputElement>(null)
	const [createBatchStudents, { isLoading }] = useCreateBatchStudentsMutation()

	if (!isOpen) return null

	const resetState = () => {
		setFileName(null)
		setRecords([])
		setError(null)
		setShowPreview(false)
		setFilter('all')
		setCreated(false)
		setStep('upload')
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

			if (isCSV) {
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
		const template =
			'Họ tên,Mã sinh viên,Lớp,Chuyên ngành,Khoa,Số điện thoại,Email\nNguyễn Văn A,SV001,Lớp 1,CNTT,CNTT,0987654321,example@email.com'
		const blob = new Blob([template], { type: 'text/csv' })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'mau-csv-sinh-vien.csv'
		a.click()
		window.URL.revokeObjectURL(url)
	}

	const handleCreateStudents = async (records: StudentRecord[]) => {
		const dtos: CreateBatchStudentDto[] = records.map((r) => ({
			fullName: r.fullName,
			studentCode: r.studentCode,
			class: r.className,
			major: r.major,
			facultyName: r.faculty,
			phone: r.phone,
			email: r.email,
			isActive: true
		}))

		const res = await createBatchStudents(dtos).unwrap()

		return records.map((r) => {
			const ok = res.success.find((s) => s.studentCode === r.studentCode)
			if (ok) return { ...r, status: 'success' as const, error: undefined }

			const fail = res.failed.find((f) => f.studentCode === r.studentCode)
			return { ...r, status: 'error' as const, error: fail?.reason ?? 'Lỗi không xác định' }
		})
	}

	const handleStart = async () => {
		if (!allRows) return

		const rowsToCreate = allRows.slice(1) // bỏ header
		const parsedRecords = rowsToCreate
			.map(([fullName, studentCode, className, major, faculty, phone, email]) => ({
				fullName,
				studentCode,
				className,
				major,
				faculty,
				phone,
				email,
				status: 'pending' as const
			}))
			.filter((r) => r.fullName && r.studentCode && r.className && r.major && r.faculty)

		if (parsedRecords.length === 0) {
			setError('File không chứa dữ liệu hợp lệ')
			return
		}

		setRecords(parsedRecords)
		const result = await handleCreateStudents(parsedRecords)
		setRecords(result)
		setCreated(true)
		setStep('results')
	}

	const successCount = records.filter((r) => r.status === 'success').length
	const failedCount = records.filter((r) => r.status === 'error').length
	const filteredRecords =
		filter === 'all'
			? records
			: filter === 'success'
				? records.filter((r) => r.status === 'success')
				: records.filter((r) => r.status === 'error')

	const getStatusBadge = (record: StudentRecord) => {
		if (record.status === 'success') {
			return (
				<Badge
					variant='default'
					className='h-auto border-green-200 bg-green-100 px-1.5 py-0.5 text-xs text-green-800'
				>
					<CheckCircle className='mr-1 h-2.5 w-2.5' /> Thành công
				</Badge>
			)
		}
		return (
			<Badge
				variant='destructive'
				className='h-auto border-red-200 bg-red-100 px-1.5 py-0.5 text-xs text-red-800'
			>
				<XCircle className='mr-1 h-2.5 w-2.5' /> {record.error || 'Thất bại'}
			</Badge>
		)
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
			<Card className='flex max-h-[90vh] w-full max-w-4xl flex-col p-0'>
				<CardHeader className='flex-shrink-0 flex-row items-center justify-between'>
					<CardTitle className='text-lg font-semibold'>
						{step === 'upload' ? 'Tạo sinh viên hàng loạt' : 'Kết quả tạo sinh viên'}
					</CardTitle>
					<Button variant='ghost' size='icon' onClick={handleClose}>
						<X className='h-5 w-5' />
					</Button>
				</CardHeader>

				<Separator />

				<CardContent className='flex min-h-0 flex-1 flex-col p-0'>
					{step === 'upload' && (
						<div className='space-y-6 p-6'>
							{/* Upload Section */}
							<div className='space-y-2'>
								<h3 className='flex items-center font-medium'>
									<Upload className='mr-2 h-4 w-4' /> Tải lên file
								</h3>
								<p className='text-sm text-muted-foreground'>
									Chọn file CSV hoặc Excel chứa danh sách sinh viên.
								</p>
								<div className='flex gap-3'>
									<input
										type='file'
										accept='.csv,.xlsx,.xls'
										ref={fileInputRef}
										onChange={handleFileChange}
										className='hidden'
									/>
									<Button
										variant='outline'
										className='flex-1 justify-start'
										onClick={() => fileInputRef.current?.click()}
									>
										<FileText className='mr-2 h-4 w-4' /> Chọn file CSV/XLSX
									</Button>
									<Button variant='ghost' onClick={handleDownloadTemplate}>
										<Download className='mr-2 h-4 w-4' /> Tải mẫu
									</Button>
								</div>
							</div>

							{/* File Preview */}
							{fileName && (
								<div className='flex items-center justify-between rounded-lg border bg-primary/5 p-3'>
									<div className='flex items-center'>
										<div className='mr-2 h-2 w-2 rounded-full bg-green-500'></div>
										<span className='text-sm font-medium'>{fileName}</span>
									</div>
									{allRows && (
										<Button variant='ghost' size='sm' onClick={() => setShowPreview(true)}>
											<Eye className='mr-1 h-4 w-4' /> Xem trước
										</Button>
									)}
								</div>
							)}

							{error && (
								<Alert variant='destructive' className='space-y-2'>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							{/* Start Button */}
							<Button
								onClick={handleStart}
								disabled={isLoading || !allRows || created}
								className='w-full'
								size='lg'
							>
								{isLoading ? (
									<>
										<div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
										Đang tạo...
									</>
								) : created ? (
									'Đã tạo xong'
								) : (
									'Bắt đầu tạo tài khoản'
								)}
							</Button>
						</div>
					)}

					{step === 'results' && records.length > 0 && (
						<div className='flex min-h-0 flex-1 flex-col p-2'>
							{/* Summary */}
							<div className='grid grid-cols-1 gap-1 md:grid-cols-3'>
								<Card className='p-1 text-center'>
									<div className='text-sm font-bold text-primary'>{records.length}</div>
									<div className='text-xs text-muted-foreground'>Tổng số</div>
								</Card>
								<Card className='p-1 text-center'>
									<div className='text-sm font-bold text-green-600'>{successCount}</div>
									<div className='text-xs text-muted-foreground'>Thành công</div>
								</Card>
								<Card className='p-1 text-center'>
									<div className='text-sm font-bold text-destructive'>{failedCount}</div>
									<div className='text-xs text-muted-foreground'>Thất bại</div>
								</Card>
							</div>

							{failedCount === 0 && (
								<Alert className='border-green-200 bg-green-50'>
									<CheckCircle className='h-4 w-4 text-green-600' />
									<AlertDescription className='text-green-800'>
										Tất cả sinh viên đã được tạo thành công!
									</AlertDescription>
								</Alert>
							)}

							{/* Filters */}
							<Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className='w-full'>
								<TabsList className='grid w-full grid-cols-3'>
									<TabsTrigger value='all'>Tất cả ({records.length})</TabsTrigger>
									<TabsTrigger value='success'>Thành công ({successCount})</TabsTrigger>
									<TabsTrigger value='failed'>Thất bại ({failedCount})</TabsTrigger>
								</TabsList>
							</Tabs>

							{/* Results Table */}
							<div className='flex min-h-0 flex-1'>
								<Card className='flex min-h-0 flex-1 flex-col overflow-hidden'>
									<ScrollArea className='h-full'>
										<table className='w-full min-w-full text-xs'>
											<thead className='sticky top-0 bg-muted/50'>
												<tr>
													<th className='px-2 py-1.5 text-left font-medium'>Tên</th>
													<th className='px-2 py-1.5 text-left font-medium'>Mã SV</th>
													<th className='px-2 py-1.5 text-left font-medium'>Lớp</th>
													<th className='px-2 py-1.5 text-left font-medium'>Ngành</th>
													<th className='px-2 py-1.5 text-left font-medium'>Khoa</th>
													<th className='px-2 py-1.5 text-left font-medium'>SĐT</th>
													<th className='px-2 py-1.5 text-left font-medium'>Email</th>
													<th className='px-2 py-1.5 text-left font-medium'>Trạng thái</th>
												</tr>
											</thead>
											<tbody className='divide-y divide-border'>
												{filteredRecords.map((r, idx) => (
													<tr key={idx} className='transition-colors hover:bg-muted/50'>
														<td className='px-2 py-1 font-medium'>{r.fullName}</td>
														<td className='px-2 py-1'>{r.studentCode}</td>
														<td className='px-2 py-1'>{r.className}</td>
														<td className='px-2 py-1'>{r.major}</td>
														<td className='px-2 py-1'>{r.faculty}</td>
														<td className='px-2 py-1'>{r.phone || '-'}</td>
														<td className='px-2 py-1'>{r.email || '-'}</td>
														<td className='px-2 py-1'>{getStatusBadge(r)}</td>
													</tr>
												))}
												{filteredRecords.length === 0 && (
													<tr>
														<td
															colSpan={8}
															className='px-4 py-8 text-center text-muted-foreground'
														>
															Không có dữ liệu
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</ScrollArea>
								</Card>
							</div>

							{/* Actions */}
							<div className='flex gap-2 pt-1'>
								<Button
									variant='outline'
									onClick={() => setStep('upload')}
									className='flex-1 text-xs'
									size='sm'
								>
									Tạo thêm
								</Button>
								<Button onClick={handleClose} className='flex-1 text-xs' size='sm'>
									Đóng
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{allRows && <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} data={allRows} />}
		</div>
	)
}
