export interface GetStatiticInPeriod {
	periodId: string
	currentPhase: string

	//config for  submit topic phase
	rejectedTopicsNumber: number
	approvalTopicsNumber: number
	submittedTopicsNumber: number
	totalTopicsNumber: number
	adjustRequestTopicsNumber: number // new

	//config for open registration phase
	emptyTopicsNumber: number
	registeredTopicsNumber: number
	fullTopicsNumber: number
	totalTopicsInPhaseNumber: number

	//config for execution phase
	inNormalProcessingNumber: number
	delayedTopicsNumber: number
	pausedTopicsNumber: number
	submittedToReviewTopicsNumber: number
	readyForEvaluationNumber: number

	//config for completion phase
	// readyForEvaluationNumber: number
	gradedTopicsNumber: number
	assignedTopicsNumber: number
	achivedTopicsNumber: number
	rejectedFinalTopicsNumber: number
}
