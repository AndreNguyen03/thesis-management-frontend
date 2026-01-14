import { TabsContent } from '@radix-ui/react-tabs'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ChatbotConfig from './components/ChatbotConfig'
import ResourceList from './components/ResourceList'

const ManageChatbot = () => {
	return (
		<Tabs defaultValue='config' className='w-full p-4'>
			<TabsList className='grid w-fit grid-cols-2 gap-2'>
				<TabsTrigger value='config'>Cấu hình</TabsTrigger>
				<TabsTrigger value='resources'>Tài nguyên</TabsTrigger>
			</TabsList>

			<TabsContent value='config'>
				<ChatbotConfig />
			</TabsContent>

			<TabsContent value='resources'>
				<ResourceList />
			</TabsContent>
		</Tabs>
	)
}

export default ManageChatbot
