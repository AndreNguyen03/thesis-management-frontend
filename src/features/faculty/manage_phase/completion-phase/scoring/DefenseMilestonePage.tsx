import type { CouncilMemberSnapshot, DefenseResult } from '@/models'
import { getGradeText } from '@/utils/grade-utils'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ScoringPanel, TopicScoringList } from './components'
import { useGetDetailTopicsInDefenseMilestonesQuery } from '@/services/topicApi'
import MilestoneHeader from './components/MilestoneHeader'
import { TopicsTable } from './components/TopicsTable'

// Mock data - replace with actual API call when service is ready

export default function DefenseScoringPage() {
	const { id: milestoneId } = useParams()
	const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
	const [scoringData, setScoringData] = useState<Record<string, DefenseResult>>({})

	// Get milestone data - replace with actual API when ready
	const {
		data: detailTopicsData,
		isLoading: isLoadingMilestones,
		refetch: refetchMilestones
	} = useGetDetailTopicsInDefenseMilestonesQuery(milestoneId!)

	const handleTopicSelect = (topicId: string) => {
		setSelectedTopic(topicId)
	}

	const handleScoringUpdate = (topicId: string, councilMemberScores: CouncilMemberSnapshot[]) => {
		// Calculate final score as average
		const scores = councilMemberScores.map((m) => m.score).filter((score) => score !== undefined && score !== null)
		const finalScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

		// Determine grade text based on score
		const gradeText = getGradeText(finalScore)

		const defenseResult: DefenseResult = {
			defenseDate: new Date(),
			periodName: detailTopicsData?.milestoneInfo?.title || '',
			finalScore,
			gradeText,
			councilMembers: councilMemberScores,
			councilName: 'Hội đồng bảo vệ'
		}

		setScoringData((prev) => ({
			...prev,
			[topicId]: defenseResult
		}))
	}

	const handleSaveScores = async () => {
		if (Object.keys(scoringData).length === 0) {
			toast.error('Vui lòng nhập điểm cho ít nhất một đề tài')
			return
		}

		try {
			// Prepare payload to save to backend
			const payload = {
				milestoneId,
				scoringData
			}

			// Call API to save scores
			// await saveMilestoneScores(payload).unwrap()

			toast.success('Lưu điểm chấm bảo vệ thành công', { richColors: true })

			// Reset state
			setScoringData({})
			setSelectedTopic(null)
			await refetchMilestones()
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}
	return (
		<div className='flex w-full flex-col gap-4 p-6'>
			{detailTopicsData && <MilestoneHeader milestone={detailTopicsData.milestoneInfo} />}
			<TopicsTable topics={detailTopicsData?.topics ?? []} isLoading={isLoadingMilestones} />
			<div className='flex h-full w-full gap-6 bg-background'>
				{/* Left Panel - Topics List */}
				<TopicScoringList
					topics={detailTopicsData?.topics ?? []}
					selectedTopic={selectedTopic}
					onSelectTopic={handleTopicSelect}
					isScoringSubmitted={(topicId) => !!scoringData[topicId]}
					isLoading={isLoadingMilestones}
				/>

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
		</div>
	)
}
