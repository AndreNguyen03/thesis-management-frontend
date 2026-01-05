import * as XLSX from 'xlsx'
import ExcelJS from 'exceljs'
import type { DetailTopicsInDefenseMilestone, TopicsInDefenseMilestone } from '@/models'
import type { DefenseCouncilMember } from '@/models/milestone.model'
import { formatPeriodInfoMiniPeriod } from './utils'

/**
 * Map council member role sang tiếng Việt
 */
function getCouncilRoleLabel(role: string): string {
	const roleMap: Record<string, string> = {
		chairperson: 'Chủ tịch',
		secretary: 'Thư ký',
		member: 'Ủy viên'
	}
	return roleMap[role] || role
}

export interface CouncilMemberScore {
	score?: number
	note?: string
}

export interface ExcelScoreRow {
	topicId: string
	titleVN: string
	titleEng: string
	students: string
	lecturers: string
	councilScores: CouncilMemberScore[] // Mảng điểm của các thành viên hội đồng
	finalScore?: number
	gradeText?: string
}

/**
 * Tải file template Excel từ public folder
 */
async function loadTemplate(templatePath: string): Promise<XLSX.WorkBook> {
	const response = await fetch(templatePath)
	if (!response.ok) {
		throw new Error('Không thể tải file template')
	}
	const arrayBuffer = await response.arrayBuffer()
	// Thêm cellStyles để giữ style, cellNF cho number format
	return XLSX.read(arrayBuffer, {
		type: 'array',
		cellStyles: true,
		cellNF: true,
		cellDates: true
	})
}

/**
 * Xuất file Excel mẫu để chấm điểm (sử dụng ExcelJS với màu sắc)
 */
