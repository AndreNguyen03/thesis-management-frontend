/* ================= HOOK ================= */

import { ChatbotSocketContext } from "@/contexts/ChatbotSocketContext"
import { useContext } from "react"

export const useChatbotSocket = () => {
	const context = useContext(ChatbotSocketContext)
	if (!context) {
		throw new Error('useChatbotSocket must be used within ChatbotSocketProvider')
	}
	return context
}
