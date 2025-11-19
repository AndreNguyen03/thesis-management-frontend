import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePageBreadcrumb } from '@/hooks'
import ManageTopicDraft from './draft/ManageTopicDraft'

const LecturerManageTopics = () => {
	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý đề tài', path: '/manage-topic' }
	])

	return (
		<div>
			<Tabs defaultValue='topic-draft'>
				<TabsList variant='underline'>
					<TabsTrigger variant='underline' value='topic-draft'>
						Các bản nháp đề tài
					</TabsTrigger>
					<TabsTrigger variant='underline' value='password'>
						Các đề tài đã nộp
					</TabsTrigger>
				</TabsList>
				<TabsContent value='topic-draft'>
					<ManageTopicDraft />
				</TabsContent>
			</Tabs>
		</div>
	)
}

export default LecturerManageTopics