export async function exportScoringTemplate(
	data: DetailTopicsInDefenseMilestone,
	fileName: string = 'BangChamDiem.xlsx',
	includeScores: boolean = true
) {
	const { data: topics, milestoneInfo, periodInfo } = data
	const workbook = new ExcelJS.Workbook()

	// Xác định số lượng thành viên hội đồng từ milestoneInfo
	const councilCount = milestoneInfo?.defenseCouncil?.length || 3
	// const councilMembers = milestoneInfo?.defenseCouncil || []

	// ===== SHEET 1: THÔNG TIN ĐỢT BẢO VỆ =====
	const infoSheet = workbook.addWorksheet('ℹ️ Thông tin bảo vệ', {
		views: [{ showGridLines: false }]
	})

	infoSheet.columns = [{ width: 20 }, { width: 35 }, { width: 35 }]

	// Tiêu đề
	const infoTitle = infoSheet.addRow(['THÔNG TIN ĐỢT BẢO VỆ ĐỒ ÁN'])
	infoTitle.font = { bold: true, size: 16, color: { argb: 'FF0066CC' } }
	infoTitle.height = 35
	infoTitle.alignment = { vertical: 'middle', horizontal: 'center' }
	infoSheet.mergeCells('A1:C1')
	infoSheet.addRow([])

	// Thông tin đợt bảo vệ
	const defenseData = [
		['Đợt bảo vệ:', formatPeriodInfoMiniPeriod(periodInfo) || topics[0]?.defenseResult?.periodName || 'N/A'],
		['Hội đồng:', milestoneInfo?.title || topics[0]?.defenseResult?.councilName || 'N/A'],
		[
			'Ngày bảo vệ:',
			data?.milestoneInfo.dueDate ? new Date(milestoneInfo.dueDate).toLocaleDateString('vi-VN') : 'N/A'
		],
		['Tổng số đề tài:', topics.length.toString()]
	]

	defenseData.forEach(([label, value]) => {
		const row = infoSheet.addRow([label, value])
		row.height = 25

		// Style cho label
		row.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF0066CC' } }
		row.getCell(1).fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FFE7E6E6' }
		}
		row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' }

		// Style cho value
		row.getCell(2).font = { size: 11 }
		row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' }
		// Merge value thành 2 cột
		infoSheet.mergeCells(`B${row.number}:C${row.number}`)

		// Border
		row.eachCell((cell) => {
			cell.border = {
				top: { style: 'thin', color: { argb: 'FF000000' } },
				left: { style: 'thin', color: { argb: 'FF000000' } },
				bottom: { style: 'thin', color: { argb: 'FF000000' } },
				right: { style: 'thin', color: { argb: 'FF000000' } }
			}
		})
	})

	infoSheet.addRow([])
	infoSheet.addRow([])

	// Thành viên hội đồng
	const councilTitle = infoSheet.addRow(['DANH SÁCH THÀNH VIÊN HỘI ĐỒNG'])
	councilTitle.font = { bold: true, size: 14, color: { argb: 'FFFF0000' } }
	councilTitle.height = 30
	councilTitle.alignment = { vertical: 'middle', horizontal: 'center' }
	infoSheet.mergeCells(`A${councilTitle.number}:C${councilTitle.number}`)

	// Header cho bảng thành viên
	const memberHeader = infoSheet.addRow(['Vai trò', 'Học vị/Chức danh', 'Họ và tên'])
	memberHeader.height = 25
	memberHeader.eachCell((cell) => {
		cell.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FF4472C4' }
		}
		cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
		cell.alignment = { vertical: 'middle', horizontal: 'center' }
		cell.border = {
			top: { style: 'thin', color: { argb: 'FF000000' } },
			left: { style: 'thin', color: { argb: 'FF000000' } },
			bottom: { style: 'thin', color: { argb: 'FF000000' } },
			right: { style: 'thin', color: { argb: 'FF000000' } }
		}
	})

	// Danh sách thành viên (lấy từ milestoneInfo.defenseCouncil)
	if (milestoneInfo?.defenseCouncil && milestoneInfo.defenseCouncil.length > 0) {
		milestoneInfo.defenseCouncil.forEach((member) => {
			const memberRow = infoSheet.addRow([getCouncilRoleLabel(member.role), member.title || '', member.fullName])
			memberRow.height = 22

			// Style cho vai trò
			memberRow.getCell(1).font = { bold: true, size: 11 }
			memberRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' }

			// Style cho học vị
			memberRow.getCell(2).font = { size: 11, italic: true }
			memberRow.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' }

			// Style cho họ tên
			memberRow.getCell(3).font = { size: 11 }
			memberRow.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' }

			memberRow.eachCell((cell) => {
				cell.border = {
					top: { style: 'thin', color: { argb: 'FF000000' } },
					left: { style: 'thin', color: { argb: 'FF000000' } },
					bottom: { style: 'thin', color: { argb: 'FF000000' } },
					right: { style: 'thin', color: { argb: 'FF000000' } }
				}
			})
		})
	}

	// ===== SHEET 2: HƯỚNG DẪN SỬ DỤNG =====
	const guideSheet = workbook.addWorksheet('📖 Hướng dẫn', {
		views: [{ showGridLines: false }]
	})

	guideSheet.columns = [{ width: 80 }]

	// Tiêu đề
	const titleRow = guideSheet.addRow(['HƯỚNG DẪN NHẬP ĐIỂM CHẤM ĐỒ ÁN'])
	titleRow.font = { bold: true, size: 16, color: { argb: 'FF0066CC' } }
	titleRow.height = 30
	titleRow.alignment = { vertical: 'middle', horizontal: 'center' }
	guideSheet.addRow([])

	// Nội dung hướng dẫn
	const instructions = [
		'📌 CÁC BƯỚC THỰC HIỆN:',
		'',
		'1️⃣ Xem sheet "ℹ️ Thông tin bảo vệ" để kiểm tra thông tin đợt bảo vệ và hội đồng',
		'',
		'2️⃣ Chuyển sang sheet "Bảng chấm điểm"',
		'',
		'3️⃣ Chỉ nhập điểm vào các cột: Điểm GV1, Điểm GV2, Điểm GV3',
		'   • Điểm phải nằm trong khoảng từ 0 đến 10',
		'   • Có thể nhập số thập phân (VD: 8.5)',
		'',
		'4️⃣ Cột "DTB" và "Xếp loại" sẽ TỰ ĐỘNG tính toán:',
		'   • DTB = Trung bình của 3 điểm',
		'   • Xếp loại dựa trên DTB:',
		'     - 9.0 - 10: Xuất sắc',
		'     - 8.0 - 8.9: Giỏi',
		'     - 7.0 - 7.9: Khá',
		'     - 5.5 - 6.9: Trung bình',
		'     - < 5.5: Yếu',
		'',
		'5️⃣ KHÔNG được chỉnh sửa các cột màu xám (thông tin đề tài)',
		'',
		'6️⃣ Sau khi nhập xong, lưu file và import lại vào hệ thống',
		'',
		'⚠️ LƯU Ý:',
		'• Không xóa hoặc thêm dòng',
		'• Không thay đổi thứ tự các cột',
		'• Không xóa mã đề tài (cột A)',
		'• Cột DTB và Xếp loại TỰ ĐỘNG - KHÔNG cần nhập',
		'',
		'✅ File được bảo vệ - chỉ các ô điểm có thể chỉnh sửa'
	]

	instructions.forEach((text, idx) => {
		const row = guideSheet.addRow([text])
		row.height = 20

		if (text.startsWith('📌') || text.startsWith('⚠️')) {
			row.font = { bold: true, size: 12, color: { argb: 'FFFF0000' } }
		} else if (text.match(/^\d️⃣/)) {
			row.font = { bold: true, size: 11, color: { argb: 'FF0066CC' } }
		} else if (text.startsWith('   •')) {
			row.font = { size: 10 }
			row.alignment = { indent: 2 }
		} else {
			row.font = { size: 11 }
		}
	})

	// ===== SHEET 3: BẢNG CHẤM ĐIỂM =====
	const worksheet = workbook.addWorksheet('Bảng chấm điểm')

	// Định nghĩa các cột cơ bản
	const baseColumns = [
		{ header: 'Mã đề tài', key: 'topicId', width: 25 },
		{ header: 'Tên đề tài (VN)', key: 'titleVN', width: 40 },
		{ header: 'Tên đề tài (EN)', key: 'titleEng', width: 40 },
		{ header: 'Sinh viên', key: 'students', width: 30 },
		{ header: 'Giảng viên', key: 'lecturers', width: 30 }
	]

	// Thêm cột điểm và ghi chú cho từng thành viên hội đồng
	const scoreColumns: any[] = []
	for (let i = 0; i < councilCount; i++) {
		const memberLabel = `GV${i + 1}`

		scoreColumns.push(
			{ header: `Điểm ${memberLabel}`, key: `score${i + 1}`, width: 12 },
			{ header: `Ghi chú ${memberLabel}`, key: `note${i + 1}`, width: 25 }
		)
	}

	// Thêm cột DTB và xếp loại
	const finalColumns = [
		{ header: 'DTB', key: 'finalScore', width: 12 },
		{ header: 'Xếp loại', key: 'gradeText', width: 15 }
	]

	// Kết hợp tất cả các cột
	worksheet.columns = [...baseColumns, ...scoreColumns, ...finalColumns]

	// Style cho header row (dòng 1)
	const headerRow = worksheet.getRow(1)
	headerRow.height = 30

	// Tính toán vị trí cột
	const baseColCount = 5 // topicId, titleVN, titleEng, students, lecturers
	const scoreColStart = baseColCount + 1 // Cột đầu tiên của điểm (6)
	const dtbColIndex = baseColCount + councilCount * 2 + 1 // Cột DTB
	const gradeColIndex = dtbColIndex + 1 // Cột xếp loại

	headerRow.eachCell((cell, colNumber) => {
		// Xác định loại cột
		const isScoreCol =
			colNumber >= scoreColStart && colNumber < dtbColIndex && (colNumber - scoreColStart) % 2 === 0
		const isNoteCol = colNumber >= scoreColStart && colNumber < dtbColIndex && (colNumber - scoreColStart) % 2 === 1
		const isDtbCol = colNumber === dtbColIndex
		const isGradeCol = colNumber === gradeColIndex

		// Màu nền khác nhau cho cột có thể chỉnh sửa và không thể chỉnh sửa
		if (isScoreCol) {
			// Cột điểm - màu xanh dương (có thể chỉnh sửa)
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FF4472C4' }
			}
			cell.note = 'Nhập điểm từ 0-10. Có thể để trống nếu chưa chấm.'
		} else if (isNoteCol) {
			// Cột ghi chú - màu xanh nhạt (có thể chỉnh sửa)
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FF4472C4' }
			}
			cell.note = 'Nhập ghi chú, nhận xét về điểm (không bắt buộc).'
		} else if (isDtbCol) {
			// Cột DTB - màu vàng (tự động tính)
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FFFFC000' }
			}
			cell.note = 'Cột này tự động tính DTB. KHÔNG cần nhập.'
		} else if (isGradeCol) {
			// Cột xếp loại - màu cam (tự động tính)
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FFED7D31' }
			}
			cell.note = 'Cột này tự động tính toán dựa trên DTB. KHÔNG cần nhập.'
		} else {
			// Cột thông tin - màu xám (không chỉnh sửa)
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: 'FF7F7F7F' }
			}
			cell.note = 'Cột này KHÔNG được chỉnh sửa.'
		}

		cell.font = {
			bold: true,
			color: { argb: 'FFFFFFFF' },
			size: 11,
			name: 'Calibri'
		}
		cell.alignment = {
			vertical: 'middle',
			horizontal: 'center',
			wrapText: true
		}
		cell.border = {
			top: { style: 'thin', color: { argb: 'FF000000' } },
			left: { style: 'thin', color: { argb: 'FF000000' } },
			bottom: { style: 'thin', color: { argb: 'FF000000' } },
			right: { style: 'thin', color: { argb: 'FF000000' } }
		}
	})

	// Thêm dữ liệu từ topics
	topics.forEach((topic, index) => {
		const rowNumber = index + 2 // Dòng 2 trở đi

		// Tạo object dữ liệu cho row
		const rowData: any = {
			topicId: topic._id,
			titleVN: topic.titleVN,
			titleEng: topic.titleEng,
			students: topic.students?.map((s) => s.fullName).join(', ') || '',
			lecturers: topic.lecturers?.map((l) => l.fullName).join(', ') || ''
		}

		// Thêm điểm và ghi chú cho từng thành viên hội đồng

		for (let i = 0; i < councilCount; i++) {
			if (includeScores) {
				rowData[`score${i + 1}`] = topic.defenseResult?.councilMembers?.[i]?.score || ''
				rowData[`note${i + 1}`] = topic.defenseResult?.councilMembers?.[i]?.note || ''
			} else {
				rowData[`score${i + 1}`] = ''
				rowData[`note${i + 1}`] = ''
			}
		}

		rowData.finalScore = '' // Sẽ dùng công thức
		rowData.gradeText = '' // Sẽ dùng công thức

		const row = worksheet.addRow(rowData)

		// Tạo công thức tính DTB động dựa trên số lượng thành viên
		const scoreCellRefs: string[] = []
		for (let i = 0; i < councilCount; i++) {
			const colLetter = String.fromCharCode(70 + i * 2) // F, H, J, L, N, P...
			scoreCellRefs.push(`${colLetter}${rowNumber}`)
		}

		// Tạo điều kiện AND cho tất cả các điểm
		const andConditions = scoreCellRefs.map((ref) => `ISNUMBER(${ref})`).join(',')
		const averageFormula = `AVERAGE(${scoreCellRefs.join(',')})`

		// Thêm công thức tính DTB tự động
		const dtbColLetter = String.fromCharCode(65 + dtbColIndex - 1)
		const dtbCell = worksheet.getCell(`${dtbColLetter}${rowNumber}`)
		dtbCell.value = {
			formula: `IF(AND(${andConditions}),ROUND(${averageFormula},2),"")`
		}
		dtbCell.numFmt = '0.00' // Format 2 chữ số thập phân

		// Thêm công thức tính xếp loại tự động
		const gradeColLetter = String.fromCharCode(65 + gradeColIndex - 1)
		const gradeCell = worksheet.getCell(`${gradeColLetter}${rowNumber}`)
		gradeCell.value = {
			formula: `IF(ISNUMBER(${dtbColLetter}${rowNumber}),IF(${dtbColLetter}${rowNumber}>=9,"Xuất sắc",IF(${dtbColLetter}${rowNumber}>=8,"Giỏi",IF(${dtbColLetter}${rowNumber}>=7,"Khá",IF(${dtbColLetter}${rowNumber}>=5.5,"Trung bình","Yếu")))),"")`
		}

		// Style cho các dòng dữ liệu
		row.eachCell((cell, colNumber) => {
			// Xác định loại cột
			const isScoreCol =
				colNumber >= scoreColStart && colNumber < dtbColIndex && (colNumber - scoreColStart) % 2 === 0
			const isNoteCol =
				colNumber >= scoreColStart && colNumber < dtbColIndex && (colNumber - scoreColStart) % 2 === 1
			const isDtbCol = colNumber === dtbColIndex
			const isGradeCol = colNumber === gradeColIndex

			// Border cho tất cả các ô
			cell.border = {
				top: { style: 'thin', color: { argb: 'FF000000' } },
				left: { style: 'thin', color: { argb: 'FF000000' } },
				bottom: { style: 'thin', color: { argb: 'FF000000' } },
				right: { style: 'thin', color: { argb: 'FF000000' } }
			}

			// Font
			cell.font = {
				name: 'Calibri',
				size: 11
			}

			// Màu nền và căn chỉnh
			if (isScoreCol) {
				// Cột điểm - màu vàng nhạt (có thể chỉnh sửa)
				cell.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: 'FFFFFF00' }
				}
				cell.alignment = {
					horizontal: 'center',
					vertical: 'middle'
				}
			} else if (isNoteCol) {
				// Cột ghi chú - màu trắng (có thể chỉnh sửa)
				cell.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: 'FFFFFFFF' }
				}
				cell.alignment = {
					vertical: 'middle',
					horizontal: 'left',
					wrapText: true
				}
			} else if (isDtbCol) {
				// Cột DTB - màu vàng đậm hơn (tự động tính)
				cell.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: 'FFFFC000' }
				}
				cell.alignment = {
					horizontal: 'center',
					vertical: 'middle'
				}
				cell.font = { ...cell.font, bold: true }
			} else if (isGradeCol) {
				// Cột xếp loại - màu cam nhạt (tự động)
				cell.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: 'FFFED9A6' }
				}
				cell.alignment = {
					horizontal: 'center',
					vertical: 'middle'
				}
				cell.font = { ...cell.font, bold: true, color: { argb: 'FFFF0000' } }
			} else {
				// Cột thông tin - màu xám nhạt (không chỉnh sửa)
				cell.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: 'FFD9D9D9' }
				}
				cell.alignment = {
					vertical: 'middle',
					wrapText: true
				}
			}
		})

		// Thêm Data Validation cho các ô điểm
		for (let i = 0; i < councilCount; i++) {
			const scoreColNumber = scoreColStart + i * 2
			const scoreCell = worksheet.getCell(rowNumber, scoreColNumber)
			scoreCell.dataValidation = {
				type: 'decimal',
				operator: 'between',
				allowBlank: true,
				showErrorMessage: true,
				formulae: [0, 10],
				errorStyle: 'error',
				errorTitle: 'Điểm không hợp lệ',
				error: 'Điểm phải từ 0 đến 10',
				promptTitle: 'Nhập điểm',
				prompt: 'Nhập điểm từ 0 đến 10 (có thể để trống)'
			}
		}
	})

	// Freeze header row
	worksheet.views = [{ state: 'frozen', ySplit: 1 }]

	// Bảo vệ sheet - chỉ cho phép chỉnh sửa cột điểm
	await worksheet.protect('', {
		selectLockedCells: true,
		selectUnlockedCells: true,
		formatCells: false,
		formatColumns: false,
		formatRows: true, // Cho phép kéo dãn dòng
		insertRows: false,
		deleteRows: false,
		insertColumns: false,
		deleteColumns: false,
		sort: false,
		autoFilter: false
	})

	// Mở khóa các ô điểm và ghi chú
	topics.forEach((_, index) => {
		const rowNumber = index + 2
		// Mở khóa tất cả các cột điểm và ghi chú
		for (let i = 0; i < councilCount; i++) {
			const scoreCol = scoreColStart + i * 2
			const noteCol = scoreCol + 1

			worksheet.getCell(rowNumber, scoreCol).protection = { locked: false }
			worksheet.getCell(rowNumber, noteCol).protection = { locked: false }
		}
	})

	// Xuất file
	const buffer = await workbook.xlsx.writeBuffer()
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	})

	// Download file
	const url = window.URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = fileName
	a.click()
	window.URL.revokeObjectURL(url)
}

