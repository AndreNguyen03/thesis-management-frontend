# Hướng dẫn tích hợp Socket Notification

## Tổng quan

Socket notification đã được tích hợp vào hệ thống thông qua:

1. **SocketService** - Quản lý nhiều namespace socket
2. **NotificationSocketContext** - Context quản lý notification realtime
3. Tích hợp vào App.tsx

## Cấu trúc

### 1. Socket Service (src/services/socket.service.ts)

Service singleton hỗ trợ nhiều namespace:

- `/chat` - Cho chat messages
- `/notification` - Cho notifications

**Các phương thức chính:**

```typescript
socketService.connect(userId, namespace) // Kết nối đến namespace
socketService.getSocket(namespace) // Lấy socket instance
socketService.emit(namespace, event, data) // Gửi event
socketService.on(namespace, event, handler) // Lắng nghe event
socketService.disconnect(namespace) // Ngắt kết nối
```

### 2. Notification Socket Context (src/contexts/NotificationSocketContext.tsx)

Context Provider cung cấp:

```typescript
interface NotificationSocketContextValue {
	notifications: NotificationItem[] // Danh sách notification
	unreadCount: number // Số lượng chưa đọc
	isConnected: boolean // Trạng thái kết nối
	markAsRead: (id: string) => void // Đánh dấu đã đọc
	markAllAsRead: () => void // Đánh dấu tất cả đã đọc
	refetch: () => void // Làm mới dữ liệu
}
```

**Events từ Backend:**

- `new_notification` - Nhận notification mới
- `notification_read` - Notification đã được đọc
- `all_notifications_read` - Tất cả đã được đọc

**Events gửi đến Backend:**

- `mark_notification_read` - Đánh dấu 1 notification đã đọc
- `mark_all_notifications_read` - Đánh dấu tất cả đã đọc

### 3. Sử dụng trong Component

#### Cách 1: Sử dụng hook trong component

```tsx
import { useNotificationSocket } from '@/contexts/NotificationSocketContext'

function MyComponent() {
	const { notifications, unreadCount, markAsRead, isConnected } = useNotificationSocket()

	return (
		<div>
			<p>Chưa đọc: {unreadCount}</p>
			<p>Trạng thái: {isConnected ? 'Connected' : 'Disconnected'}</p>
			{notifications.map((notif) => (
				<div key={notif._id} onClick={() => markAsRead(notif._id)}>
					{notif.title}
				</div>
			))}
		</div>
	)
}
```

#### Cách 2: Update NotificationPopover (Optional)

Nếu muốn sử dụng real-time thay vì polling:

```tsx
import { useNotificationSocket } from '@/contexts/NotificationSocketContext'

export function NotificationPopover() {
	// Thay vì useGetNotificationsQuery
	const { notifications, unreadCount, markAsRead, markAllAsRead, isConnected } = useNotificationSocket()

	// Vẫn có thể kết hợp với RTK Query để fetch initial data
	const { data: apiNotifications } = useGetNotificationsQuery({
		page: 1,
		limit: 10,
		sort_by: 'createdAt',
		sort_order: 'desc'
	})

	// Merge real-time notifications với data từ API
	const allNotifications = useMemo(() => {
		const socketIds = new Set(notifications.map((n) => n._id))
		const apiOnly = apiNotifications?.data?.filter((n) => !socketIds.has(n._id)) || []
		return [...notifications, ...apiOnly]
	}, [notifications, apiNotifications])

	// Rest of component...
}
```

## Các Events Backend cần implement

Backend của bạn cần emit các events sau:

### 1. new_notification

```typescript
// Khi có notification mới
socket.emit('new_notification', {
	_id: 'notif_id',
	title: 'Tiêu đề',
	message: 'Nội dung',
	type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO' | 'SYSTEM',
	isRead: false,
	createdAt: new Date(),
	metadata: {
		topicId: '...',
		actionUrl: '...'
		// ... other data
	}
})
```

