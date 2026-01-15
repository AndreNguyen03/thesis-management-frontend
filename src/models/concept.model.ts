export enum ConceptCandidateStatus {
	PENDING = 'pending',
	APPROVED = 'approved',
	REJECTED = 'rejected'
}

export interface ConceptCandidateExample {
	profileId: string
	profileType: string
	source: string
	token: string
}

export interface ConceptCandidate {
	_id: string
	canonical: string
	variants: string[]
	frequency: number
	examples: ConceptCandidateExample[]
	suggestedParent?: string
	suggestedLabel?: string
	suggestedAliases?: string[]
	status: ConceptCandidateStatus
	createdAt: string
	approvedAt?: string
	approvedBy?: string
	rejectionReason?: string
	approvedConceptKey?: string
}

export interface ConceptStatistics {
	total: number
	pending: number
	approved: number
	rejected: number
	topCandidates: Array<{ canonical: string; frequency: number }>
}

export interface ConceptCandidateListQuery {
	status?: ConceptCandidateStatus
	page?: number
	limit?: number
	sortBy?: string
	sortOrder?: 'asc' | 'desc'
}

export interface ConceptCandidateListResponse {
	data: ConceptCandidate[]
	total: number
	page: number
	limit: number
}

export interface ApproveConceptDto {
	key: string
	label: string
	aliases: string[]
	parent?: string
	description?: string
}

export interface RejectConceptDto {
	reason: string
}

// Concept ontology models
export interface Concept {
	_id: string
	key: string
	label: string
	aliases?: string[]
	description?: string
	createdAt?: string
	updatedAt?: string
}

export interface ConceptTreeNode {
	key: string
	label: string
	children: ConceptTreeNode[]
	depth: number
	parent: string | null
	hasAliases: boolean
	aliasCount: number
}

export interface ConceptTreeResponse {
	root: ConceptTreeNode
	totalConcepts: number
	maxDepth: number
}
