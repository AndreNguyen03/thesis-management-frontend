import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePageBreadcrumb } from '@/hooks'
import ManageTopicDraft from './draft/ManageDraftTopic'
import ManageSubmittedTopics from './submitted_topic/ManageSubmittedTopics'

const LecturerManageTopics = () => {
	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý đề tài', path: '/manage-topic' }
	])
	return (
		<div className='max-h-[calc(100vh)] flex-1 overflow-auto'>
			<Tabs defaultValue='topic-draft' className='h-full w-full'>
				<TabsList variant='underline' defaultValue='topic-draft'>
					<TabsTrigger variant='underline' value='topic-draft'>
						Các bản nháp đề tài
					</TabsTrigger>
					<TabsTrigger variant='underline' value='submitted-topics'>
						Các đề tài đã nộp
					</TabsTrigger>
				</TabsList>

				<TabsContent value='topic-draft'>
					<ManageTopicDraft />
				</TabsContent>
				<TabsContent value='submitted-topics'>
					<ManageSubmittedTopics />
				</TabsContent>
			</Tabs>
		</div>
	)
}

export default LecturerManageTopics
