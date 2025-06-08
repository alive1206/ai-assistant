# AI Assistant

Trợ lý tài chính thông minh, được xây dựng với Next.js, Vercel AI SDK và Google Gemini.

## Tính năng

- 💬 Chat với AI để ghi nhận chi tiêu
- 🏷️ Tự động phân loại danh mục chi tiêu
- 💰 Hỗ trợ nhiều định dạng số tiền (25k, 50000, etc.)
- 🎨 UI đẹp mắt với shadcn/ui components
- 📱 Responsive design

## Cài đặt

1. Clone repository:

```bash
git clone <repository-url>
cd ai-assistant
```

2. Cài đặt dependencies:

```bash
npm install
# hoặc
pnpm install
```

3. Tạo file `.env.local` và thêm API key của Google Gemini:

```bash
cp .env.example .env.local
```

Sau đó chỉnh sửa `.env.local` và thêm API key của bạn:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
```

4. Lấy API key từ [Google AI Studio](https://aistudio.google.com/app/apikey)

5. Chạy ứng dụng:

```bash
npm run dev
# hoặc
pnpm dev
```

6. Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt

## Cách sử dụng

Nhập các chi tiêu của bạn theo định dạng tự nhiên:

- `cafe 25k` → ✅ Đã ghi nhận: cafe hết 25.000đ vào danh mục Ăn uống ngày [ngày hiện tại]
- `ăn trưa 50000` → ✅ Đã ghi nhận: ăn trưa hết 50.000đ vào danh mục Ăn uống ngày [ngày hiện tại]
- `xăng xe 200k` → ✅ Đã ghi nhận: xăng xe hết 200.000đ vào danh mục Di chuyển ngày [ngày hiện tại]

## Công nghệ sử dụng

- **Next.js 15** - React framework
- **Vercel AI SDK** - AI integration
- **Google Gemini** - AI model
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety

## Danh mục tự động

AI sẽ tự động phân loại chi tiêu vào các danh mục:

- 🍽️ Ăn uống (cafe, trà sữa, cơm, phở, etc.)
- 🚗 Di chuyển (xăng, grab, taxi, etc.)
- 🛍️ Mua sắm (quần áo, đồ dùng, etc.)
- 🎮 Giải trí (phim, game, etc.)
- 🏥 Sức khỏe (thuốc, khám bệnh, etc.)
- 📚 Học tập (sách, khóa học, etc.)
- 📦 Khác

## Deploy

Ứng dụng có thể được deploy dễ dàng trên Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ai-assistant)

Nhớ thêm biến môi trường `GOOGLE_GENERATIVE_AI_API_KEY` trong Vercel dashboard.
