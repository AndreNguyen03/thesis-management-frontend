import { useState, useEffect, useCallback, useRef } from 'react'
import { debounce } from 'lodash'

interface DetailedCriterionScore {
	criterionId: string
	score: number
	subScores?: {
		subCriterionId: string
		score: number
	}[]
}

interface DraftScoreData {
	studentId: string
	detailedScores: DetailedCriterionScore[]
	totalScore?: number
	timestamp: number // For 7-day expiry check
}

interface UseEvaluationDraftOptions {
	councilId: string
	topicId: string
	userId: string
	studentIndex: number
	autoSaveDelay?: number // ms, default 3000
	expiryDays?: number // days, default 7
}

interface UseEvaluationDraftReturn {
	draftData: DraftScoreData | null
	saveDraft: (data: Partial<DraftScoreData>) => void
	clearDraft: () => void
	isExpired: boolean
	lastSaved: Date | null
}

const DRAFT_KEY_PREFIX = 'evaluation_draft'

/**
 * Hook quản lý draft scores trong localStorage với auto-save
 * - Auto-save debounced (default 3s)
 * - Load on mount
 * - Clear on submit
 * - 7-day expiry check
 */
export function useEvaluationDraft({
	councilId,
	topicId,
	userId,
	studentIndex,
	autoSaveDelay = 3000,
	expiryDays = 7
}: UseEvaluationDraftOptions): UseEvaluationDraftReturn {
	const storageKey = `${DRAFT_KEY_PREFIX}_${councilId}_${topicId}_${userId}_${studentIndex}`
	const [draftData, setDraftData] = useState<DraftScoreData | null>(null)
	const [isExpired, setIsExpired] = useState(false)
	const [lastSaved, setLastSaved] = useState<Date | null>(null)

	// Load draft from localStorage on mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem(storageKey)
			if (stored) {
				const parsed: DraftScoreData = JSON.parse(stored)
				const expiryMs = expiryDays * 24 * 60 * 60 * 1000
				const isDataExpired = Date.now() - parsed.timestamp > expiryMs

				if (isDataExpired) {
					// Auto-clear expired draft
					localStorage.removeItem(storageKey)
					setIsExpired(true)
					setDraftData(null)
				} else {
					setDraftData(parsed)
					setLastSaved(new Date(parsed.timestamp))
					setIsExpired(false)
				}
			}
		} catch (error) {
			console.error('Failed to load evaluation draft:', error)
			localStorage.removeItem(storageKey)
		}
	}, [storageKey, expiryDays])

	// Debounced save function
	const debouncedSave = useRef(
		debounce((key: string, data: DraftScoreData) => {
			try {
				localStorage.setItem(key, JSON.stringify(data))
				setLastSaved(new Date(data.timestamp))
			} catch (error) {
				console.error('Failed to save evaluation draft:', error)
				// Handle quota exceeded or other errors
				if (error instanceof Error && error.name === 'QuotaExceededError') {
					// Try to clear old drafts
					clearOldDrafts()
					// Retry save
					try {
						localStorage.setItem(key, JSON.stringify(data))
					} catch {
						console.error('Failed to save draft even after cleanup')
					}
				}
			}
		}, autoSaveDelay)
	).current

	// Save draft (debounced)
	const saveDraft = useCallback(
		(partialData: Partial<DraftScoreData>) => {
			const newData: DraftScoreData = {
				studentId: partialData.studentId || draftData?.studentId || '',
				detailedScores: partialData.detailedScores || draftData?.detailedScores || [],
				totalScore: partialData.totalScore ?? draftData?.totalScore,
				timestamp: Date.now()
			}
			setDraftData(newData)
			debouncedSave(storageKey, newData)
		},
		[draftData, storageKey, debouncedSave]
	)

	// Clear draft immediately
	const clearDraft = useCallback(() => {
		try {
			localStorage.removeItem(storageKey)
			setDraftData(null)
			setLastSaved(null)
			debouncedSave.cancel() // Cancel any pending saves
		} catch (error) {
			console.error('Failed to clear evaluation draft:', error)
		}
	}, [storageKey, debouncedSave])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			debouncedSave.cancel()
		}
	}, [debouncedSave])

	return {
		draftData,
		saveDraft,
		clearDraft,
		isExpired,
		lastSaved
	}
}

// Helper: Clear old evaluation drafts (called when quota exceeded)
function clearOldDrafts() {
	try {
		const keys = Object.keys(localStorage)
		const draftKeys = keys.filter((key) => key.startsWith(DRAFT_KEY_PREFIX))

		const draftsWithAge = draftKeys
			.map((key) => {
				try {
					const data = JSON.parse(localStorage.getItem(key) || '{}')
					return { key, timestamp: data.timestamp || 0 }
				} catch {
					return { key, timestamp: 0 }
				}
			})
			.sort((a, b) => a.timestamp - b.timestamp) // Oldest first

		// Remove oldest 50% of drafts
		const toRemove = draftsWithAge.slice(0, Math.ceil(draftsWithAge.length / 2))
		toRemove.forEach(({ key }) => {
			localStorage.removeItem(key)
		})

		console.log(`Cleared ${toRemove.length} old evaluation drafts`)
	} catch (error) {
		console.error('Failed to clear old drafts:', error)
	}
}
