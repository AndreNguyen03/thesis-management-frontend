import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useGetChatbotVersionQuery } from '@/services/chatbotApi'
import { TabsContent } from '@radix-ui/react-tabs'
import { Table, Users } from 'lucide-react'
import { DataTable } from './DataTable'
import { columns } from './Columns'

const ManageChatbot = () => {
	const { data: chatbotVersion } = useGetChatbotVersionQuery()
	const data = (chatbotVersion?.query_suggestions ?? []).map((item, idx) => ({
		index: idx + 1,
		content: item.content
	}))
	return (
		<TabsContent value='manageChatbot' className='space-y-6'>
			<div className='grid grid-cols-3 gap-6'>
				<Card className='bg-card/95 p-1 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium'>Chatbot</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<span className='flex space-x-2'>
							<p className='text-xs text-muted-foreground text-zinc-700'>Tên hiển thị:</p>
							<p className='text-xs text-muted-foreground'>UIT chatbot</p>
						</span>
						<span className='flex space-x-2'>
							<p className='text-xs text-muted-foreground text-zinc-700'>Mô tả ngắn:</p>
							<p className='text-xs text-muted-foreground'>UIT chatbot</p>
						</span>
						<span className='flex space-x-2'>
							<p className='text-xs text-muted-foreground text-zinc-700'>Trạng thái:</p>
							<p className='text-xs text-muted-foreground'>UIT chatbot</p>
						</span>
						<div className='overflow-hidden rounded-md border'>
							<DataTable columns={columns} data={data} />
						</div>
					</CardContent>
				</Card>
				<Card className='col-span-2 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-xl font-medium'>Số lượt truy vấn với chatbot</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<p className='text-xs text-muted-foreground'>1 triệu lượt</p>
						<p className='text-xs text-muted-foreground'>+12% so với tháng trước</p>
					</CardContent>
				</Card>
			</div>
		</TabsContent>
	)
}

export default ManageChatbot
