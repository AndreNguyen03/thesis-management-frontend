import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ManageChatbotPage from './manage_chatbot/ManageChatbot'

const ManageAI = () => {
	return (
		<div className='container mx-auto p-6'>
			<h1 className='mb-6 text-3xl font-bold'>Quản lý AI</h1>
			<Tabs defaultValue='manageChatbot' className='w-full'>
				<TabsList>
					<TabsTrigger value='manageChatbot'>Quản lý Chatbot</TabsTrigger>
				</TabsList>
				<ManageChatbotPage />
			</Tabs>
		</div>
	)
}

export default ManageAI