### 2. notification_read

```typescript
// Sau khi mark notification là read
socket.emit('notification_read', {
	notificationId: 'notif_id'
})
```

### 3. all_notifications_read

```typescript
// Sau khi mark all notifications là read
socket.emit('all_notifications_read', {})
```

## Backend Socket Events cần listen

### 1. mark_notification_read

```typescript
socket.on('mark_notification_read', async ({ notificationId }) => {
	// Update database
	await markNotificationAsRead(notificationId)

	// Broadcast to user's other devices
	socket.emit('notification_read', { notificationId })
})
```

### 2. mark_all_notifications_read

```typescript
socket.on('mark_all_notifications_read', async () => {
	const userId = socket.data.userId

	// Update database
	await markAllNotificationsAsRead(userId)

	// Broadcast to user's other devices
	socket.emit('all_notifications_read', {})
})
```

## Backend Namespace Setup

Đảm bảo backend có namespace `/notification`:

```typescript
// backend/src/socket/notification.gateway.ts (hoặc tương tự)
import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
	namespace: '/notification',
	cors: { origin: '*' }
})
export class NotificationGateway {
	@WebSocketServer()
	server: Server

	handleConnection(client: Socket) {
		const userId = client.handshake.auth.userId
		console.log(`User ${userId} connected to /notification`)

		// Join room theo userId để có thể broadcast riêng
		client.join(`user:${userId}`)
	}

	handleDisconnect(client: Socket) {
		console.log('Client disconnected from /notification')
	}

	// Send notification đến user cụ thể
	sendToUser(userId: string, notification: any) {
		this.server.to(`user:${userId}`).emit('new_notification', notification)
	}

	@SubscribeMessage('mark_notification_read')
	async handleMarkRead(@ConnectedSocket() client: Socket, @MessageBody() data: { notificationId: string }) {
		const userId = client.handshake.auth.userId

		// Update database
		await this.notificationService.markAsRead(data.notificationId)

		// Broadcast to all user's devices
		this.server.to(`user:${userId}`).emit('notification_read', {
			notificationId: data.notificationId
		})
	}

	@SubscribeMessage('mark_all_notifications_read')
	async handleMarkAllRead(@ConnectedSocket() client: Socket) {
		const userId = client.handshake.auth.userId

		// Update database
		await this.notificationService.markAllAsRead(userId)

		// Broadcast to all user's devices
		this.server.to(`user:${userId}`).emit('all_notifications_read', {})
	}
}
```

## Testing

### 1. Test connection

Mở Console trong browser và kiểm tra logs:

```
🔔 Connecting to notification socket...
✅ [/notification] Socket connected: abc123
✅ Notification socket connected
```

### 2. Test nhận notification

Từ backend hoặc tool test, emit event `new_notification` và xem component có nhận không.

### 3. Test mark as read

Click vào notification và kiểm tra:

- Database có update `isRead = true`
- UI có update ngay lập tức
- Badge count có giảm

## Lưu ý

1. **Authentication**: Socket sử dụng `userId` từ `auth` trong handshake
2. **Reconnection**: Tự động reconnect khi mất kết nối
3. **Multiple Tabs**: Tất cả tabs của cùng user sẽ sync state
4. **Performance**: Socket service sử dụng singleton pattern, tránh duplicate connections
5. **Cleanup**: Tự động disconnect khi unmount component

## Troubleshooting

### Socket không connect

- Kiểm tra backend có chạy không
- Kiểm tra URL trong socket.service.ts (hiện tại: `http://localhost:3000`)
- Kiểm tra CORS settings

### Không nhận được notifications

- Kiểm tra event name có đúng không
- Kiểm tra userId có đúng không
- Xem Console logs để debug

### State không sync giữa các tabs

- Đảm bảo backend broadcast đến tất cả sockets của user
- Backend nên sử dụng rooms: `socket.join(\`user:\${userId}\`)`
