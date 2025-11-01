import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { BarChart3, UserPlus } from 'lucide-react'

const ManageAI = () => {
	return (
		<div className='space-y-8'>
			<Tabs defaultValue='overview' className='w-full space-y-8'>
				<TabsList className='grid w-full grid-cols-5'>
					<TabsTrigger value='overview'>Tổng quan</TabsTrigger>
					<TabsTrigger value='manageChatbot'>Quản lý Chatbot</TabsTrigger>
					<TabsTrigger value='manageAISuggestion'>Quản lý gợi ý AI</TabsTrigger>s{' '}
				</TabsList>
				<TabsContent value='overview' className='space-y-6'>
					{/* Stats Cards */}
					<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
						<Card className='bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>Lượt truy vấn với chat bot</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-xs text-muted-foreground'>+12% so với tháng trước</p>
							</CardContent>
						</Card>

						<Card className='bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Kết nối thành công tính đến {new Date().toLocaleDateString('vi-VN')}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className='text-xs text-muted-foreground'>1200 lượt</p>
							</CardContent>
						</Card>
					</div>

					{/* Recent Activities */}
					<Card className='bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
						<CardHeader>
							<CardTitle>Hoạt động gần đây</CardTitle>
							<CardDescription>Các hoạt động mới nhất trong hệ thống</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='h-2 w-2 rounded-full bg-primary'></div>
							<div className='flex-1'></div>
						</CardContent>
					</Card>

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
			</Tabs>
		</div>
	)
}

export default ManageAI
