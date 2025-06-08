"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Bot,
  User,
  CheckCircle,
  DollarSign,
  Calendar,
  Tag,
  Users,
} from "lucide-react";

interface TransactionData {
  status: string;
  message: string;
  transaction?: {
    type: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    person?: string;
  };
}

function parseAIResponse(content: string): TransactionData | null {
  try {
    // Thử parse JSON trực tiếp
    return JSON.parse(content);
  } catch {
    // Nếu không phải JSON, thử tìm JSON trong text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function TransactionCard({ data }: { data: TransactionData }) {
  const { transaction } = data;
  if (!transaction) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "expense":
        return "💸";
      case "income":
        return "💰";
      case "loan_give":
        return "🤝";
      case "loan_receive":
        return "💳";
      case "investment":
        return "📈";
      case "saving":
        return "🏦";
      case "bill":
        return "📄";
      default:
        return "💼";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "expense":
        return "text-red-600 bg-red-50";
      case "income":
        return "text-green-600 bg-green-50";
      case "loan_give":
        return "text-blue-600 bg-blue-50";
      case "loan_receive":
        return "text-purple-600 bg-purple-50";
      case "investment":
        return "text-orange-600 bg-orange-50";
      case "saving":
        return "text-teal-600 bg-teal-50";
      case "bill":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3 shadow-sm">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="text-green-700 font-medium">
          Giao dịch đã được ghi nhận
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getTypeIcon(transaction.type)}</span>
          <div>
            <p className="text-gray-500">Loại</p>
            <p
              className={`font-medium px-2 py-1 rounded text-xs ${getTypeColor(
                transaction.type
              )}`}
            >
              {transaction.category}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-500">Số tiền</p>
            <p className="font-bold text-lg text-black">
              {transaction.amount.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-500">Mô tả</p>
            <p className="font-medium  text-black">{transaction.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-gray-500">Ngày</p>
            <p className="font-medium text-black">{transaction.date}</p>
          </div>
        </div>

        {transaction.person && (
          <div className="flex items-center gap-2 col-span-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Người liên quan</p>
              <p className="font-medium text-black">{transaction.person}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-background">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-pink-500" />
            <h3 className="text-lg font-semibold mb-2">Chào bạn! 👋</h3>
            <p className="text-sm mb-4">
              Tôi là Moni, trợ lý tài chính thông minh. Tôi có thể giúp bạn ghi
              nhận:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs max-w-md mx-auto">
              <div className="bg-blue-50 p-2 rounded">💸 Chi tiêu</div>
              <div className="bg-green-50 p-2 rounded">💰 Thu nhập</div>
              <div className="bg-purple-50 p-2 rounded">🤝 Cho vay</div>
              <div className="bg-orange-50 p-2 rounded">📈 Đầu tư</div>
            </div>
            <div className="mt-4 text-xs space-y-1">
              <p>Ví dụ: cafe 25k, Minh vay tôi 500k, lương tháng 10tr</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div
              className={`max-w-[80%] ${
                message.role === "user" ? "ml-auto" : ""
              }`}
            >
              {message.role === "user" ? (
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg px-4 py-2">
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const parsedData = parseAIResponse(message.content);
                    if (parsedData && parsedData.transaction) {
                      return <TransactionCard data={parsedData} />;
                    } else {
                      return (
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Nhập giao dịch... (VD: cafe 25k, Minh vay tôi 500k)"
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
