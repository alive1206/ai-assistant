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
  Mic,
  MicOff,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

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

// Type definitions for SpeechRecognition
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

function parseAIResponse(content: string): TransactionData | null {
  try {
    // Remove any leading/trailing whitespace
    const cleanContent = content.trim();

    // First try: parse as direct JSON
    try {
      return JSON.parse(cleanContent);
    } catch {
      // Second try: extract JSON from markdown code blocks
      const markdownJsonMatch = cleanContent.match(
        /```json\s*\n?([\s\S]*?)\n?```/
      );
      if (markdownJsonMatch) {
        return JSON.parse(markdownJsonMatch[1].trim());
      }

      // Third try: extract any JSON object from the text
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return null;
    }
  } catch (error) {
    console.error("Error parsing AI response:", error);
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
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
  } = useChat();

  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecordingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Kiểm tra hỗ trợ Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        console.warn("Speech Recognition not supported");
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "vi-VN";

      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started");
        setIsRecording(true);
        isRecordingRef.current = true;
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log("Transcript received:", transcript);

        setInput(transcript);
        setIsTranscribing(true);

        // Tự động submit sau khi có kết quả
        setTimeout(() => {
          const form = document.querySelector("form");
          if (form) {
            const submitEvent = new Event("submit", {
              bubbles: true,
              cancelable: true,
            });
            form.dispatchEvent(submitEvent);
          }
          setIsTranscribing(false);
        }, 300);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
        setIsTranscribing(false);
        isRecordingRef.current = false;

        // Clear any pending timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        if (event.error === "not-allowed") {
          alert(
            "Vui lòng cho phép quyền truy cập microphone để sử dụng tính năng này."
          );
        } else if (event.error === "no-speech") {
          // Không hiển thị alert cho trường hợp không có giọng nói
          console.log("No speech detected");
        } else if (event.error === "aborted") {
          // Bình thường khi người dùng dừng recording
          console.log("Speech recognition aborted");
        } else {
          console.log("Speech recognition error:", event.error);
        }
      };

      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        setIsRecording(false);
        isRecordingRef.current = false;

        // Clear any pending timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current && isRecordingRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log("Error stopping recognition on cleanup:", error);
        }
      }
    };
  }, [setInput]);

  const startRecording = useCallback(() => {
    if (!isSupported || !recognitionRef.current || isRecordingRef.current) {
      return;
    }

    try {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      recognitionRef.current.start();
      console.log("Starting speech recognition...");

      // Set a timeout to auto-stop after 30 seconds max
      timeoutRef.current = setTimeout(() => {
        if (isRecordingRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (error) {
            console.log("Error stopping recognition after timeout:", error);
          }
        }
      }, 30000);
    } catch (error) {
      console.error("Error starting recognition:", error);
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecordingRef.current) {
      try {
        recognitionRef.current.stop();
        console.log("Stopping speech recognition...");
      } catch (error) {
        console.log("Error stopping recognition:", error);
        // Force reset state if stop fails
        setIsRecording(false);
        isRecordingRef.current = false;
      }
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Toggle recording on click
  const handleVoiceClick = useCallback(() => {
    if (!isLoading && isSupported && !isTranscribing) {
      if (isRecording || isRecordingRef.current) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  }, [
    isLoading,
    isSupported,
    isTranscribing,
    isRecording,
    startRecording,
    stopRecording,
  ]);

  const handleVoiceStart = useCallback(() => {
    if (!isLoading && isSupported && !isTranscribing && !isRecording) {
      startRecording();
    }
  }, [isLoading, isSupported, isTranscribing, isRecording, startRecording]);

  const handleVoiceEnd = useCallback(() => {
    if (isRecording || isRecordingRef.current) {
      stopRecording();
    }
  }, [isRecording, stopRecording]);

  // Xử lý sự kiện để tránh context menu trên mobile
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

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
              {isSupported && (
                <p className="text-pink-500">💡 Click nút mic để nói</p>
              )}
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
            disabled={isLoading || isRecording || isTranscribing}
          />

          {/* Voice Button */}
          {isSupported && (
            <Button
              type="button"
              // onClick={handleVoiceClick}
              onMouseDown={handleVoiceStart}
              onMouseUp={handleVoiceEnd}
              onTouchStart={handleVoiceStart}
              onTouchEnd={handleVoiceEnd}
              onContextMenu={handleContextMenu}
              disabled={isLoading || isTranscribing}
              className={`select-none ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse scale-110"
                  : isTranscribing
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } transition-all duration-200`}
            >
              {isRecording ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : isTranscribing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Mic className="w-4 h-4 text-white" />
              )}
            </Button>
          )}

          {/* Send Button */}
          <Button
            type="submit"
            disabled={
              isLoading || !input.trim() || isRecording || isTranscribing
            }
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {isRecording && (
          <p className="text-xs text-center text-red-500 mt-2 animate-pulse font-medium">
            🎤 Đang nghe... Click lại để dừng
          </p>
        )}

        {isTranscribing && (
          <p className="text-xs text-center text-yellow-600 mt-2 animate-pulse font-medium">
            ⏳ Đang xử lý giọng nói...
          </p>
        )}

        {!isSupported && (
          <p className="text-xs text-center text-gray-500 mt-2">
            Trình duyệt không hỗ trợ nhận dạng giọng nói
          </p>
        )}
      </div>
    </div>
  );
}
