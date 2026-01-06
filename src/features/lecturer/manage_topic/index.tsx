import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePageBreadcrumb } from '@/hooks'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

const tabValues = ['draft', 'submitted'] as const

const LecturerManageTopics = () => {
	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý đề tài', path: '/manage-topic' }
	])
	const navigate = useNavigate()
	const location = useLocation()
	const lastPath = location.pathname.split('/').pop()
	const currentTab = tabValues.includes(lastPath as any) ? lastPath : 'draft'

	const handleTabChange = (value: string) => {
		navigate(`/manage-topics/${value}`)
	}

	return (
		<div className='pt-6 h-full flex-1 overflow-auto'>
			<Tabs value={currentTab} onValueChange={handleTabChange} className='h-full w-full'>
				<TabsList variant='underline'>
					<TabsTrigger variant='underline' value='draft'>
						Các bản nháp đề tài
					</TabsTrigger>
					<TabsTrigger variant='underline' value='submitted'>
						Các đề tài đã nộp
					</TabsTrigger>
				</TabsList>
				<TabsContent value='draft'>
					<Outlet />
				</TabsContent>
				<TabsContent value='submitted'>
					<Outlet />
				</TabsContent>
			</Tabs>
		</div>
	)
}

export default LecturerManageTopics
