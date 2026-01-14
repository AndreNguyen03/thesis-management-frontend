import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import type { DashboardType, LecturerTopicExecution } from '@/models/period.model'
import { useNavigate } from 'react-router-dom'
import { Folder } from 'lucide-react'

interface TopicExecutionCardProps {
	dashboardData: DashboardType
}

export function TopicExecutionCard({ dashboardData }: TopicExecutionCardProps) {
	const navigate = useNavigate()

	/* ---------------- Registered State ---------------- */
	if (dashboardData.topicData.length === 0) return null

	return (
		<Card className='rounded-xl border-primary/20 bg-primary/5 p-0'>
			<CardHeader className='pb-3'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Folder className='h-5 w-5 text-primary' />
					Nhóm đề tài
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				{/* List */}
				<div className='min-w-full space-y-3 overflow-x-auto sm:overflow-x-visible'>
					{(dashboardData.topicData as LecturerTopicExecution[]).map((topic) => {
						return (
							<Card key={topic._id} className='border-border p-0'>
								<CardContent className='space-y-3 p-4 sm:p-3 md:p-4 lg:p-6'>
									{/* Header */}
									<div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
										<div>
											<h4 className='text-base font-semibold leading-tight'>{topic.titleVN}</h4>
											<p className='text-sm text-muted-foreground'>{topic.titleVN}</p>
										</div>
										<Button
											size='default'
											className='w-full sm:w-auto'
											onClick={() => navigate(`/group-workspace/${topic.groupId}`)}
										>
											Vào nhóm
										</Button>
									</div>
								</CardContent>
							</Card>
						)
					})}
				</div>
			</CardContent>
		</Card>
	)
}
