# Hệ thống Quản lý Tài nguyên Chatbot RAG

## 📋 Tổng quan

Hệ thống quản lý tài nguyên cho chatbot RAG (Retrieval-Augmented Generation) với các tính năng:

- ✅ Quản lý cấu hình chatbot (tên, mô tả, trạng thái)
- ✅ Quản lý câu hỏi gợi ý (thêm, sửa, xóa, bật/tắt)
- ✅ Quản lý tài nguyên (URL crawl, văn bản trực tiếp)
- ✅ Theo dõi tiến trình crawl và embedding real-time qua Socket.IO
- ✅ Queue system tránh crash khi xử lý nhiều tài nguyên
- ✅ RTK Query cho state management và caching
- ✅ ChatbotSocketContext riêng biệt cho real-time updates

## 🏗️ Kiến trúc

### Frontend Structure

```
src/
├── contexts/
│   └── ChatbotSocketContext.tsx          # Socket context riêng cho chatbot
├── models/
│   ├── chatbot-resource.model.ts         # Types cho tài nguyên
│   └── chatbot-version.ts                # Types cho config chatbot
├── services/
│   └── chatbotApi.ts                     # RTK Query API endpoints
└── features/
    └── admin/
        └── manage_ai/
            └── manage_chatbot/
                ├── ManageChatbot.tsx     # Main component với tabs
                └── components/
                    ├── ChatbotConfig.tsx  # Cấu hình chatbot
                    ├── ResourceList.tsx   # Danh sách tài nguyên
                    └── ResourceDialog.tsx # Form thêm/sửa tài nguyên
```

### Socket Events

**Namespace:** `/chatbot`

**Events lắng nghe:**

- `crawl:progress` - Tiến trình crawl URL
- `crawl:completed` - Hoàn thành crawl
- `crawl:failed` - Thất bại khi crawl
- `embedding:progress` - Tiến trình embedding
- `embedding:completed` - Hoàn thành embedding
- `resource:created` - Tài nguyên mới được tạo
- `resource:updated` - Tài nguyên được cập nhật
- `resource:deleted` - Tài nguyên bị xóa

**Events phát:**

- `join:chatbot-admin` - Tham gia room admin
- `leave:chatbot-admin` - Rời room admin

## 🚀 Sử dụng

### 1. Cấu hình Chatbot

**Tab "Cấu hình":**

```tsx
// Chỉnh sửa thông tin chatbot
- Tên chatbot
- Mô tả
- Trạng thái (Enabled/Disabled)

// Quản lý câu hỏi gợi ý
- Thêm câu hỏi mới
- Chỉnh sửa câu hỏi
- Bật/tắt hiển thị
- Xóa câu hỏi
```

### 2. Quản lý Tài nguyên

**Tab "Tài nguyên":**

#### Thêm tài nguyên URL:

1. Click "Thêm tài nguyên"
2. Chọn loại "URL (Website)"
3. Nhập tiêu đề và URL
4. Submit → Hệ thống tự động crawl

#### Thêm văn bản trực tiếp:

1. Click "Thêm tài nguyên"
2. Chọn loại "Văn bản"
3. Nhập tiêu đề và nội dung
4. Submit → Hệ thống xử lý embedding

#### Theo dõi tiến trình:

- Progress bar hiển thị tiến độ crawl/embedding
- Toast notifications cho các sự kiện
- Real-time updates qua Socket

#### Xử lý lỗi:

- Nếu tài nguyên fail, click nút "Retry" để thử lại
- Xóa tài nguyên không cần thiết

## 🔧 API Endpoints

### Chatbot Config

```typescript
// GET /chatbots/chatbot-version/enabled
useGetChatbotVersionQuery()

// PATCH /chatbots/chatbot-version
useUpdateChatbotVersionMutation({ name, description, status })
```

### Query Suggestions

```typescript
// POST /chatbots/chatbot-version/query-suggestions
useCreateQuerySuggestionMutation({ content })

// PATCH /chatbots/chatbot-version/query-suggestions/:id
useUpdateQuerySuggestionMutation({ id, content, enabled })

// DELETE /chatbots/chatbot-version/query-suggestions/:id
useDeleteQuerySuggestionMutation(id)
```

### Resources

```typescript
// GET /chatbot/resources
useGetResourcesQuery({ page, limit, status, type })

// POST /chatbot/resources
useCreateResourceMutation({ title, url, type, content })

// PATCH /chatbot/resources/:id
useUpdateResourceMutation({ id, data })

// DELETE /chatbot/resources/:id
useDeleteResourceMutation(id)

// POST /chatbot/resources/:id/retry
useRetryResourceMutation(id)
```

## 💡 Best Practices

### 1. Crawl URL hiệu quả:

- Chỉ crawl các URL tin cậy
- Kiểm tra URL trước khi submit
- Không crawl quá nhiều trang cùng lúc (backend có queue)

### 2. Quản lý tài nguyên:

- Đặt tên rõ ràng cho tài nguyên
- Xóa tài nguyên cũ/không dùng
- Theo dõi số lượng từ và chunks

### 3. Real-time monitoring:

- Quan sát socket connection status
- Xử lý failed resources kịp thời
- Monitor progress của các tài nguyên đang xử lý

## 🐛 Troubleshooting

### Socket không kết nối:

```typescript
// Kiểm tra ChatbotSocketProvider đã wrap component chưa
<ChatbotSocketProvider>
  <YourComponent />
</ChatbotSocketProvider>
```

### Tài nguyên fail liên tục:

- Kiểm tra URL có hợp lệ không
- Kiểm tra backend có chạy không
- Xem logs ở backend để debug

### Cache không update:

- RTK Query tự động invalidate cache
- Nếu không update, thử refresh trang
- Kiểm tra providesTags và invalidatesTags

## 📦 Dependencies

```json
{
	"@reduxjs/toolkit": "^2.x",
	"react-hook-form": "^7.x",
	"zod": "^3.x",
	"socket.io-client": "^4.x",
	"sonner": "^1.x",
	"date-fns": "^3.x"
}
```

## 🔐 Backend Requirements

Backend cần implement:

1. **Queue System** - BullMQ hoặc tương tự
2. **Socket.IO Server** - Namespace `/chatbot`
3. **Crawling Service** - Puppeteer/Cheerio
4. **Embedding Service** - OpenAI/Cohere
5. **Vector Database** - Pinecone/Weaviate/Qdrant

## 📝 Notes

- Socket connection được quản lý tự động
- RTK Query cache được tự động invalidate
- Progress map được lưu local để tránh mất data khi re-render
- ChatbotSocketContext tách biệt với ChatSocketContext chính

---

**Developed with ❤️ for thesis management system**
