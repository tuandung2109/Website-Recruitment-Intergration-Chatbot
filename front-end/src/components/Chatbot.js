import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleIntent, parseAIResponse } from "../controller/agentController";

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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Khóa scroll nền khi fullscreen
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullScreen]);

  // AI Backend API URL - ensure it matches the Flask server
  const AI_API_BASE_URL =
    process.env.REACT_APP_AI_API_URL || "http://localhost:5000";

  // Add CORS headers for development
  const API_HEADERS = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const quickReplies = [
    {
      id: 1,
      text: "Tìm việc làm",
      icon: "🔍",
      router: "job",
      action: "navigate", // Chỉ chuyển hướng, không filter
    },
    {
      id: 2,
      text: "backend",
      icon: "🖥️",
      router: "job",
      action: "filter", // Áp dụng filter
      filters: { title: "backend" }, // Filter theo backend
    },
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
      const response = await fetch(`${AI_API_BASE_URL}/health`, {
        method: "GET",
        headers: API_HEADERS,
        mode: "cors",
        cache: "no-cache",
      });

      if (response.ok) {
        await response.json();
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
      console.error("AI Service connect error:", error);
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
  const getAIResponse = async (userMessage, retryCount = 0, fileData = null) => {
    const maxRetries = 2;

    try {
      let response;
      
      // If file is attached, use FormData
      if (fileData) {
        const formData = new FormData();
        formData.append("message", userMessage);
        formData.append("mode", chatMode);
        formData.append("file", fileData);

        response = await fetch(`${AI_API_BASE_URL}/api/chat`, {
          method: "POST",
          mode: "cors",
          credentials: "include",
          body: formData,
        });
      } else {
        // Regular JSON request without file
        response = await fetch(`${AI_API_BASE_URL}/api/chat`, {
          method: "POST",
          headers: API_HEADERS,
          mode: "cors",
          credentials: "include",
          body: JSON.stringify({
            message: userMessage,
            mode: chatMode,
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        if (!isConnected) setIsConnected(true);
        return data.response;
      } else if (data.status === "service_unavailable") {
        throw new Error("AI service unavailable");
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      if (
        retryCount < maxRetries &&
        (error.message.includes("fetch") ||
          error.message.includes("network") ||
          error.message.includes("timeout"))
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        );
        return getAIResponse(userMessage, retryCount + 1, fileData);
      }
      setIsConnected(false);
      throw error;
    }
  };

  const getEmergencyFallback = () => {
    return "Xin lỗi, hệ thống AI hiện tại đang gặp sự cố. Vui lòng thử lại sau ít phút hoặc liên hệ bộ phận hỗ trợ để được trợ giúp trực tiếp.";
  };

  // Clean markdown formatting from AI response
  const cleanMarkdownText = (text) => {
    if (typeof text !== "string") return text;
    
    return text
      // Remove bold markdown (**text**)
      .replace(/\*\*(.+?)\*\*/g, "$1")
      // Remove remaining asterisks
      .replace(/\*/g, "")
      // Remove heading markdown (# text)
      .replace(/^#+\s+/gm, "")
      // Clean up extra spaces
      .trim();
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" && !uploadedFile) return;

    const userMessageText = inputValue.trim() || "Xin hãy phân tích CV của tôi";

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
      // Send message with file if available
      const aiResponse = await getAIResponse(userMessageText, 0, uploadedFile);

      let botMessageText = aiResponse;
      let agentData = null;

      if (
        typeof aiResponse === "object" &&
        aiResponse !== null &&
        !Array.isArray(aiResponse)
      ) {
        agentData = aiResponse;
        const intent = agentData.intent;
        const extracted_features = agentData.extracted_features;

        try {
          const featuresObj =
            typeof extracted_features === "string"
              ? JSON.parse(extracted_features)
              : extracted_features || {};
          botMessageText = `Tôi hiểu bạn đang tìm công việc với các yêu cầu sau:\n`;
          if (featuresObj.title)
            botMessageText += `• Vị trí: ${featuresObj.title}\n`;
          if (featuresObj.location)
            botMessageText += `• Địa điểm: ${featuresObj.location}\n`;
          if (featuresObj.salary)
            botMessageText += `• Mức lương: ${featuresObj.salary}\n`;
          botMessageText += `\nĐang chuyển đến trang tìm kiếm...`;
        } catch {
          botMessageText =
            "Đã hiểu yêu cầu của bạn. Đang tìm kiếm công việc phù hợp...";
        }
      }

      // Clean markdown formatting from bot message
      const cleanedText = cleanMarkdownText(botMessageText);

      const botResponse = {
        id: Date.now() + 1,
        text: cleanedText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);

      // Clear uploaded file after successful send
      if (uploadedFile) {
        setUploadedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }

      if (chatMode === "agent" && agentData) {
        const intent = agentData.intent;
        let filters = {};
        try {
          if (agentData.extracted_features) {
            filters =
              typeof agentData.extracted_features === "string"
                ? JSON.parse(agentData.extracted_features)
                : agentData.extracted_features;
          }
        } catch {
          /* ignore */
        }
        if (intent) {
          setTimeout(() => {
            handleIntent(intent, navigate, filters);
          }, 1000);
        }
      } else if (chatMode === "agent" && typeof aiResponse === "string") {
        const { intent, filters } = parseAIResponse(aiResponse);
        if (intent) {
          setTimeout(() => {
            handleIntent(intent, navigate, filters);
          }, 1000);
        }
      }
    } catch (error) {
      const errorResponse = {
        id: Date.now() + 1,
        text: getEmergencyFallback(),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
      setTimeout(() => {
        checkAIServiceHealth();
      }, 2000);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = async (text, router, reply) => {
    if (chatMode === "agent" && router) {
      if (reply?.action === "navigate") {
        navigate(`/${router}`);
        return;
      }
      if (reply?.action === "filter" && reply?.filters) {
        handleIntent("intent_jd", navigate, reply.filters);
        return;
      }
      navigate(`/${router}`);
      return;
    }

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
        // Clean markdown formatting from AI response
        const cleanedResponse = cleanMarkdownText(aiResponse);
        
        const botResponse = {
          id: Date.now() + 1,
          text: cleanedResponse,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
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

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = async () => {
    try {
      const response = await fetch(`${AI_API_BASE_URL}/api/chat/clear`, {
        method: "POST",
        headers: API_HEADERS,
        mode: "cors",
        credentials: "include",
      });

      if (response.ok) {
        // Reset messages to initial state
        setMessages([
          {
            id: 1,
            text: "Xin chào! Tôi là trợ lý tuyển dụng AI của bạn. Tôi có thể giúp bạn tìm việc, tư vấn nghề nghiệp và hỗ trợ về CV. Bạn cần hỗ trợ gì hôm nay?",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        setInputValue("");
        setUploadedFile(null);
      } else {
        console.error("Failed to clear chat history");
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        alert("Chỉ chấp nhận file PDF!");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File không được vượt quá 10MB!");
        return;
      }
      
      setUploadedFile(file);
      
      // Add message showing file attached
      const fileMessage = {
        id: Date.now(),
        text: `📎 Đã đính kèm file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
        sender: "user",
        timestamp: new Date(),
        isFileAttachment: true,
      };
      setMessages((prev) => [...prev, fileMessage]);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Overlay: chỉ tối nền, không nhận click, không đóng chat */}
      {isOpen && isFullScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 pointer-events-none z-[9998]" />
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`${
            isFullScreen
              ? "fixed inset-0 z-[9999] bg-white rounded-none shadow-2xl ring-1 ring-gray-200 pointer-events-auto"
              : "mb-4 w-80 sm:w-96 h-[500px] rounded-2xl bg-white shadow-2xl"
          } flex flex-col overflow-hidden border border-gray-200 animate-slide-up`}
        >
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
                  />
                  <p className="text-xs text-blue-100">
                    {isConnected
                      ? "AI đã sẵn sàng • Phản hồi thông minh"
                      : "Chế độ cơ bản • AI không khả dụng"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Fullscreen */}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="hover:bg-blue-700 p-2 rounded-full transition-colors"
                title={isFullScreen ? "Thu nhỏ" : "Toàn màn hình"}
              >
                {isFullScreen ? (
                  // Icon thu nhỏ
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
                      d="M4 4h7v2H6v5H4V4zm16 0v7h-2V6h-5V4h7zm0 16h-7v-2h5v-5h2v7zM4 20v-7h2v5h5v2H4z"
                    />
                  </svg>
                ) : (
                  // Icon phóng to
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
                      d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
                    />
                  </svg>
                )}
              </button>

              {/* Close */}
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
          </div>

          {/* Mode Selector */}
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
                    <div className="w-2 h-2 rounded-full animate-bounce bg-gray-400"></div>
                    <div
                      className="w-2 h-2 rounded-full animate-bounce bg-gray-400"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full animate-bounce bg-gray-400"
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
                  onClick={() =>
                    handleQuickReply(reply.text, reply.router, reply)
                  }
                  className="text-xs bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-full transition-all duration-300 border border-transparent hover:border-blue-200"
                  title={
                    reply.action === "filter"
                      ? `Filter: ${JSON.stringify(reply.filters)}`
                      : "Navigate"
                  }
                >
                  <span className="mr-1">{reply.icon}</span>
                  {reply.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            {/* File Upload Preview - Only show in agent mode */}
            {chatMode === "agent" && uploadedFile && (
              <div className="mb-3 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8v-2zm0-4h8v2H8v-2zm0-4h5v2H8V7z"/>
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors"
                  title="Xóa file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={
                    chatMode === "agent"
                      ? "Hỏi hoặc yêu cầu thực hiện..."
                      : "Đặt câu hỏi..."
                  }
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {/* Mode Indicator Badge */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {chatMode === "agent" ? (
                    <div
                      className="flex items-center space-x-1 text-purple-600"
                      title="Agent Mode"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className="flex items-center space-x-1 text-blue-600"
                      title="Ask Mode"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* File Upload Button - Only in agent mode */}
              {chatMode === "agent" && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={handleFileUpload}
                    title="Upload CV (PDF)"
                    className="bg-purple-100 hover:bg-purple-200 text-purple-600 hover:text-purple-800 p-2 rounded-full transition-colors duration-300 transform hover:scale-105"
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
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* Clear Button */}
              <button
                onClick={handleClearChat}
                title="Xóa lịch sử chat"
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 p-2 rounded-full transition-colors duration-300 transform hover:scale-105"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              {/* Send Button */}
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
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
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
