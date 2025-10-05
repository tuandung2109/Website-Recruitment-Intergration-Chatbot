import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import quickReplies from "../controller/chatbot";

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState("agent"); // "agent" or "ask"
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý tuyển dụng AI của bạn. Tôi có thể giúp bạn tìm việc, tư vấn nghề nghiệp và hỗ trợ về CV. Bạn cần hỗ trợ gì hôm nay?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // AI Backend API URL - ensure it matches the Flask server
  const AI_API_BASE_URL =
    process.env.REACT_APP_AI_API_URL || "http://localhost:5000";

  // Add CORS headers for development
  const API_HEADERS = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const quickReplies = [
    { id: 1, text: "Tìm việc làm", icon: "🔍", router: "job" },
    { id: 2, text: "backend", icon: "📄", router: "company" },
    { id: 3, text: "Tư vấn nghề nghiệp", icon: "💡", router: "cv" },
    { id: 4, text: "Hỗ trợ phỏng vấn", icon: "💬", router: "support" },
  ];

  // Check AI service health on component mount
  useEffect(() => {
    checkAIServiceHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAIServiceHealth = async () => {
    try {
      console.log(
        "🔍 Checking AI service health at:",
        `${AI_API_BASE_URL}/health`
      );

      const response = await fetch(`${AI_API_BASE_URL}/health`, {
        method: "GET",
        headers: API_HEADERS,
        mode: "cors", // Explicitly set CORS mode
        cache: "no-cache",
      });

      if (response.ok) {
        const data = await response.json();
        setIsConnected(true);
        console.log("✅ AI Service connected successfully:", data);
      } else {
        setIsConnected(false);
        console.warn(
          "⚠️ AI Service health check failed with status:",
          response.status
        );
      }
    } catch (error) {
      setIsConnected(false);
      console.error("❌ Failed to connect to AI Service:", error.message);
      console.error("❌ Error details:", error);
    }
  };

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get AI bot response from backend with retry logic
  const getAIResponse = async (userMessage, retryCount = 0) => {
    const maxRetries = 2;

    try {
      console.log(
        "🚀 Sending message to AI backend:",
        `${AI_API_BASE_URL}/api/chat`
      );

      const response = await fetch(`${AI_API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: API_HEADERS,
        mode: "cors", // Explicitly set CORS mode
        credentials: "include", // Include session cookies
        body: JSON.stringify({
          message: userMessage,
          mode: chatMode, // Gửi mode hiện tại đến backend
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        // Update connection status on successful response
        if (!isConnected) {
          setIsConnected(true);
        }
        return data.response;
      } else if (data.status === "service_unavailable") {
        throw new Error("AI service unavailable");
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error(`AI API Error (attempt ${retryCount + 1}):`, error.message);
      console.error("Full error details:", error);
      console.error("API URL attempted:", `${AI_API_BASE_URL}/api/chat`);

      // Retry logic for temporary failures
      if (
        retryCount < maxRetries &&
        (error.message.includes("fetch") ||
          error.message.includes("network") ||
          error.message.includes("timeout"))
      ) {
        console.log(`Retrying AI request... (${retryCount + 1}/${maxRetries})`);
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        ); // Exponential backoff
        return getAIResponse(userMessage, retryCount + 1);
      }

      // Update connection status on persistent failure
      setIsConnected(false);

      // Re-throw error to be handled by caller
      throw error;
    }
  };

  // Simplified fallback for critical errors only
  const getEmergencyFallback = () => {
    return "Xin lỗi, hệ thống AI hiện tại đang gặp sự cố. Vui lòng thử lại sau ít phút hoặc liên hệ bộ phận hỗ trợ để được trợ giúp trực tiếp.";
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessageText = inputValue.trim();

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Always try AI response first
      const aiResponse = await getAIResponse(userMessageText);

      const botResponse = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Only use emergency fallback when AI completely fails
      const errorResponse = {
        id: Date.now() + 1,
        text: getEmergencyFallback(),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorResponse]);

      // Try to reconnect after failure
      setTimeout(() => {
        checkAIServiceHealth();
      }, 2000);
    } finally {
      setIsTyping(false);
    }
  };

  // const handleQuickReply = async (text) => {
  //   // Add user message immediately
  //   const userMessage = {
  //     id: Date.now(),
  //     text: text,
  //     sender: "user",
  //     timestamp: new Date(),
  //   };

  //   setMessages((prev) => [...prev, userMessage]);
  //   setIsTyping(true);

  //   try {
  //     // Always try AI response first
  //     const aiResponse = await getAIResponse(text);

  //     setTimeout(() => {
  //       const botResponse = {
  //         id: Date.now() + 1,
  //         text: aiResponse,
  //         sender: "bot",
  //         timestamp: new Date(),
  //       };
  //       setMessages((prev) => [...prev, botResponse]);
  //       setIsTyping(false);
  //     }, 500); // Small delay for better UX
  //   } catch (error) {
  //     console.error("Error getting AI response:", error);

  //     setTimeout(() => {
  //       const errorResponse = {
  //         id: Date.now() + 1,
  //         text: getEmergencyFallback(),
  //         sender: "bot",
  //         timestamp: new Date(),
  //       };
  //       setMessages((prev) => [...prev, errorResponse]);
  //       setIsTyping(false);

  //       // Try to reconnect after failure
  //       checkAIServiceHealth();
  //     }, 500);
  //   }
  // };

  const handleQuickReply = async (text, router) => {
    // Nếu ở Agent Mode và có router thì điều hướng sang trang đó
    if (chatMode === "agent" && router) {
      navigate(`/${router}`);
      setIsOpen(false); // ẩn chatbot khi chuyển trang
      return;
    }

    // Ở Ask Mode hoặc không có router thì gửi tin nhắn
    const userMessage = {
      id: Date.now(),
      text: chatMode === "ask" && router ? `Hỏi về: ${text}` : text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const aiResponse = await getAIResponse(userMessage.text);

      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          text: aiResponse,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setTimeout(() => {
        const errorResponse = {
          id: Date.now() + 1,
          text: getEmergencyFallback(),
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorResponse]);
        setIsTyping(false);
        checkAIServiceHealth();
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col overflow-hidden border border-gray-200 animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Trợ lý AI Tuyển dụng</h3>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-400" : "bg-red-400"
                    }`}
                  ></div>
                  <p className="text-xs text-blue-100">
                    {isConnected
                      ? "AI đã sẵn sàng • Phản hồi thông minh"
                      : "Chế độ cơ bản • AI không khả dụng"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-2 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mode Selector - Giống GitHub Copilot */}
          <div className="bg-white border-b border-gray-200 px-4 py-2">
            <div className="relative">
              <button
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                <div className="flex items-center space-x-2">
                  {chatMode === "agent" ? (
                    <>
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span className="font-medium text-gray-700">
                        Agent Mode
                      </span>
                      <span className="text-xs text-gray-500">
                        • Tự động xử lý
                      </span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium text-gray-700">
                        Ask Mode
                      </span>
                      <span className="text-xs text-gray-500">
                        • Chỉ trả lời
                      </span>
                    </>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    showModeDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showModeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      setChatMode("agent");
                      setShowModeDropdown(false);
                    }}
                    className={`w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors ${
                      chatMode === "agent" ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-purple-600 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-800">
                          Agent Mode
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Bot tự động thực hiện hành động, tìm kiếm việc làm và
                          điều hướng
                        </div>
                      </div>
                      {chatMode === "agent" && (
                        <svg
                          className="w-5 h-5 text-blue-600 ml-auto"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setChatMode("ask");
                      setShowModeDropdown(false);
                    }}
                    className={`w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100 ${
                      chatMode === "ask" ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <svg
                        className="w-5 h-5 text-blue-600 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-800">
                          Ask Mode
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Chỉ trả lời câu hỏi, tư vấn và hướng dẫn không thực
                          hiện hành động
                        </div>
                      </div>
                      {chatMode === "ask" && (
                        <svg
                          className="w-5 h-5 text-blue-600 ml-auto"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-blue-100"
                        : "text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2 bg-white border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply.id}
                  onClick={() => handleQuickReply(reply.text, reply.router)}
                  className="text-xs bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-full transition-all duration-300 border border-transparent hover:border-blue-200"
                >
                  <span className="mr-1">{reply.icon}</span>
                  {reply.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    chatMode === "agent"
                      ? "Hỏi hoặc yêu cầu thực hiện..."
                      : "Đặt câu hỏi..."
                  }
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {/* Mode Indicator Badge */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {chatMode === "agent" ? (
                    <div
                      className="flex items-center space-x-1 text-purple-600"
                      title="Agent Mode"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className="flex items-center space-x-1 text-blue-600"
                      title="Ask Mode"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors duration-300 transform hover:scale-105"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 group relative"
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <>
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
          </>
        )}
      </button>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
