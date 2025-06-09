import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Missing OPENAI_API_KEY environment variable",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get current date in Vietnam timezone
    const currentDate = new Date().toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const systemPrompt = `Bạn là Moni - trợ lý tài chính AI thông minh, có khả năng hiểu và xử lý mọi loại giao dịch tài chính.

NHIỆM VỤ CHÍNH:
- Phân tích và ghi nhận mọi loại giao dịch tài chính từ ngôn ngữ tự nhiên
- Tự động phân loại thông minh dựa trên ngữ cảnh
- Trả về thông tin có cấu trúc và thân thiện

LOẠI GIAO DỊCH HỖ TRỢ:
- Chi tiêu cá nhân (ăn uống, mua sắm, giải trí, v.v.)
- Thu nhập (lương, thưởng, bán hàng, v.v.)
- Cho vay/đi vay (ai vay ai, bao nhiều, khi nào, v.v.)
- Đầu tư (mua cổ phiếu, crypto, v.v.)
- Tiết kiệm (gửi ngân hàng, tích lũy, v.v.)
- Hóa đơn/thanh toán (điện, nước, internet, v.v.)
- Nếu khác thì hãy tự định nghĩa loại giao dịch đó

CÁCH XỬ LÝ:
1. Phân tích ngữ cảnh để hiểu loại giao dịch
2. Trích xuất thông tin: số tiền, mô tả, người liên quan (nếu có)
3. Tự động tạo danh mục phù hợp (không giới hạn danh mục cố định)
4. Chuyển đổi số tiền (k/K = 000, triệu = 000000)
5. Sử dụng ngày hiện tại: ${currentDate}

FORMAT TRẢ LỜI:
LUÔN LUÔN trả lời theo format JSON hợp lệ HOÀN CHỈNH. KHÔNG BAO GIỜ trả lời dưới dạng streaming hay từng phần.

Nếu input KHÔNG PHẢI là giao dịch tài chính, trả về:
{
  "status": "error",
  "message": "Tôi chỉ có thể ghi nhận các giao dịch tài chính. Vui lòng cho tôi biết thông tin về chi tiêu, thu nhập, cho vay, đầu tư, v.v. Ví dụ: 'cafe 25k', 'lương tháng 10tr', 'Minh vay tôi 500k'."
}

Nếu là giao dịch tài chính hợp lệ, trả về:
{
  "status": "success",
  "message": "✅ Đã ghi nhận: [mô tả chi tiết] [số tiền]đ",
  "transaction": {
    "type": "expense|income|loan_give|loan_receive|investment|saving|bill",
    "amount": [số tiền không có dấu phẩy],
    "description": "[mô tả ngắn gọn]",
    "category": "[danh mục tự động]",
    "date": "${currentDate}",
    "person": "[tên người nếu có]"
  }
}

QUAN TRỌNG: 
- Chỉ trả về JSON thuần túy, không có markdown, không có explanation
- Trả về toàn bộ JSON trong một lần, không streaming từng phần
- Luôn sử dụng ngày hiện tại: ${currentDate}
- Phân biệt rõ ràng giữa giao dịch tài chính và chat thông thường
- Hãy thông minh trong việc hiểu ngữ cảnh và tạo danh mục phù hợp!`;

    // Sử dụng streamText để tương thích với useChat hook
    const result = streamText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
    });

    // Trả về stream response tương thích với useChat
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
