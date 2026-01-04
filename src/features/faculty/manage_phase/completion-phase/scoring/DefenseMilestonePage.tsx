import type { CouncilMemberSnapshot, DefenseResult } from '@/models'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
	useGetDetailTopicsInDefenseMilestonesQuery,
	useBatchUpdateDefenseResultsMutation,
	useBatchPublishDefenseResultsMutation
} from '@/services/topicApi'
import MilestoneHeader from './components/MilestoneHeader'
import { TopicsTable } from './components/TopicsTable'
import { Download, Earth, FileSpreadsheet, Loader2, Lock, Save, Upload, UploadIcon } from 'lucide-react'
import Editting from '@/features/shared/workspace/components/Editting'
import { useUploadScoringResultFileMutation, useDeleteScoringResultFileMutation } from '@/services/milestoneApi'
import { formatFileSize } from '@/utils/format-file-size'
import { downloadFileWithURL } from '@/lib/utils'
import { Button } from '@/components/ui'
import { exportScoringTemplate, importScoringFile, validateScores, calculateGradeText } from '@/utils/excel-utils'
import { formatPeriodInfoMiniPeriod } from '@/utils/utils'
const baseUrl = import.meta.env.VITE_MINIO_DOWNLOAD_URL_BASE

export default function DefenseScoringPage() {
	const { id: milestoneId } = useParams()
	const [scoringData, setScoringData] = useState<Record<string, DefenseResult>>({})

	const fileInputRef = useRef<HTMLInputElement>(null)
	const importInputRef = useRef<HTMLInputElement>(null)
	const [selectedDraftFile, setSelectedDraftFile] = useState<File | null>(null)
	//endpoint gọi để tải file chấm điểm template
	const [uploadScoringFileTemplate, { isLoading: isUploadingTemplate }] = useUploadScoringResultFileMutation()
	// Get milestone data - replace with actual API when ready
	const {
		data: detailTopicsData,
		isLoading: isLoadingMilestones,
		refetch: refetchMilestones
	} = useGetDetailTopicsInDefenseMilestonesQuery(milestoneId!)
	//gọi endpoint để xóa file template
	const [deleteScoringResultFile, { isLoading: isDeletingTemplate }] = useDeleteScoringResultFileMutation()
	//gọi endpoint để lưu defenseResult xuống database
	const [batchUpdateDefenseResults, { isLoading: isSavingDraft }] = useBatchUpdateDefenseResultsMutation()
	//gọi endpoint để ông bố kết quả
	const [batchPublishDefenseResults, { isLoading: isPublishing }] = useBatchPublishDefenseResultsMutation()
	// Load draft từ localStorage khi component mount
	useEffect(() => {
		const draftKey = `scoring_draft_${milestoneId}`
		const savedDraft = localStorage.getItem(draftKey)

		if (savedDraft) {
			try {
				const parsedDraft = JSON.parse(savedDraft)
				setScoringData(parsedDraft)
				toast.info(`Đã tải ${Object.keys(parsedDraft).length} đề tài từ bản nháp`, {
					richColors: true,
					duration: 3000
				})
			} catch (error) {
				console.error('Lỗi khi load draft:', error)
			}
		}
	}, [milestoneId])

	const handleExportExcel = async () => {
		if (!detailTopicsData?.topics || detailTopicsData.topics.length === 0) {
			toast.error('Không có dữ liệu để xuất', { richColors: true })
			return
		}

		try {
			const fileName = `BangChamDiem_${detailTopicsData.milestoneInfo.title}_${new Date().toISOString().split('T')[0]}.xlsx`
			await exportScoringTemplate(detailTopicsData, fileName)
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
			toast.error('Lưu nháp thất bại: ' + (error as Error).message, { richColors: true })
		}
	}
	const handlePublish = async (bol: boolean) => {
		try {
			const batchTopics =
				detailTopicsData?.topics.map((topic) => ({ topicId: topic._id, isPublished: bol })) || []
			await batchPublishDefenseResults({ topics: batchTopics, templateMilestoneId: milestoneId! }).unwrap()
			toast.success('Đã xuất bản điểm thành công!', { richColors: true })
		} catch (error) {
			toast.error('Đã xảy ra lỗi khi xuất bản điểm.', { richColors: true })
		}
	}
	const handleLockGrade = () => {
		// if (confirm('Bạn có chắc chắn muốn khóa bảng điểm? Sau khi khóa sẽ không thể chỉnh sửa.')) {
		// 	setIsLocked(true)
		// }
	}
	const handleSampleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const file = e.target.files[0]

			if (file.size > 10 * 1024 * 1024) {
				toast.error('Kích thước file vượt quá 10MB. Vui lòng chọn lại.', { richColors: true })
				return
			}
			setSelectedDraftFile(file)
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
	const handleUploadTemplateFile = async () => {
		if (!selectedDraftFile) return
		try {
			await uploadScoringFileTemplate({ templateId: milestoneId!, file: selectedDraftFile }).unwrap()
			toast.success('Tải file mẫu chấm điểm thành công!', { richColors: true })
			setSelectedDraftFile(null)
			refetchMilestones()
		} catch (error) {
			toast.error('Tải file mẫu chấm điểm thất bại. Vui lòng thử lại.', { richColors: true })
		}
	}
	return (
		<div className='flex w-full flex-col gap-4 p-6'>
			{detailTopicsData && <MilestoneHeader milestone={detailTopicsData.milestoneInfo} />}

			{/* --- TOOLBAR --- */}
			<div className='mx-auto flex max-w-7xl gap-2 px-4 py-4 sm:px-6 lg:px-8'>
				<div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm'>
					<div className='flex gap-2'>
						<button
							onClick={() => {
								downloadFileWithURL(
									`${baseUrl}/${detailTopicsData?.milestoneInfo.sampleScoringTemplate?.fileUrl}`,
									detailTopicsData?.milestoneInfo.sampleScoringTemplate?.fileNameBase ||
										'template.xlsx'
								)
							}}
							className='flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
						>
							<Download className='h-4 w-4' /> Tải mẫu
						</button>

						<button
							onClick={handleImportExcel}
							className='flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
						>
							<Upload className='h-4 w-4' /> Nhập Excel
						</button>
						{/* Hidden Input for File Upload */}
						<input
							type='file'
							ref={fileInputRef}
							className='hidden'
							accept='.xlsx, .xls'
							onChange={onFileSelected}
						/>

						<input
							type='file'
							ref={importInputRef}
							className='hidden'
							accept='.xlsx, .xls'
							onChange={onFileSelected}
						/>

						<button
							onClick={() => {
								handleExportExcel()
							}}
							className='flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
						>
							<FileSpreadsheet className='h-4 w-4' /> Xuất Excel
						</button>
					</div>

					<div className='flex gap-2'>
						<button
							onClick={handleSaveDraft}
							disabled={isSavingDraft || detailTopicsData?.milestoneInfo.isBlock}
							className='flex items-center gap-2 rounded bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
						>
							{isSavingDraft ? (
								<Loader2 className='h-4 w-4 animate-spin' />
							) : (
								<Save className='h-4 w-4' />
							)}
							{isSavingDraft ? 'Đang lưu...' : 'Lưu nháp'}
						</button>

						<button
							onClick={handleLockGrade}
							disabled={detailTopicsData?.milestoneInfo.isBlock}
							className={`flex items-center gap-2 rounded px-5 py-2 text-sm font-medium shadow-sm transition-colors ${
								detailTopicsData?.milestoneInfo.isBlock
									? 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400'
									: 'border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
							}`}
						>
							<Lock className='h-4 w-4' />{' '}
							{detailTopicsData?.milestoneInfo.isBlock ? 'Đã khóa' : 'Khóa bảng điểm'}
						</button>

						<button
							onClick={() => handlePublish(!detailTopicsData?.milestoneInfo.isPublished)}
							disabled={isPublishing}
							className={`flex items-center gap-2 rounded px-5 py-2 text-sm font-medium shadow-sm transition-colors ${
								detailTopicsData?.milestoneInfo.isPublished
									? 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400'
									: 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
							}`}
						>
							<Earth className='h-4 w-4' />{' '}
							{detailTopicsData?.milestoneInfo.isPublished ? 'Đã công bố' : 'Công bố'}
						</button>
					</div>
				</div>

				{!selectedDraftFile ? (
					<div className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm font-medium shadow-sm'>
						{detailTopicsData?.milestoneInfo.sampleScoringTemplate ? (
							<div className='min-w-0 flex-1'>
								<p className='flex gap-2 truncate font-medium text-foreground'>
									{detailTopicsData?.milestoneInfo.sampleScoringTemplate.fileNameBase}
									<span className='text-gray-500'>•</span>
									<span className='text-[12px] text-gray-500'>
										{new Date(
											detailTopicsData?.milestoneInfo.sampleScoringTemplate.created_at
										).toLocaleString('vi-VN')}
									</span>
									<span className='text-gray-500'>•</span>
									<span className='text-[12px] text-gray-500'>
										{formatFileSize(detailTopicsData?.milestoneInfo.sampleScoringTemplate.size)}
									</span>
								</p>
								<div className='mt-1 flex items-center gap-3 text-sm italic text-muted-foreground'>
									<span>{detailTopicsData?.milestoneInfo.sampleScoringTemplate.actor.fullName}</span>
									<Button
										disabled={isDeletingTemplate}
										className='h-fit bg-red-600 px-2 py-1 text-[12px] text-white hover:bg-red-700'
										onClick={() => {
											deleteScoringResultFile({ milestoneTemplateId: milestoneId! })
												.unwrap()
												.then(() => {
													toast.success('Xóa file mẫu chấm điểm thành công!', {
														richColors: true
													})
													refetchMilestones()
												})
												.catch(() => {
													toast.error('Xóa file mẫu chấm điểm thất bại. Vui lòng thử lại.', {
														richColors: true
													})
												})
										}}
									>
										{isDeletingTemplate && (
											<Loader2 className='mr-1 inline-block h-4 w-4 animate-spin' />
										)}
										Xóa
									</Button>
								</div>
							</div>
						) : (
							<>
								<input
									ref={fileInputRef}
									type='file'
									onChange={handleSampleFileInput}
									className='hidden'
									accept='.xlsx'
								/>
								<div className='flex flex-col items-center'>
									<div className='flex gap-1'>
										Đăng tải mẫu chấm điểm
										<button
											onClick={() => fileInputRef.current?.click()}
											className='text-primary hover:underline'
										>
											chọn file
										</button>
									</div>
									<p className='mt-1 text-[12px] text-muted-foreground'>Hỗ trợ: XLSX (tối đa 10MB)</p>
								</div>
							</>
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
						{isUploadingTemplate ? (
							<Loader2 className='h-7 w-7 cursor-pointer rounded bg-green-100 p-1 hover:bg-green-200' />
						) : (
							<UploadIcon
								className='h-7 w-7 cursor-pointer rounded bg-green-100 p-1 hover:bg-green-200'
								onClick={handleUploadTemplateFile}
							/>
						)}
					</div>
				)}
			</div>

			<TopicsTable
				topics={detailTopicsData?.topics ?? []}
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
			{/* Left Panel - Topics List */}
			{/* <TopicScoringList
				topics={detailTopicsData?.topics ?? []}
				selectedTopic={selectedTopic}
				onSelectTopic={handleTopicSelect}
				isScoringSubmitted={(topicId) => !!scoringData[topicId]}
				isLoading={isLoadingMilestones}
			/> */}

			{/* Right Panel - Scoring Form */}
			{/* <ScoringPanel
				topic={milestoneData?.topicSnaps?.find((t) => t._id === selectedTopic)}
				councilMembers={milestoneData?.defenseCouncil ?? []}
				onScoringUpdate={(scores) => handleScoringUpdate(selectedTopic!, scores)}
				onSaveAll={handleSaveScores}
				currentScoring={selectedTopic ? scoringData[selectedTopic] : undefined}
				isLoadingMilestones={isLoadingMilestones}
			/> */}
		</div>
	)
}
