/* ================= HOOK ================= */

import { ChatContext } from "@/contexts/ChatSocketContext"
import { useContext } from "react"

export const useChat = () => {
	const ctx = useContext(ChatContext)
	if (!ctx) throw new Error('useChat must be used inside ChatProvider')
	return ctx
}
