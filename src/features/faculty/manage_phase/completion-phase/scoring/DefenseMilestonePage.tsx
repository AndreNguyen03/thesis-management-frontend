import { ROLES, type CouncilMemberSnapshot, type DefenseResult } from '@/models'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
	useGetDetailTopicsInDefenseMilestonesQuery,
	useBatchUpdateDefenseResultsMutation,
	useBatchPublishDefenseResultsMutation,
	useArchiveTopicsMutation
} from '@/services/topicApi'
import MilestoneHeader from './components/MilestoneHeader'
import { TopicsTable } from './components/TopicsTable'
import {
	Download,
	DownloadIcon,
	Earth,
	FileSpreadsheet,
	Loader2,
	Lock,
	Save,
	Upload,
	UploadIcon,
	Archive
} from 'lucide-react'
import Editting from '@/features/shared/workspace/components/Editting'
import {
	useUploadScoringResultFileMutation,
	useDeleteScoringResultFileMutation,
	useBlockGradeMutation
} from '@/services/milestoneApi'
import { formatFileSize } from '@/utils/format-file-size'
import { Button, Input } from '@/components/ui'
import { exportScoringTemplate, importScoringFile, validateScores, calculateGradeText } from '@/utils/excel-utils'
import { formatPeriodInfoMiniPeriod } from '@/utils/utils'
import { ConfirmDialog } from '../manage-defense-milestone/ConfirmDialog'
import { CustomPagination } from '@/components/PaginationBar'
import { PaginationQueryParamsDto } from '@/models/query-params'
import { useDebounce } from '@/hooks/useDebounce'
import { useAppSelector } from '@/store'
import { downloadFileWithURL } from '@/lib/utils'
type ActionType = 'save-draft' | 'publish' | 'block-grade' | 'submit-graded-list' | 'archive-topics'
const baseUrl = import.meta.env.VITE_MINIO_DOWNLOAD_URL_BASE
export default function DefenseScoringPage() {
	const { id: milestoneId } = useParams()
	const [scoringData, setScoringData] = useState<Record<string, DefenseResult>>({})
	const user = useAppSelector((state) => state.auth.user)
	const importInputRef = useRef<HTMLInputElement>(null)
	const [selectedDraftFile, setSelectedDraftFile] = useState<File | null>(null)
	const [selectedTopicsForArchive, setSelectedTopicsForArchive] = useState<Set<string>>(new Set())
	//điều khiển diaglog
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean
		type: ActionType | null
	}>({
		open: false,
		type: null
	})
	//endpoint gọi để tải file chấm điểm template
	const [uploadScoringFileTemplate, { isLoading: isUploadingGradedList }] = useUploadScoringResultFileMutation()
	//query params:
	const [queryParams, setQueryParams] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 1,
		query: '',
		search_by: ['titleVN', 'titleEng']
	})
	// Get milestone data - replace with actual API when ready
	const {
		data: detailTopicsData,
		isLoading: isLoadingMilestones,
		refetch: refetchMilestones
	} = useGetDetailTopicsInDefenseMilestonesQuery({ templateMilestoneId: milestoneId!, queryParams })

	//endpoitn thứ hai để lấy toàn bộ các đề tài
	const { data: allTopicsData, isLoading: isLoadingAllTopics } = useGetDetailTopicsInDefenseMilestonesQuery({
		templateMilestoneId: milestoneId!,
		queryParams: { page: 1, limit: 0 }
	})
	//gọi endpoint để xóa file template
	const [deleteScoringResultFile, { isLoading: isDeletingTemplate }] = useDeleteScoringResultFileMutation()
	//gọi endpoint để lưu defenseResult xuống database
	const [batchUpdateDefenseResults, { isLoading: isSavingDraft }] = useBatchUpdateDefenseResultsMutation()
	//gọi endpoint để ông bố kết quả
	const [batchPublishDefenseResults, { isLoading: isPublishing }] = useBatchPublishDefenseResultsMutation()
	//gọi endpoint để khóa bảng điểm
	const [blockGrade, { isLoading: isLockingGrade }] = useBlockGradeMutation()
	//gọi endpoint để archive topics
	const [archiveTopics, { isLoading: isArchiving }] = useArchiveTopicsMutation()

	// Load draft từ localStorage khi component mount
	useEffect(() => {
		const draftKey = `scoring_draft_${milestoneId}`
		const savedDraft = localStorage.getItem(draftKey)

		if (savedDraft) {
			try {
				const parsedDraft = JSON.parse(savedDraft)
				setScoringData(parsedDraft)
				toast.info(`Đã tải ${Object.keys(parsedDraft).length} đề tài từ phiên bản bảng điểm`, {
					richColors: true,
					duration: 3000
				})
			} catch (error) {
				console.error('Lỗi khi load draft:', error)
			}
		}
	}, [milestoneId])

	const handleExportExcel = async () => {
		if (!allTopicsData?.data || allTopicsData.data.length === 0) {
			toast.error('Không có dữ liệu để xuất', { richColors: true })
			return
		}

		try {
			const fileName = `BangChamDiem_${allTopicsData.milestoneInfo.title}_${new Date().toISOString().split('T')[0]}.xlsx`
			await exportScoringTemplate(allTopicsData, fileName)
			toast.success('Xuất file Excel thành công!', { richColors: true })
		} catch (error) {
			toast.error('Xuất file thất bại: ' + (error as Error).message, { richColors: true })
		}
	}

	const handleImportExcel = () => {
		if (importInputRef.current) importInputRef.current.click()
	}

	const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0) return

		const file = e.target.files[0]
		setSelectedDraftFile(file)
		try {
			toast.info('Đang đọc file Excel...', { richColors: true })

			// Parse file Excel
			const scores = await importScoringFile(file)

			// Validate dữ liệu
			const validation = validateScores(scores)
			if (!validation.valid) {
				toast.error(
					<div>
						<p className='font-semibold'>File có lỗi:</p>
						<ul className='mt-1 list-disc pl-4'>
							{validation.errors.slice(0, 5).map((err, idx) => (
								<li key={idx} className='text-xs'>
									{err}
								</li>
							))}
						</ul>
					</div>,
					{ richColors: true, duration: 5000 }
				)
				return
			}

			// Cập nhật điểm cho topics
			const newScoringData: Record<string, DefenseResult> = {}

			scores.forEach((row) => {
				// Lấy tất cả điểm từ councilScores
				const scoresArray = row.councilScores.map((cs) => cs.score).filter((s) => s !== undefined) as number[]

				if (scoresArray.length > 0) {
					const finalScore = scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length
					const gradeText = row.gradeText || calculateGradeText(finalScore)

					newScoringData[row.topicId] = {
						defenseDate: new Date(),
						periodName: detailTopicsData?.milestoneInfo?.title || '',
						finalScore,
						gradeText,
						councilMembers: row.councilScores
							.map((cs, index) =>
								cs.score !== undefined
									? {
											memberId: `GV ${index + 1}`,
											score: cs.score,
											fullName: `Giảng viên ${index + 1}`,
											role: 'Thành viên',
											note: cs.note || ''
										}
									: null
							)
							.filter(Boolean) as CouncilMemberSnapshot[],
						councilName: 'Hội đồng bảo vệ',
						isPublished: false
					}
				}
			})

			setScoringData(newScoringData)
			toast.success(`Đã nhập ${Object.keys(newScoringData).length} đề tài có điểm!`, { richColors: true })
		} catch (error) {
			toast.error('Lỗi khi đọc file: ' + (error as Error).message, { richColors: true })
		} finally {
			// Reset input
			e.target.value = ''
			e.target.files = null
		}
	}
	const handleSaveDraft = async () => {
		if (Object.keys(scoringData).length === 0) {
			toast.warning('Chưa có dữ liệu điểm để lưu', { richColors: true })
			return
		}

		try {
			// Chuyển đổi scoringData thành format cho API
			const results = Object.entries(scoringData).map(([topicId, result]) => ({
				topicId,
				defenseDate: result.defenseDate,
				periodName: formatPeriodInfoMiniPeriod(detailTopicsData!.periodInfo),
				finalScore: result.finalScore,
				gradeText: result.gradeText,
				councilMembers: result.councilMembers,
				councilName: result.councilName,
				isPublished: false,
				isBlock: false
			}))

			// Gọi API để lưu xuống database
			const response = await batchUpdateDefenseResults({ results }).unwrap()

			toast.success(`Đã lưu ${response.success} đề tài thành công!`, {
				richColors: true,
				description:
					response.failed > 0 ? `${response.failed} đề tài lưu thất bại` : 'Dữ liệu đã được lưu vào database'
			})

			// Xóa draft khỏi localStorage
			const draftKey = `scoring_draft_${milestoneId}`
			localStorage.removeItem(draftKey)
			//refetch lại dữ liệu
			refetchMilestones()
			setScoringData({})
		} catch (error) {
			toast.error('Lưu phiên bản bảng điểm thất bại: ' + (error as Error).message, { richColors: true })
		}
	}
	const handlePublish = async () => {
		try {
			const batchTopics = detailTopicsData?.data.map((topic) => ({ topicId: topic._id, isPublished: true })) || []
			await batchPublishDefenseResults({ topics: batchTopics, templateMilestoneId: milestoneId! }).unwrap()
			refetchMilestones()
			toast.success('Đã xuất bản điểm thành công!', {
				richColors: true,
				description: 'Điểm đã được công bố.'
			})
		} catch (error) {
			toast.error('Đã xảy ra lỗi khi xuất bản điểm.', { richColors: true })
		}
	}
	const handleLockGrade = async () => {
		try {
			await blockGrade({ milestoneId: milestoneId! }).unwrap()
			refetchMilestones()
			toast.success('Đã khóa bảng điểm thành công!', {
				richColors: true,
				description: 'Bảng điểm đã khóa'
			})
		} catch (error) {
			toast.error('Đã xảy ra lỗi khi xuất bản điểm.', { richColors: true })
		}
	}

	const handleRemoveSampleFile = () => {
		setSelectedDraftFile(null)
	}
	const handleEditingDraftTemplateFile = (input: string) => {
		setSelectedDraftFile(
			new (window as any).File([selectedDraftFile!], input, {
				type: selectedDraftFile!.type,
				lastModified: selectedDraftFile!.lastModified
			}) as File
		)
	}
	const handleUploadGradedListFile = async () => {
		if (!selectedDraftFile) return
		try {
			await uploadScoringFileTemplate({ templateId: milestoneId!, file: selectedDraftFile }).unwrap()
			toast.success('Tải file mẫu chấm điểm thành công!', { richColors: true })
			setSelectedDraftFile(null)
			refetchMilestones()
			setScoringData({})
		} catch (error) {
			toast.error('Tải file mẫu chấm điểm thất bại. Vui lòng thử lại.', { richColors: true })
		}
	}
	const handleDownloadSampleFile = async () => {
		if (!allTopicsData?.data || allTopicsData.data.length === 0) {
			toast.error('Không có dữ liệu để xuất', { richColors: true })
			return
		}

		try {
			const fileName = `BangChamDiem_${allTopicsData.milestoneInfo.title.trim()}_${new Date().toISOString().split('T')[0]}_sample.xlsx`
			await exportScoringTemplate(allTopicsData, fileName, false)
			toast.success('Xuất file Excel mẫu thành công!', { richColors: true })
		} catch (error) {
			toast.error('Xuất file mẫuthất bại: ' + (error as Error).message, { richColors: true })
		}
	}

	const handleApplyResultTemplate = async () => {
		if (!detailTopicsData?.milestoneInfo.resultScoringTemplate) {
			toast.error('Không có file kết quả chấm điểm', { richColors: true })
			return
		}

		try {
			toast.info('Đang tải và xử lý file từ database...', { richColors: true })

			// Tải file từ URL
			const fileUrl = baseUrl + '/' + detailTopicsData.milestoneInfo.resultScoringTemplate.fileUrl
			console.log('fileUrl', fileUrl)
			const response = await fetch(fileUrl)

			if (!response.ok) {
				throw new Error('Không thể tải file từ server')
			}

			const blob = await response.blob()
			const file = new File([blob], detailTopicsData.milestoneInfo.resultScoringTemplate.fileNameBase, {
				type: detailTopicsData.milestoneInfo.resultScoringTemplate.mimeType
			})

			// Parse file Excel
			const scores = await importScoringFile(file)

			// Validate dữ liệu
			const validation = validateScores(scores)
			if (!validation.valid) {
				toast.error(
					<div>
						<p className='font-semibold'>File có lỗi:</p>
						<ul className='mt-1 list-disc pl-4'>
							{validation.errors.slice(0, 5).map((err, idx) => (
								<li key={idx} className='text-xs'>
									{err}
								</li>
							))}
						</ul>
					</div>,
					{ richColors: true, duration: 5000 }
				)
				return
			}

			// Cập nhật điểm cho topics
			const newScoringData: Record<string, DefenseResult> = {}

			scores.forEach((row) => {
				// Lấy tất cả điểm từ councilScores
				const scoresArray = row.councilScores.map((cs) => cs.score).filter((s) => s !== undefined) as number[]

				if (scoresArray.length > 0) {
					const finalScore = scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length
					const gradeText = row.gradeText || calculateGradeText(finalScore)

					newScoringData[row.topicId] = {
						defenseDate: new Date(),
						periodName: detailTopicsData?.milestoneInfo?.title || '',
						finalScore,
						gradeText,
						councilMembers: row.councilScores
							.map((cs, index) =>
								cs.score !== undefined
									? {
											memberId: `GV ${index + 1}`,
											score: cs.score,
											fullName: `Giảng viên ${index + 1}`,
											role: 'Thành viên',
											note: cs.note || ''
										}
									: null
							)
							.filter(Boolean) as CouncilMemberSnapshot[],
						councilName: 'Hội đồng bảo vệ',
						isPublished: false
					}
				}
			})

			setScoringData(newScoringData)
			toast.success(`Đã áp dụng ${Object.keys(newScoringData).length} đề tài có điểm từ file kết quả!`, {
				richColors: true,
				description: 'Dữ liệu đã được tải từ database và sẵn sàng lưu'
			})
		} catch (error) {
			console.log(error)
			toast.error('Lỗi khi áp dụng file: ' + (error as Error).message, { richColors: true })
		}
	}

	// Lọc các đề tài đã được chấm điểm và chưa archive
	const eligibleTopicsForArchive = useMemo(() => {
		if (!detailTopicsData?.data) return []
		return detailTopicsData.data.filter(
			(topic) => topic.defenseResult?.finalScore !== undefined && topic.currentStatus !== 'archived'
		)
	}, [detailTopicsData])

	const handleSelectTopicForArchive = (topicId: string) => {
		setSelectedTopicsForArchive((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(topicId)) {
				newSet.delete(topicId)
			} else {
				newSet.add(topicId)
			}
			return newSet
		})
	}

	const handleSelectAllForArchive = () => {
		if (selectedTopicsForArchive.size === eligibleTopicsForArchive.length) {
			setSelectedTopicsForArchive(new Set())
		} else {
			setSelectedTopicsForArchive(new Set(eligibleTopicsForArchive.map((t) => t._id)))
		}
	}

	const handleArchiveTopics = async () => {
		if (selectedTopicsForArchive.size === 0) {
			toast.warning('Vui lòng chọn ít nhất một đề tài để lưu vào thư viện', { richColors: true })
			return
		}

		try {
			const result = await archiveTopics({ topicIds: Array.from(selectedTopicsForArchive) }).unwrap()
			toast.success(`Đã lưu ${result.success} đề tài vào thư viện thành công!`, {
				richColors: true,
				description: result.failed > 0 ? `${result.failed} đề tài lưu thất bại` : undefined
			})
			setSelectedTopicsForArchive(new Set())
			refetchMilestones()
		} catch (error) {
			toast.error('Lưu đề tài vào thư viện thất bại: ' + (error as Error).message, { richColors: true })
		}
	}

	// Kiểm tra xem dữ liệu đã thay đổi so với dữ liệu gốc hay chưa

	const isChanged = useMemo(() => {
		if (!detailTopicsData?.data) {
			return false
		}
		return detailTopicsData.data.some((topic) => {
			const imported = scoringData[topic._id]
			if (!imported) return false
			// So sánh điểm trung bình
			if (
				imported.finalScore !== undefined &&
				topic.defenseResult?.finalScore !== undefined &&
				imported.finalScore.toFixed(2) !== topic.defenseResult.finalScore.toFixed(2)
			) {
				return true
			}
			// So sánh ghi chú
			if (
				imported.councilMembers &&
				topic.defenseResult?.councilMembers &&
				imported.councilMembers.some(
					(member, idx) => member.note !== topic.defenseResult.councilMembers[idx]?.note
				)
			) {
				return true
			}
			return false
		})
	}, [scoringData, detailTopicsData])

	const [searchTerm, setSearchTerm] = useState('')
	const setQuery = (query: string) => {
		setQueryParams((prev) => ({ ...prev, query }))
	}
	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })
	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}
	return (
		<div className='flex w-full flex-col gap-4 p-6'>
			{detailTopicsData && (
				<MilestoneHeader
					milestone={detailTopicsData.milestoneInfo}
					periodFacultyName={detailTopicsData.periodInfo.faculty.name}
				/>
			)}

			{/* --- TOOLBAR --- */}
			<div className='max-w-10xl mx-auto flex gap-2 px-4 py-4 sm:px-6 lg:px-8'>
				<div className='flex flex-wrap items-center justify-between gap-5 rounded-lg border border-gray-200 bg-white p-3 shadow-sm'>
					<div className='flex gap-2'>
						<button
							title='Tải mẫu trống chưa chấm điểm'
							onClick={handleDownloadSampleFile}
							className='flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
						>
							<Download className='h-4 w-4' /> Tải mẫu
						</button>

						<button
							disabled={detailTopicsData?.milestoneInfo.isBlock}
							onClick={handleImportExcel}
							className='flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
						>
							<Upload className='h-4 w-4' /> Nhập Excel
						</button>
						{/* Hidden Input for File Upload */}
						<input
							type='file'
							ref={importInputRef}
							className='hidden'
							accept='.xlsx, .xls'
							onChange={onFileSelected}
						/>

						<button
							title='Xuất bảng điểm ra file Excel'
							onClick={() => {
								handleExportExcel()
							}}
							className='flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
						>
							<FileSpreadsheet className='h-4 w-4' /> Xuất Excel
						</button>
					</div>
					{user?.role === ROLES.FACULTY_BOARD && (
						<div className='flex gap-2'>
							<button
								onClick={() => setConfirmDialog({ open: true, type: 'save-draft' })}
								//khi milestone bị block thì ko còn chỉnh sửa gì nữa
								disabled={isSavingDraft || detailTopicsData?.milestoneInfo.isBlock || !isChanged}
								className='flex items-center gap-2 rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
							>
								{isSavingDraft ? (
									<Loader2 className='h-4 w-4 animate-spin' />
								) : (
									<Save className='h-4 w-4' />
								)}
								{isSavingDraft ? 'Đang lưu...' : 'Lưu điểm'}
							</button>

							<button
								onClick={() => setConfirmDialog({ open: true, type: 'publish' })}
								disabled={isPublishing || detailTopicsData?.data.length === 0 || detailTopicsData?.milestoneInfo.isPublished}
								className={`flex items-center gap-2 rounded px-5 py-2 text-sm font-medium shadow-sm transition-colors ${
									detailTopicsData?.milestoneInfo.isPublished
										? 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400'
										: 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
								}`}
							>
								<Earth className='h-4 w-4' />{' '}
								{detailTopicsData?.milestoneInfo.isPublished ? 'Hủy công bố' : 'Công bố'}
							</button>

							<button
								onClick={() => setConfirmDialog({ open: true, type: 'block-grade' })}
								disabled={detailTopicsData?.milestoneInfo.isBlock || detailTopicsData?.data.length === 0 }
								className={`flex items-center gap-2 rounded px-5 py-2 text-sm font-medium shadow-sm transition-colors ${
									detailTopicsData?.milestoneInfo.isBlock
										? 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400'
										: 'border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
								}`}
							>
								<Lock className='h-4 w-4' />{' '}
								{detailTopicsData?.milestoneInfo.isBlock ? 'Đã khóa' : 'Khóa bảng điểm'}
							</button>
						</div>
					)}
				</div>

				{!selectedDraftFile ? (
					<div className='flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm font-medium shadow-sm'>
						{detailTopicsData?.milestoneInfo.resultScoringTemplate ? (
							<div className='flex items-center gap-2'>
								<div className='min-w-0 flex-1'>
									<p className='flex gap-2 truncate font-medium text-foreground'>
										{detailTopicsData?.milestoneInfo.resultScoringTemplate.fileNameBase}
									</p>
									<div className='mt-1 flex items-center gap-3 text-sm italic text-muted-foreground'>
										<span>
											{detailTopicsData?.milestoneInfo.resultScoringTemplate?.actor.fullName}
										</span>
										<span className='text-gray-500'>•</span>
										<span className='text-[12px] text-gray-500'>
											{new Date(
												detailTopicsData?.milestoneInfo.resultScoringTemplate?.created_at
											).toLocaleString('vi-VN')}
										</span>
										<span className='text-gray-500'>•</span>
										<span className='text-[12px] text-gray-500'>
											{formatFileSize(
												detailTopicsData?.milestoneInfo.resultScoringTemplate?.size
											)}
										</span>
									</div>
								</div>
								<div
									className='p-2'
									onClick={() =>
										downloadFileWithURL(
											baseUrl + detailTopicsData?.milestoneInfo.resultScoringTemplate?.fileUrl,
											detailTopicsData?.milestoneInfo.resultScoringTemplate!.fileNameBase
										)
									}
								>
									<DownloadIcon className='ml-2 h-5 w-5 cursor-pointer hover:text-green-700' />
								</div>
								<button
									onClick={handleApplyResultTemplate}
									disabled={detailTopicsData?.milestoneInfo.isBlock}
									className='cursor-pointer rounded bg-blue-600 px-3 py-1 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
								>
									Áp dụng
								</button>
							</div>
						) : (
							<div className='flex flex-col items-center'>
								<div className='flex gap-1'>Thư ký tải kết quả chấm điểm</div>
								<p className='mt-1 text-[12px] text-muted-foreground'>Hỗ trợ: XLSX (tối đa 10MB)</p>
							</div>
						)}
					</div>
				) : (
					<div className='mt-2 flex items-center gap-1 space-y-2'>
						<Editting
							index={0}
							file={selectedDraftFile}
							onRemoveDraftFile={() => handleRemoveSampleFile()}
							isUploading={false}
							onEditting={(input: string) => handleEditingDraftTemplateFile(input)}
						/>
						{isUploadingGradedList ? (
							<Loader2 className='h-7 w-7 cursor-pointer rounded bg-green-100 p-1 hover:bg-green-200' />
						) : (
							<button
								type='button'
								className='cursor-pointer rounded bg-blue-600 px-2 py-1 font-semibold text-white hover:bg-blue-500'
								onClick={() => setConfirmDialog({ open: true, type: 'submit-graded-list' })}
							>
								Nộp lên cho khoa
							</button>
						)}
					</div>
				)}
			</div>

			{/* Section cho Archive Topics */}
			{user?.role === ROLES.FACULTY_BOARD && (
				<div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
					<div className='mb-3 flex items-center justify-between'>
						<div>
							<h3 className='font-semibold text-blue-900'>Lưu đề tài vào thư viện số</h3>
							<p className='text-sm text-blue-700'>
								Chọn các đề tài đã được chấm điểm để lưu vào thư viện số của khoa
							</p>
						</div>
						<div className='flex gap-2'>
							<button
								onClick={handleSelectAllForArchive}
								disabled={eligibleTopicsForArchive.length === 0}
								className='rounded border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50'
							>
								{selectedTopicsForArchive.size === eligibleTopicsForArchive.length
									? 'Bỏ chọn tất cả'
									: `Chọn tất cả (${eligibleTopicsForArchive.length})`}
							</button>
							<button
								onClick={() => setConfirmDialog({ open: true, type: 'archive-topics' })}
								disabled={isArchiving || selectedTopicsForArchive.size === 0}
								className='flex items-center gap-2 rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
							>
								{isArchiving ? (
									<>
										<Loader2 className='h-4 w-4 animate-spin' />
										Đang lưu...
									</>
								) : (
									<>
										<Archive className='h-4 w-4' />
										Lưu vào thư viện ({selectedTopicsForArchive.size})
									</>
								)}
							</button>
						</div>
					</div>

					<div className='max-h-60 space-y-2 overflow-y-auto'>
						{eligibleTopicsForArchive.map((topic) => (
							<div
								key={topic._id}
								className='flex items-center gap-3 rounded border border-blue-200 bg-white p-3 transition-colors hover:bg-blue-50'
							>
								<input
									type='checkbox'
									checked={selectedTopicsForArchive.has(topic._id)}
									onChange={() => handleSelectTopicForArchive(topic._id)}
									className='h-4 w-4 cursor-pointer accent-blue-600'
								/>
								<div className='flex-1'>
									<p className='font-medium text-gray-900'>{topic.titleVN}</p>
									<p className='text-sm text-gray-600'>{topic.titleEng}</p>
									<div className='mt-1 flex items-center gap-4 text-xs text-gray-500'>
										<span className='font-semibold'>
											Điểm: {topic.defenseResult?.finalScore?.toFixed(2) || 'N/A'}
										</span>
										<span>Xếp loại: {topic.defenseResult?.gradeText || 'N/A'}</span>
										<span>
											Sinh viên: {topic.students?.map((s) => s.fullName).join(', ') || 'N/A'}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			<div className='flex items-center justify-between gap-2'>
				<Input
					placeholder='Tìm kiếm đề tài theo tiêu đề...'
					value={searchTerm}
					onChange={(e) => onEdit(e.target.value)}
					className='w-[500px] border-gray-300 bg-white'
				/>
				{isChanged ? (
					<span className='text-[14px] font-semibold text-orange-500'>Phiên bản dữ liệu chưa được lưu </span>
				) : (
					<span className='text-[14px] font-semibold text-gray-500'>Phiên bản dữ liệu mới nhất </span>
				)}
			</div>
			<TopicsTable
				topics={detailTopicsData?.data ?? []}
				isLoading={isLoadingMilestones}
				importedScores={Object.fromEntries(
					Object.entries(scoringData).map(([topicId, result]) => [
						topicId,
						{
							councilScores: result.councilMembers.map((member) => ({
								score: member.score,
								note: member.note || ''
							})),
							finalScore: result.finalScore,
							gradeText: result.gradeText
						}
					])
				)}
			/>
			{detailTopicsData?.meta && (
				<CustomPagination
					meta={detailTopicsData?.meta}
					onPageChange={(p) => setQueryParams((prev) => ({ ...prev, page: p }))}
				/>
			)}
			{/* Confirmation Dialog for Lecturers */}
			<ConfirmDialog
				open={confirmDialog.open}
				onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
				title={
					confirmDialog.type === 'save-draft'
						? 'Xác nhận lưu phiên bản này'
						: confirmDialog.type === 'publish'
							? 'Xác nhận công bố điểm'
							: confirmDialog.type === 'block-grade'
								? 'Xác nhận khóa điểm'
								: confirmDialog.type === 'archive-topics'
									? 'Xác nhận lưu vào thư viện'
									: 'Xác nhận nộp bảng điểm'
				}
				description={
					confirmDialog.type === 'save-draft'
						? `Bạn có chắc chắn muốn lưu phiên bản bảng điểm này?`
						: confirmDialog.type === 'publish'
							? `Khi đã công bố điểm sẽ không thể ẩn đi.`
							: confirmDialog.type === 'block-grade'
								? `Khi khóa bảng điểm sẽ không thể chỉnh sửa được nữa. Hãy chắc chắn mọi thứ đã hoàn thành, không còn khiếu nại gì`
								: confirmDialog.type === 'archive-topics'
									? `Bạn có chắc chắn muốn lưu ${selectedTopicsForArchive.size} đề tài đã chọn vào thư viện số? Đề tài sẽ được công khai cho sinh viên và giảng viên xem.`
									: 'Xác nhận nộp bảng điểm cho khoa. Phiên bản này sẽ thay thế phiên bản trước đó'
				}
				onConfirm={
					confirmDialog.type === 'save-draft'
						? () => handleSaveDraft()
						: confirmDialog.type === 'publish'
							? () => handlePublish()
							: confirmDialog.type === 'block-grade'
								? () => handleLockGrade()
								: confirmDialog.type === 'archive-topics'
									? () => handleArchiveTopics()
									: () => handleUploadGradedListFile()
				}
				isLoading={
					confirmDialog.type === 'save-draft'
						? isSavingDraft
						: confirmDialog.type === 'publish'
							? isPublishing
							: confirmDialog.type === 'block-grade'
								? isLockingGrade
								: confirmDialog.type === 'archive-topics'
									? isArchiving
									: isUploadingGradedList
				}
				confirmText={
					confirmDialog.type === 'save-draft'
						? 'Lưu bảng điểm'
						: confirmDialog.type === 'publish'
							? 'Công bố điểm'
							: confirmDialog.type === 'block-grade'
								? 'Khóa bảng điểm'
								: confirmDialog.type === 'archive-topics'
									? 'Lưu vào thư viện'
									: 'Xác nhận nộp bảng điểm cho khoa'
				}
			/>
		</div>
	)
}
