'use client'

import { AlertCircle, Download, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LecturerRecord } from './BulkCreateModal'

interface LecturerSummaryProps {
	successCount: number
	errorCount: number
	lecturers: LecturerRecord[]
	onClose: () => void
}

export default function LecturerSummary({ successCount, errorCount, lecturers, onClose }: LecturerSummaryProps) {
	const failedLecturers = lecturers.filter((l) => l.status === 'error')

	const downloadErrorList = () => {
		let csv = 'Họ tên,Email,Khoa,Mã giảng viên,Lý do lỗi\n'
		failedLecturers.forEach((lecturer) => {
			csv += `"${lecturer.name}","${lecturer.email}","${lecturer.department}","${lecturer.code}","${lecturer.error || 'Không xác định'}"\n`
		})
		const blob = new Blob([csv], { type: 'text/csv' })
		const url = window.URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `danh-sach-loi-${new Date().toISOString().split('T')[0]}.csv`
		a.click()
		window.URL.revokeObjectURL(url)
	}

	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between border-b pb-2'>
				<h2 className='text-lg font-semibold text-foreground'>Kết quả tạo tài khoản</h2>
				<Button type='button' variant='ghost' size='sm' onClick={onClose} className='h-8 w-8 p-0'>
					<X className='h-4 w-4' />
				</Button>
			</div>

			<Card className='border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm'>
				<CardContent className='space-y-4 pt-4'>
					<div className='grid gap-4 sm:grid-cols-2'>
						<div className='flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-50 p-4'>
							<CheckCircle2 className='h-8 w-8 flex-shrink-0 text-green-500' />
							<div>
								<p className='text-sm text-muted-foreground'>Tạo thành công</p>
								<p className='text-2xl font-bold text-green-600'>{successCount}</p>
							</div>
						</div>

						<div className='flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-50 p-4'>
							<AlertCircle className='h-8 w-8 flex-shrink-0 text-red-500' />
							<div>
								<p className='text-sm text-muted-foreground'>Tạo thất bại</p>
								<p className='text-2xl font-bold text-red-600'>{errorCount}</p>
							</div>
						</div>
					</div>

					<p className='text-center text-sm text-foreground'>
						Đã tạo thành công <span className='font-semibold text-green-600'>{successCount}</span> tài khoản
						{errorCount > 0 && (
							<>
								, thất bại <span className='font-semibold text-red-600'>{errorCount}</span> tài khoản
							</>
						)}
						.
					</p>
				</CardContent>
			</Card>

			{failedLecturers.length > 0 && (
				<Card className='border-red-500/20'>
					<CardHeader>
						<CardTitle className='text-base text-red-600'>Danh sách tài khoản không tạo được</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div className='max-h-48 space-y-2 overflow-y-auto'>
							{failedLecturers.map((lecturer, idx) => (
								<div key={idx} className='rounded border border-red-500/20 bg-red-50/50 p-3'>
									<p className='font-medium text-foreground'>{lecturer.name}</p>
									<p className='text-sm text-muted-foreground'>{lecturer.email}</p>
									<p className='mt-1 text-xs text-red-600'>Lý do: {lecturer.error}</p>
								</div>
							))}
						</div>
						<Button
							onClick={downloadErrorList}
							variant='outline'
							className='w-full gap-2 border-red-500/20 bg-transparent'
						>
							<Download className='h-4 w-4' />
							Tải danh sách lỗi
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
