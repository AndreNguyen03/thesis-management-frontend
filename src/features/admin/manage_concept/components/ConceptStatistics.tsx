import { ConceptStatistics as ConceptStats } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react'

interface ConceptStatisticsProps {
	statistics: ConceptStats | null
	isLoading?: boolean
}

export function ConceptStatistics({ statistics, isLoading }: ConceptStatisticsProps) {
	if (isLoading) {
		return (
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{[1, 2, 3, 4].map((i) => (
					<Card key={i}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>
								<div className='h-4 w-20 animate-pulse rounded bg-gray-200' />
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='h-8 w-16 animate-pulse rounded bg-gray-200' />
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	if (!statistics) return null

	return (
		<div className='space-y-4'>
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Tổng số</CardTitle>
						<TrendingUp className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{statistics.total}</div>
						<p className='text-xs text-muted-foreground'>Tất cả concept candidates</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Đang chờ</CardTitle>
						<Clock className='h-4 w-4 text-yellow-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-yellow-600'>{statistics.pending}</div>
						<p className='text-xs text-muted-foreground'>Chờ phê duyệt</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Đã duyệt</CardTitle>
						<CheckCircle className='h-4 w-4 text-green-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-green-600'>{statistics.approved}</div>
						<p className='text-xs text-muted-foreground'>Đã thêm vào ontology</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Từ chối</CardTitle>
						<XCircle className='h-4 w-4 text-red-500' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-red-600'>{statistics.rejected}</div>
						<p className='text-xs text-muted-foreground'>Không phù hợp</p>
					</CardContent>
				</Card>
			</div>

			{statistics.topCandidates.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className='text-base'>Top Candidates (Tần suất cao)</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							{statistics.topCandidates.map((candidate, idx) => (
								<div key={idx} className='flex items-center justify-between rounded-lg bg-gray-50 p-2'>
									<div className='flex items-center gap-2'>
										<Badge variant='outline' className='font-mono text-xs'>
											#{idx + 1}
										</Badge>
										<span className='font-medium'>{candidate.canonical}</span>
									</div>
									<Badge variant='secondary' className='font-mono'>
										{candidate.frequency}
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
