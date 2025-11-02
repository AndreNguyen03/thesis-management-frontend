import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { TabsContent } from '@radix-ui/react-tabs'
import { Users } from 'lucide-react'

const ManageChatbot = () => {
	return (
		<TabsContent value='manageChatbot' className='space-y-6'>
			{/* Stats Cards */}
			<div className='grid grid-cols-2 gap-6'>
				<Card className='bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Chatbot</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<p className='text-xs text-muted-foreground'>Tên hiển thị: UIT chatbot</p>
						<p className='text-xs text-muted-foreground'>+12% so với tháng trước</p>
					</CardContent>
				</Card>
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
			</div>
			<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
				<Card>
					<CardHeader>
						<CardTitle>Thông tin Chatbot</CardTitle>
						<CardDescription>Thông tin cần hiển thị</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className='bg-gradient-primary text-primary-foreground hover:bg-primary-hover'>
							Xem thông tin chi tiết
						</Button>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Quản lý kho tri thức</CardTitle>
						<CardDescription>Cấu hình và quản lý kho tri thức</CardDescription>
					</CardHeader>
					<CardContent>
						<Button className='bg-gradient-primary text-primary-foreground hover:bg-primary-hover'>
							Quản lý kho tri thức
						</Button>
					</CardContent>
				</Card>
			</div>
		</TabsContent>
	)
}

export default ManageChatbot
