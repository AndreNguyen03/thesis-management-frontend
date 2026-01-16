import type { ScoreType } from "./defenseCouncil.model"

// === EVALUATION TEMPLATE & DETAILED SCORING TYPES ===
export interface SubCriterion {
	id: string
	name: string
	maxScore: number
	elos: string
}

export interface EvaluationCritera {
	id: string
	category: string
	maxScore: number
	elos: string[]
	subcriteria?: SubCriterion[]
}

export interface EvaluationTemplate {
	_id: string
	name: string
	description?: string
	facultyId: string
	criteria: EvaluationCritera[]
	version: number
	createdAt: string
	updatedAt: string
}

export interface DetailedCriterionScore {
	criterionId: string
	subcriterionId?: string // Optional - nếu là tiêu chí con
	score: number
	maxScore: number
	elo?: string
}

export interface SaveDraftScoreDto {
	studentId?: string
	detailedScores: DetailedCriterionScore[]
	comment?: string
}

export interface SubmitDetailedScoreDto {
	studentId?: string
	detailedScores: DetailedCriterionScore[]
	totalScore: number
	comment?: string
}

export interface DraftScoreResponse {
	councilId: string
	topicId: string
	scorerId: string
	studentId: string
	detailedScores: DetailedCriterionScore[]
	total?: number
	scoreAt: string
	updatedAt: string
}

// ScoreState for frontend form
export interface ScoreDto {
    scorerId: string
    scorerName: string
    scoreType: ScoreType
    total: number // Tổng điểm (tự động tính từ detailedScores hoặc nhập thủ công cho hệ thống cũ)
    comment: string
    detailedScores?: DetailedCriterionScore[] // Optional để tương thích với data cũ
    studentId?: string // Optional - chỉ dùng khi topic có nhiều SV và chấm riêng
    scoredAt: Date
    lastModifiedBy?: string
    lastModifiedAt?: Date
}


export interface ScoreState {
	[criterionId: string]: {
		mainScore: number | null
		subScores: { [subCriterionId: string]: number | null }
	}
}
// Backend response for getMyScoreForTopic
export interface StudentScoreState {
	studentId: string
	scoreState: ScoreState
}

export interface MyScoreResponse {
	message: string
	data: StudentScoreState[] | null
}
