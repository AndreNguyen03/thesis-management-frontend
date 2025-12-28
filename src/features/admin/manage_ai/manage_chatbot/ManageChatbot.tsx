import { TabsContent } from '@radix-ui/react-tabs'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ChatbotConfig from './components/ChatbotConfig'
import { ChatbotSocketProvider } from '@/contexts/ChatbotSocketContext'
import ResourceList from './components/ResourceList'

const ManageChatbot = () => {
	return (
		<ChatbotSocketProvider>
			<TabsContent value='manageChatbot' className='space-y-4'>
				<Tabs defaultValue='config' className='w-full'>
					<TabsList className='grid w-full grid-cols-2'>
						<TabsTrigger value='config'>Cấu hình</TabsTrigger>
						<TabsTrigger value='resources'>Tài nguyên</TabsTrigger>
					</TabsList>

					<TabsContent value='config' className='mt-6'>
						<ChatbotConfig />
					</TabsContent>

					<TabsContent value='resources' className='mt-6'>
						<ResourceList />
					</TabsContent>
				</Tabs>
			</TabsContent>
		</ChatbotSocketProvider>
	)
}

export default ManageChatbot
