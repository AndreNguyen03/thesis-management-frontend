import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Upload, XCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useImportScoresMutation } from '@/services/defenseCouncilApi'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'

interface ExcelRow {
    order: number
    titleVN: string
    students: string
    supervisor_score?: number
    supervisor_comment?: string
    reviewer_score?: number
    reviewer_comment?: string
    secretary_score?: number
    secretary_comment?: string
    chairperson_score?: number
    chairperson_comment?: string
    member_score?: number
    member_comment?: string
    finalScore?: number
    gradeText?: string
}

interface ValidationError {
    row: number
    field: string
    message: string
}

interface ExcelImportDialogProps {
    councilId: string
    open: boolean
    onClose: () => void
    onSuccess?: () => void
}

export function ExcelImportDialog({ councilId, open, onClose, onSuccess }: ExcelImportDialogProps) {
    const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload')
    const [importData, setImportData] = useState<ExcelRow[]>([])
    const [errors, setErrors] = useState<ValidationError[]>([])
    const [importScores, { isLoading }] = useImportScoresMutation()

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer)
                const workbook = XLSX.read(data, { type: 'array' })
                const worksheet = workbook.Sheets[workbook.SheetNames[0]]
                const jsonData = XLSX.utils.sheet_to_json<any>(worksheet)

                // Parse data
                const parsed: ExcelRow[] = jsonData.map((row: any, index: number) => ({
                    order: row['STT'] || index + 1,
                    titleVN: row['Tên đề tài'] || '',
                    students: row['Sinh viên'] || '',
                    supervisor_score: row['GVHD'],
                    supervisor_comment: row['Ghi chú GVHD'],
                    reviewer_score: row['GVPB'],
                    reviewer_comment: row['Ghi chú GVPB'],
                    secretary_score: row['Thư ký'],
                    secretary_comment: row['Ghi chú Thư ký'],
                    chairperson_score: row['Chủ tịch'],
                    chairperson_comment: row['Ghi chú Chủ tịch'],
                    member_score: row['Ủy viên'],
                    member_comment: row['Ghi chú Ủy viên'],
                    finalScore: row['Điểm TB\\n(Công thức)'],
                    gradeText: row['Xếp loại']
                }))

                // Validate
                const validationErrors = validateData(parsed)
                setErrors(validationErrors)
                setImportData(parsed)
                setStep('preview')
            } catch (error) {
                console.error('Error parsing Excel:', error)
                toast.error('Lỗi đọc file Excel. Vui lòng kiểm tra định dạng file.')
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const validateData = (data: ExcelRow[]): ValidationError[] => {
        const errors: ValidationError[] = []

        data.forEach((row, index) => {
            const rowNum = index + 1

            if (!row.titleVN) {
                errors.push({ row: rowNum, field: 'titleVN', message: 'Thiếu tên đề tài' })
            }

            // Check scores (0-10 range)
            const scoreFields = [
                { key: 'supervisor_score', label: 'GVHD' },
                { key: 'reviewer_score', label: 'GVPB' },
                { key: 'secretary_score', label: 'Thư ký' },
                { key: 'chairperson_score', label: 'Chủ tịch' }
            ]

            scoreFields.forEach(({ key, label }) => {
                const score = row[key as keyof ExcelRow] as number | undefined
                if (score !== undefined) {
                    if (isNaN(score) || score < 0 || score > 10) {
                        errors.push({
                            row: rowNum,
                            field: key,
                            message: `Điểm ${label} không hợp lệ (phải từ 0-10)`
                        })
                    }
                }
            })

            // Check at least one score exists
            const hasScore = scoreFields.some((f) => row[f.key as keyof ExcelRow] !== undefined)
            if (!hasScore) {
                errors.push({
                    row: rowNum,
                    field: 'scores',
                    message: 'Không có điểm nào được nhập'
                })
            }
        })

        return errors
    }

    const handleConfirmImport = async () => {
        if (errors.length > 0) {
            toast.error('Vui lòng sửa các lỗi trước khi import')
            return
        }

        setStep('importing')

        try {
            const result = await importScores({
                councilId,
                data: importData.map((row) => ({
                    titleVN: row.titleVN,
                    supervisor_score: row.supervisor_score,
                    supervisor_comment: row.supervisor_comment || '',
                    reviewer_score: row.reviewer_score,
                    reviewer_comment: row.reviewer_comment || '',
                    secretary_score: row.secretary_score,
                    secretary_comment: row.secretary_comment || '',
                    chairperson_score: row.chairperson_score,
                    chairperson_comment: row.chairperson_comment || '',
                    member_score: row.member_score,
                    member_comment: row.member_comment || ''
                }))
            }).unwrap()

            toast.success(
                `Import thành công ${result.data.successCount}/${result.data.totalCount} đề tài`
            )
            onSuccess?.()
            handleClose()
        } catch (error: any) {
            toast.error(error?.data?.message || 'Import thất bại')
            setStep('preview')
        }
    }

    const handleClose = () => {
        setStep('upload')
        setImportData([])
        setErrors([])
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Import điểm từ Excel</DialogTitle>
                    <DialogDescription>
                        Tải lên file Excel chứa điểm các đề tài. Hệ thống sẽ kiểm tra và hiển thị preview trước khi import.
                    </DialogDescription>
                </DialogHeader>

                {/* Step 1: Upload */}
                {step === 'upload' && (
                    <div className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <label className="cursor-pointer">
                                <span className="text-sm text-primary hover:underline">
                                    Chọn file Excel
                                </span>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-xs text-muted-foreground mt-2">
                                Hỗ trợ: .xlsx, .xls
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 2: Preview */}
                {step === 'preview' && (
                    <div className="space-y-4">
                        {/* Errors Summary */}
                        {errors.length > 0 && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Phát hiện {errors.length} lỗi. Vui lòng kiểm tra bảng dưới đây.
                                </AlertDescription>
                            </Alert>
                        )}

                        {errors.length === 0 && (
                            <Alert>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-600">
                                    Dữ liệu hợp lệ. Sẵn sàng import {importData.length} đề tài.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Data Table */}
                        <div className="border rounded-lg max-h-[400px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">STT</TableHead>
                                        <TableHead className="min-w-[200px]">Đề tài</TableHead>
                                        <TableHead className="w-20">GVHD</TableHead>
                                        <TableHead className="w-20">GVPB</TableHead>
                                        <TableHead className="w-20">Thư ký</TableHead>
                                        <TableHead className="w-20">Chủ tịch</TableHead>
                                        <TableHead className="w-24">Trạng thái</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {importData.map((row, index) => {
                                        const rowErrors = errors.filter((e) => e.row === index + 1)
                                        const hasError = rowErrors.length > 0

                                        return (
                                            <TableRow key={index} className={hasError ? 'bg-red-50' : ''}>
                                                <TableCell>{row.order}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium">{row.titleVN}</div>
                                                        {hasError && (
                                                            <div className="text-xs text-destructive space-y-1">
                                                                {rowErrors.map((err, i) => (
                                                                    <div key={i}>• {err.message}</div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{row.supervisor_score?.toFixed(1) || '-'}</TableCell>
                                                <TableCell>{row.reviewer_score?.toFixed(1) || '-'}</TableCell>
                                                <TableCell>{row.secretary_score?.toFixed(1) || '-'}</TableCell>
                                                <TableCell>{row.chairperson_score?.toFixed(1) || '-'}</TableCell>
                                                <TableCell>
                                                    {hasError ? (
                                                        <Badge variant="destructive">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Lỗi
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="success">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            OK
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {/* Step 3: Importing */}
                {step === 'importing' && (
                    <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">Đang import dữ liệu...</p>
                    </div>
                )}

                <DialogFooter>
                    {step === 'upload' && (
                        <Button variant="outline" onClick={handleClose}>
                            Hủy
                        </Button>
                    )}
                    {step === 'preview' && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setStep('upload')}
                            >
                                Tải lại file
                            </Button>
                            <Button
                                onClick={handleConfirmImport}
                                disabled={errors.length > 0 || isLoading}
                            >
                                Import {importData.length} đề tài
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
