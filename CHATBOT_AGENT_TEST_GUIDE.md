# Hướng dẫn Test Agent Chatbot trên React Frontend

## 📦 Setup

### 1. Cài đặt dependencies (nếu chưa có)

```bash
cd thesis-management-frontend
npm install lucide-react
```

### 2. Thêm route vào router

```typescript
// src/router/index.tsx
import { ChatbotPage } from '@/features/chatbot/pages/ChatbotPage'

const router = createBrowserRouter([
  // ... các routes khác
  {
    path: '/chatbot-test',
    element: <ChatbotPage />
  }
])
```

### 3. Chạy backend

```bash
cd thesis-management-backend
npm run start:dev
```

### 4. Chạy frontend

```bash
cd thesis-management-frontend
npm run dev
```

### 5. Truy cập

```
http://localhost:5173/chatbot-test
```

---

## 🎯 Tính năng

### ✅ Có sẵn trong component

1. **Toggle Streaming/Normal Mode**
   - Bật/tắt streaming bằng checkbox ở header
   - Normal: Đợi full response (như Postman)
   - Streaming: Text xuất hiện dần (như ChatGPT)

2. **Message History**
   - Hiển thị lịch sử chat
   - Avatar cho user và bot
   - Timestamp cho mỗi tin nhắn

3. **Loading States**
   - Spinner khi đợi response (normal mode)
   - Blinking cursor khi streaming
   - Disable input khi đang xử lý

4. **Error Handling**
   - Catch lỗi network
   - Catch lỗi SSE
   - Hiển thị message lỗi cho user

5. **Keyboard Shortcuts**
   - Enter: Gửi message
   - Shift+Enter: Xuống dòng

---

## 🧪 Test Cases

### Test 1: Tìm đề tài (Normal Mode)

**Steps:**
1. Tắt "Streaming" checkbox
2. Gửi: "Tìm đề tài về AI"
3. Đợi 3-5s
4. Nhận full response một lần

**Expected:**
```
🤖 Agent: Dựa vào tìm kiếm, em tìm thấy 5 đề tài về AI:

1. Hệ thống chatbot thông minh...
2. Ứng dụng machine learning...
...
```

**Check console:**
```javascript
🔧 Tools used: ['search_topics']
📊 Steps: [{tool: 'search_topics', input: {query: 'AI', limit: 5}}]
```

---

### Test 2: Tìm đề tài (Streaming Mode)

**Steps:**
1. Bật "Streaming" checkbox
2. Gửi: "Tìm đề tài về blockchain"
3. Thấy text xuất hiện từng chữ

**Expected:**
```
🤖 Agent: Dựa... vào... tìm... kiếm... em... tìm... thấy... 5... đề... tài...
(Text xuất hiện dần như ChatGPT)
```

---

### Test 3: Multi-tool (Tìm đề tài + tài liệu)

**Input:**
```
"Tìm đề tài về web development và tài liệu hướng dẫn"
```

**Expected:**
- Agent gọi 2 tools: `search_topics` + `search_documents`
- Response có cả thông tin đề tài và tài liệu

**Check console:**
```javascript
🔧 Tools used: ['search_topics', 'search_documents']
```

---

### Test 4: Tìm tài liệu

**Input:**
```
"Quy trình đăng ký đề tài như thế nào?"
```

**Expected:**
- Agent chỉ gọi `search_documents`
- Response về quy trình

---

### Test 5: Chat history context

**Steps:**
1. Gửi: "Tìm đề tài về AI"
2. Gửi tiếp: "Còn về blockchain thì sao?"
3. Agent phải hiểu context từ câu trước

---

## 🎨 Customization

### Thay đổi màu sắc

```tsx
// AgentChat.tsx
// User message
className="bg-blue-500 text-white"  // Đổi thành màu khác

// Bot message
className="bg-white text-gray-800"  // Đổi thành màu khác

// Header gradient
className="from-blue-500 to-purple-600"  // Đổi gradient
```

### Thay đổi API URL

```tsx
// Nếu backend chạy port khác
const API_URL = 'http://localhost:4000'  // Thay vì 3000

fetch(`${API_URL}/chatbot-agent/chat`, ...)
```

### Thêm typing indicator

