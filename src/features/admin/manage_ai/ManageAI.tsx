import { useBreadcrumb } from '@/hooks'
import ManageChatbotPage from './manage_chatbot/ManageChatbot'
import { useEffect } from 'react'

const ManageAI = () => {
	const { setHidden } = useBreadcrumb()

	useEffect(() => {
		setHidden(true)
	}, [setHidden])
	return <ManageChatbotPage />
}

export default ManageAI