/**
 * Nhập file Excel đã chấm điểm
 */
export async function importScoringFile(file: File): Promise<ExcelScoreRow[]> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()

		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target?.result as ArrayBuffer)
				const workbook = XLSX.read(data, { type: 'array' })

				// Tìm sheet "Bảng chấm điểm"
				let sheetName = workbook.SheetNames.find((name) => name.includes('Bảng chấm điểm'))
				if (!sheetName) {
					// Nếu không tìm thấy, dùng sheet cuối cùng (sheet chấm điểm thường ở cuối)
					sheetName = workbook.SheetNames[workbook.SheetNames.length - 1]
				}
				const worksheet = workbook.Sheets[sheetName]

				// Chuyển đổi thành JSON, bỏ qua dòng header
				const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 })

				// Bỏ dòng header (dòng đầu tiên)
				const rows = jsonData.slice(1)

				// Parse dữ liệu - tự động phát hiện số lượng cột điểm
				const scores: ExcelScoreRow[] = rows
					.filter((row: any[]) => row.length > 0 && row[0]) // Lọc dòng trống
					.map((row: any[]) => {
						// Các cột cơ bản (5 cột đầu tiên)
						const result: ExcelScoreRow = {
							topicId: String(row[0] || '').trim(),
							titleVN: String(row[1] || '').trim(),
							titleEng: String(row[2] || '').trim(),
							students: String(row[3] || '').trim(),
							lecturers: String(row[4] || '').trim(),
							councilScores: []
						}

						// Tự động đọc các cặp (điểm, ghi chú) từ cột 5 trở đi
						let colIndex = 5
						while (colIndex < row.length - 2) {
							// -2 để trừ 2 cột cuối (DTB, Xếp loại)
							const score = row[colIndex] ? Number(row[colIndex]) : undefined
							const note = String(row[colIndex + 1] || '').trim()

							result.councilScores.push({ score, note })
							colIndex += 2 // Nhảy sang cặp điểm-ghi chú tiếp theo
						}

						// 2 cột cuối: DTB và Xếp loại
						result.finalScore = row[row.length - 2] ? Number(row[row.length - 2]) : undefined
						result.gradeText = String(row[row.length - 1] || '').trim()

						return result
					})
				resolve(scores)
			} catch (error) {
				reject(new Error('Lỗi khi xử lý file Excel'))
			}
		}
		reader.onerror = () => {
			reject(new Error('Lỗi khi đọc file'))
		}

		reader.readAsArrayBuffer(file)
	})
}