```tsx
const [isTyping, setIsTyping] = useState(false)

// Trong sendNormalChat
setIsTyping(true)
await fetch(...)
setIsTyping(false)

// Render
{isTyping && <TypingIndicator />}
```

---

## 🐛 Troubleshooting

### Lỗi: CORS

**Triệu chứng:**
```
Access to fetch at 'http://localhost:3000/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Giải pháp:**
```typescript
// Backend: main.ts
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true
})
```

---

### Lỗi: EventSource failed

**Triệu chứng:**
```
❌ SSE Error: Event
```

**Giải pháp:**
1. Check backend có chạy không
2. Check endpoint `/stream-chat` có đúng không
3. Check console backend có log lỗi không
4. Thử test bằng curl:
   ```bash
   curl -N http://localhost:3000/chatbot-agent/stream-chat?message=test
   ```

---

### Streaming không hoạt động

**Checklist:**
- ✅ Backend đã implement `@Sse()` decorator?
- ✅ Backend return `Observable<MessageEvent>`?
- ✅ Frontend dùng `EventSource` đúng cách?
- ✅ Network tab có thấy request type `eventsource`?

---

### Response quá chậm

**Nguyên nhân:**
- Agent đang gọi nhiều tools
- Vector search chậm
- LLM API chậm

**Giải pháp:**
- Reduce `maxIterations` trong Agent
- Optimize vector search (thêm index)
- Cache frequent queries
- Dùng Groq thay vì Gemini (nhanh hơn)

---

## 📱 Mobile Responsive

Component đã responsive, nhưng có thể cải thiện:

```tsx
// Thêm breakpoints
<div className="max-w-4xl mx-auto">  // Desktop
<div className="max-w-full px-2">   // Mobile

// Hide sidebar on mobile
<div className="hidden md:block">...</div>

// Stack buttons vertically on mobile
<div className="flex flex-col md:flex-row gap-2">...</div>
```

---

## 🚀 Production Checklist

- [ ] Replace `http://localhost:3000` với environment variable
- [ ] Add authentication/authorization
- [ ] Rate limiting
- [ ] Error boundary component
- [ ] Analytics tracking (track tool usage)
- [ ] Message persistence (save to DB)
- [ ] Export chat history
- [ ] Dark mode support
- [ ] Loading skeleton instead of spinner
- [ ] Markdown rendering cho response (bold, lists, etc.)

---

## 📊 Debug Tips

### 1. Check Agent Steps

```tsx
console.log('🔧 Tools used:', data.steps?.map(s => s.tool))
console.log('📊 Full steps:', data.steps)
```

### 2. Monitor SSE Events

```tsx
eventSource.addEventListener('message', (e) => {
    console.log('📨 SSE:', e.data)
})
```

### 3. Track Message Flow

```tsx
useEffect(() => {
    console.log('💬 Messages updated:', messages.length)
}, [messages])
```

### 4. Network Tab

- Chrome DevTools → Network tab
- Filter: `eventsource` hoặc `fetch`
- Check request/response payload
- Check streaming chunks

---

## 🎓 Nâng cao

### Thêm markdown rendering

```bash
npm install react-markdown
```

```tsx
import ReactMarkdown from 'react-markdown'

<ReactMarkdown>{message.content}</ReactMarkdown>
```

### Thêm code syntax highlighting

```bash
npm install react-syntax-highlighter
```

### Thêm file upload

```tsx
const [file, setFile] = useState<File>()

const handleUpload = async () => {
    const formData = new FormData()
    formData.append('file', file)
    // Upload và nhúng vào knowledge base
}
```

### Thêm voice input

```tsx
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    setInput(transcript)
}
```

---

## 📝 Example Queries để test

```
✅ Tìm đề tài về AI
✅ Tìm đề tài về blockchain
✅ Đề tài sử dụng React Native
✅ Đề tài phù hợp với sinh viên thích lập trình web
✅ Quy trình đăng ký đề tài như thế nào?
✅ Tiêu chí đánh giá khóa luận
✅ Giảng viên nào chuyên về AI?
✅ Tìm đề tài về AI và tài liệu tham khảo
✅ Em muốn làm đề tài về mobile app, có đề tài nào không?
✅ Deadline nộp báo cáo là khi nào?
```

---

Happy Testing! 🎉
