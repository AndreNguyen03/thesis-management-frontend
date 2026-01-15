import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface ConceptCandidateExample {
	profileId: string
	profileType: string
	source: string
	token: string
}

export enum ConceptCandidateStatus {
	PENDING = 'pending',
	APPROVED = 'approved',
	REJECTED = 'rejected'
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

class ConceptService {
	private getAuthHeaders() {
		const token = localStorage.getItem('token')
		return {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		}
	}

	async getCandidates(query: ConceptCandidateListQuery = {}): Promise<ConceptCandidateListResponse> {
		const params = new URLSearchParams()
		if (query.status) params.append('status', query.status)
		if (query.page) params.append('page', query.page.toString())
		if (query.limit) params.append('limit', query.limit.toString())
		if (query.sortBy) params.append('sortBy', query.sortBy)
		if (query.sortOrder) params.append('sortOrder', query.sortOrder)

		const response = await axios.get(
			`${API_BASE_URL}/admin/concepts/candidates?${params.toString()}`,
			this.getAuthHeaders()
		)
		return response.data
	}

	async getStatistics(): Promise<ConceptStatistics> {
		const response = await axios.get(`${API_BASE_URL}/admin/concepts/candidates/statistics`, this.getAuthHeaders())
		return response.data
	}

	async getCandidateById(id: string): Promise<ConceptCandidate> {
		const response = await axios.get(`${API_BASE_URL}/admin/concepts/candidates/${id}`, this.getAuthHeaders())
		return response.data
	}

	async approveCandidate(id: string, data: ApproveConceptDto): Promise<ConceptCandidate> {
		const response = await axios.post(
			`${API_BASE_URL}/admin/concepts/candidates/${id}/approve`,
			data,
			this.getAuthHeaders()
		)
		return response.data
	}

	async rejectCandidate(id: string, data: RejectConceptDto): Promise<ConceptCandidate> {
		const response = await axios.post(
			`${API_BASE_URL}/admin/concepts/candidates/${id}/reject`,
			data,
			this.getAuthHeaders()
		)
		return response.data
	}

	async deleteCandidate(id: string): Promise<void> {
		await axios.delete(`${API_BASE_URL}/admin/concepts/candidates/${id}`, this.getAuthHeaders())
	}

	async reloadConceptIndex(): Promise<{ message: string; note: string }> {
		const response = await axios.post(`${API_BASE_URL}/admin/concepts/reload-index`, {}, this.getAuthHeaders())
		return response.data
	}
}

export const conceptService = new ConceptService()