/**
 * Tính xếp loại dựa trên điểm trung bình
 */
export function calculateGradeText(averageScore: number): string {
	if (averageScore >= 9.0) return 'Xuất sắc'
	if (averageScore >= 8.0) return 'Giỏi'
	if (averageScore >= 7.0) return 'Khá'
	if (averageScore >= 5.5) return 'Trung bình'
	return 'Yếu'
}

/** * Validate dữ liệu điểm
 */
export function validateScores(scores: ExcelScoreRow[]): { valid: boolean; errors: string[] } {
	const errors: string[] = []

	scores.forEach((row, index) => {
		const rowNum = index + 2 // +2 vì có header và index bắt đầu từ 0

		// Kiểm tra topicId
		if (!row.topicId) {
			errors.push(`Dòng ${rowNum}: Thiếu mã đề tài`)
		}

		// Kiểm tra điểm (nếu có) - sử dụng councilScores
		row.councilScores.forEach((councilScore, idx) => {
			if (councilScore.score !== undefined && (councilScore.score < 0 || councilScore.score > 10)) {
				errors.push(`Dòng ${rowNum}: Điểm thành viên ${idx + 1} không hợp lệ (phải từ 0-10)`)
			}
		})
	})

	return {
		valid: errors.length === 0,
		errors
	}
}
