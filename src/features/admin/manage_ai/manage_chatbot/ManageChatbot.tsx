import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useGetChatbotVersionQuery } from '@/services/chatbotApi'
import { TabsContent } from '@radix-ui/react-tabs'
import { Users } from 'lucide-react'
import ManageInfor from './components/ManageInfor'
import ManageSuggestion from './components/ManageSuggestion'
import TitleBox from '@/components/TitleBox'
import { useState } from 'react'
import ManageKnowLedge from './components/manage-knowledge/ManageKnowLedge'

const ManageChatbot = () => {
	const { data: chatbotVersion } = useGetChatbotVersionQuery()
	const [isExpandedInfo, setIsExpandedInfo] = useState(true)
	const [isExpandedKnowledge, setIsExpandedKnowledge] = useState(true)
	return (
		<TabsContent value='manageChatbot' className='space-y-6'>
			<div className='grid grid-cols-2 gap-6'>
				<div className='col-span-2'>
					<TitleBox
						title='Thông tin hiển thị'
						isExpanded={isExpandedInfo}
						onClick={() => setIsExpandedInfo(!isExpandedInfo)}
					/>
				</div>
				{isExpandedInfo && (
					<>
						<Card className='col-span-1 w-full bg-card/95 p-1 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-lg font-medium'>Chatbot</CardTitle>
								<Users className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent className='flex flex-col space-y-2'>
								<ManageInfor chatbotVersion={chatbotVersion!} />
							</CardContent>
						</Card>
						<Card className='col-span-1 w-full bg-card/95 p-1 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-xl font-medium'>Gợi ý truy vấn đề xuất</CardTitle>
								<Users className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<ManageSuggestion chatbotVersion={chatbotVersion!} />
						</Card>
					</>
				)}
				<div className='col-span-2'>
					<TitleBox
						title='Quản lý kiến thức'
						isExpanded={isExpandedKnowledge}
						onClick={() => setIsExpandedKnowledge(!isExpandedKnowledge)}
					/>
				</div>
				{isExpandedKnowledge && (
					<div className='col-span-2 space-y-2'>
						<Card className='w-full bg-card/95 p-1 backdrop-blur supports-[backdrop-filter]:bg-card/60'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-xl font-medium'>Danh sách các nguồn kiến thức</CardTitle>
								<Users className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<ManageKnowLedge />
						</Card>
					</div>
				)}
			</div>
		</TabsContent>
	)
}

export default ManageChatbot
