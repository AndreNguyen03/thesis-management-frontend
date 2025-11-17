import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { BarChart3, UserPlus, Users } from 'lucide-react'
import ManageChatbot from './manage_chatbot/ManageChatbot'

const ManageAI = () => {
	return (
		<div className='space-y-2'>
			<Tabs defaultValue='overview' className='w-full space-y-8'>
				<TabsList className='grid w-full grid-cols-5'>
					<TabsTrigger value='overview'>Tổng quan</TabsTrigger>
					<TabsTrigger value='manageChatbot'>Quản lý Chatbot</TabsTrigger>
					<TabsTrigger value='manageAISuggestion'>Quản lý gợi ý AI</TabsTrigger>
				</TabsList>
				<TabsContent value='overview' className='space-y-4'>
					<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
						<Card className='bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>Số lượt truy vấn với chatbot</CardTitle>
								<Users className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<p className='text-xs text-muted-foreground'>1 triệu lượt</p>
								<p className='text-xs text-muted-foreground'>+12% so với tháng trước</p>
							</CardContent>
						</Card>

						<Card className='bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Kết nối sinh viên - giảng viên thành công
								</CardTitle>
								<Users className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>1000 lượt</div>
								<p className='text-xs text-muted-foreground'>+5% so với tháng trước</p>
							</CardContent>
						</Card>
					</div>
					{/* Quick Actions */}
					<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
						<Card className='bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
							<CardHeader>
								<CardTitle>Quản lý tài khoản</CardTitle>
								<CardDescription>Thêm, sửa, xóa tài khoản người dùng</CardDescription>
							</CardHeader>
							<CardContent>
								<Button className='w-full bg-gradient-primary text-primary-foreground hover:bg-primary-hover'>
									<UserPlus className='mr-2 h-4 w-4' />
									Tạo tài khoản mới
								</Button>
							</CardContent>
						</Card>

						<Card className='bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
							<CardHeader>
								<CardTitle>Báo cáo & Thống kê</CardTitle>
								<CardDescription>Tạo và xuất báo cáo hệ thống</CardDescription>
							</CardHeader>
							<CardContent>
								<Button className='w-full bg-gradient-primary text-primary-foreground hover:bg-primary-hover'>
									<BarChart3 className='mr-2 h-4 w-4' />
									Tạo báo cáo mới
								</Button>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
				<ManageChatbot />
			</Tabs>
		</div>
	)
}

export default ManageAI
