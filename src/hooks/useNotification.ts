import { NotificationSocketContext } from "@/contexts/NotificationSocketContext"
import { useContext } from "react"

export const useNotificationSocket = () => {
	const context = useContext(NotificationSocketContext)
	if (!context) {
		throw new Error('useNotificationSocket must be used within NotificationSocketProvider')
	}
	return context
}
