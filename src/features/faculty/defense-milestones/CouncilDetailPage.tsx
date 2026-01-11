import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
	useGetCouncilByIdQuery,
	useUpdateTopicOrderMutation,
	useRemoveTopicFromCouncilMutation
} from '@/services/defenseCouncilApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MapPin, Users, Loader2, AlertCircle, Goal } from 'lucide-react'
import { toast } from 'sonner'
import TopicsInCouncilTable from './components/TopicsInCouncilTable'
import AddTopicDialog from './components/AddTopicDialog'
import { useGetPeriodDetailQuery } from '@/services/periodApi'
import CouncilHeader from './components/CouncilHeade'
import { useGetDefenseMilestoneDetailByIdQuery } from '@/services/milestoneApi'
import AwaitingTopicTable from './datatable/AwaitingTopicTable'

export default function CouncilDetailPage() {
	const { councilId, periodId, templateId } = useParams<{ councilId: string; periodId: string; templateId: string }>()
	const navigate = useNavigate()
	const [isAddTopicOpen, setIsAddTopicOpen] = useState(false)
	//endpoint lấy chi tiết hội đồng bảo vệ
	const { data: council, isLoading, error } = useGetCouncilByIdQuery(councilId!)
	//enpoitn lấy thông tin đợt bảo vệ
	const { data: defenseMilestoneDetail } = useGetDefenseMilestoneDetailByIdQuery(
		{ milestoneTemplateId: templateId || '' },
		{ skip: !templateId }
	)
	const { data: period } = useGetPeriodDetailQuery(periodId!)
	const [updateTopicOrder] = useUpdateTopicOrderMutation()
	const [removeTopic] = useRemoveTopicFromCouncilMutation()

	const handleReorderTopics = async (topicId: string, newOrder: number) => {
		if (!councilId) return
		try {
			await updateTopicOrder({ councilId, topicId, defenseOrder: newOrder }).unwrap()
			toast.success('Cập nhật thứ tự bảo vệ thành công')
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}

	const handleRemoveTopic = async (topicId: string) => {
		if (!councilId) return
		try {
			await removeTopic({ councilId, topicId }).unwrap()
			toast.success('Xóa đề tài khỏi hội đồng thành công')
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}

	if (isLoading) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		)
	}

	if (error || !council) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<div className='text-center'>
					<AlertCircle className='mx-auto h-12 w-12 text-red-500' />
					<h3 className='mt-4 text-lg font-semibold'>Không tìm thấy hội đồng</h3>
					<p className='mt-2 text-sm text-muted-foreground'>
						Hội đồng không tồn tại hoặc bạn không có quyền truy cập
					</p>
					<Button className='mt-4' onClick={() => navigate(-1)}>
						Quay lại
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className='container mx-auto space-y-6 p-6'>
			{/* Header */}
			<CouncilHeader council={council} period={period!} />

			{/* Council Info Card */}
			<Card className='p-1'>
				<CardHeader>
					<CardTitle>Thông tin hội đồng</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid gap-4 md:grid-cols-3'>
						<div className='flex items-center gap-3'>
							<Calendar className='h-5 w-5 text-muted-foreground' />
							<div>
								<p className='text-sm text-muted-foreground'>Thời gian</p>
								<p className='font-medium'>
									{new Date(council.scheduledDate).toLocaleString('vi-VN', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</p>
							</div>
						</div>
						<div className='flex items-center gap-3'>
							<MapPin className='h-5 w-5 text-muted-foreground' />
							<div>
								<p className='text-sm text-muted-foreground'>Địa điểm</p>
								<p className='font-medium'>{council.location}</p>
							</div>
						</div>
						<div className='flex items-center gap-3'>
							<Users className='h-5 w-5 text-muted-foreground' />
							<div>
								<p className='text-sm text-muted-foreground'>Số đề tài</p>
								<p className='font-medium'>{council.topics?.length || 0} đề tài</p>
							</div>
						</div>
						<div className='flex items-center gap-3'>
							<Goal className='h-5 w-5 text-muted-foreground' />
							<div>
								<p className='text-sm text-muted-foreground'>Đợt bảo vệ</p>
								<span className='text-[18px] font-semibold text-blue-700'>
									{defenseMilestoneDetail?.title}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Topics Table */}
			<Card className='p-1'>
				<CardHeader className='flex flex-row items-center justify-between'>
					<CardTitle>Danh sách đề tài ({council.topics?.length || 0})</CardTitle>
					<Button onClick={() => setIsAddTopicOpen(true)}>Thêm đề tài</Button>
				</CardHeader>
				<CardContent>
					{council.topics && council.topics.length > 0 ? (
						<TopicsInCouncilTable
							topics={council.topics}
							onReorder={handleReorderTopics}
							onRemove={handleRemoveTopic}
							councilId={councilId!}
						/>
					) : (
						<div className='py-12 text-center text-muted-foreground'>
							<p>Chưa có đề tài nào được phân công</p>
							<Button className='mt-4' onClick={() => setIsAddTopicOpen(true)}>
								Thêm đề tài đầu tiên
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Add Topic Dialog */}
			<AddTopicDialog
				open={isAddTopicOpen}
				onOpenChange={setIsAddTopicOpen}
				councilId={councilId!}
				milestoneTemplateId={council.milestoneTemplateId}
				periodId={periodId!}
			/>
			<AwaitingTopicTable />
		</div>
	)
}
    