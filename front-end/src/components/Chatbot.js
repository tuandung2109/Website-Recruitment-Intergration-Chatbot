import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleIntent, parseAIResponse } from "../controller/agentController";

const Chatbot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Utility function to get user ID
  const getUserId = () => {
    const userData = localStorage.getItem("account");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.account_id || user.id || null;
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }
    return null;
  };

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
  const [showCVActionDropdown, setShowCVActionDropdown] = useState(false);
  const [selectedCVAction, setSelectedCVAction] = useState("evaluate"); // "evaluate" or "recommend"
  const [hasShownJDSuggestion, setHasShownJDSuggestion] = useState(false);
  
  // Context length tracking (128K tokens max)
  const MAX_CONTEXT_TOKENS = 12800;
  const [contextTokens, setContextTokens] = useState(0);

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
  ];

  // Check AI service health on component mount
  useEffect(() => {
    checkAIServiceHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect when user is on JobDetail or JobDetailAIReview page and show suggestion
  useEffect(() => {
    const isJobDetailPage = /^\/job\/\d+$/.test(location.pathname); // Match /job/:id
    const isAIReviewPage = location.pathname.includes('/job/') && location.pathname.includes('/ai-review');
    
    // Show suggestion on JobDetail page
    if (isJobDetailPage && !hasShownJDSuggestion) {
      setHasShownJDSuggestion(true);
      setIsOpen(true); // Auto-open chatbot
      
      // Add suggestion message after a short delay
      setTimeout(() => {
        const suggestionMessage = {
          id: Date.now(),
          text: "👋 Xin chào! Tôi thấy bạn đang xem chi tiết công việc. Bạn có muốn tôi phân tích và đánh giá Job Description này bằng AI không?",
          sender: "bot",
          timestamp: new Date(),
          isJDSuggestion: true,
        };
        setMessages((prev) => [...prev, suggestionMessage]);
        
        // Add quick action buttons
        const actionMessage = {
          id: Date.now() + 1,
          text: "Tôi có thể giúp bạn đánh giá chất lượng JD, phát hiện điểm mạnh/yếu và đưa ra gợi ý cải thiện!",
          sender: "bot",
          timestamp: new Date(),
          showJDActions: true,
        };
        
        setTimeout(() => {
          setMessages((prev) => [...prev, actionMessage]);
        }, 800);
      }, 1500);
    }
    
    // Show suggestion on AI Review page
    if (isAIReviewPage && !hasShownJDSuggestion) {
      setHasShownJDSuggestion(true);
      setIsOpen(true); // Auto-open chatbot
      
      // Add suggestion message after a short delay
      setTimeout(() => {
        const suggestionMessage = {
          id: Date.now(),
          text: "🎯 Tôi thấy bạn đang xem trang đánh giá JD. Bạn có muốn tôi phân tích và đưa ra đề xuất cải thiện cho Job Description này không?",
          sender: "bot",
          timestamp: new Date(),
          isJDSuggestion: true,
        };
        setMessages((prev) => [...prev, suggestionMessage]);
        
        // Add quick action buttons
        const actionMessage = {
          id: Date.now() + 1,
          text: "Nhấn 'Phân tích JD' để bắt đầu đánh giá chi tiết!",
          sender: "bot",
          timestamp: new Date(),
          showJDActions: true,
        };
        
        setTimeout(() => {
          setMessages((prev) => [...prev, actionMessage]);
        }, 800);
      }, 1000);
    }
    
    // Reset flag when leaving both pages
    if (!isJobDetailPage && !isAIReviewPage && hasShownJDSuggestion) {
      setHasShownJDSuggestion(false);
    }
  }, [location.pathname, hasShownJDSuggestion]);

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

  // Estimate token count from text (rough estimation: ~1 token per 4 characters for Vietnamese)
  const estimateTokens = (text) => {
    if (!text) return 0;
    // More accurate estimation: Vietnamese averages ~3-4 chars per token
    return Math.ceil(text.length / 3.5);
  };

  // Calculate total context tokens from all messages
  const calculateContextTokens = (messageList) => {
    let totalTokens = 0;
    messageList.forEach((msg) => {
      totalTokens += estimateTokens(msg.text);
    });
    return totalTokens;
  };

  // Update context tokens whenever messages change
  useEffect(() => {
    const tokens = calculateContextTokens(messages);
    setContextTokens(tokens);
  }, [messages]);

  // Reset conversation
  const resetConversation = () => {
    setMessages([
      {
        id: 1,
        text: "Xin chào! Tôi là trợ lý tuyển dụng AI của bạn. Tôi có thể giúp bạn tìm việc, tư vấn nghề nghiệp và hỗ trợ về CV. Bạn cần hỗ trợ gì hôm nay?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setContextTokens(0);
    setUploadedFile(null);
    setInputValue("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      // Add line break after sentences ending with period (except if followed by newline)
      .replace(/\.(\s)(?=[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ0-9🔍📊✅❌🎯👋💼🌟⚡])/g, ".\n\n$1")
      // Clean up extra spaces
      .trim();
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" && !uploadedFile) return;

    // Check if context is too full (>95%)
    if (contextTokens / MAX_CONTEXT_TOKENS > 0.95) {
      const warningMessage = {
        id: Date.now(),
        text: "⚠️ Context đã đầy! Vui lòng nhấn nút 'Reset' để bắt đầu hội thoại mới.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, warningMessage]);
      return;
    }

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
          
          // Kiểm tra nếu intent là evaluate_cv
          if (intent === "evaluate_cv") {
            botMessageText = `✅ Đã phân tích CV của bạn thành công!\n\n`;
            botMessageText += `📊 Điểm tổng quát: ${featuresObj.scores?.overall || 0}/10\n`;
            botMessageText += `\nĐang chuyển đến trang đánh giá chi tiết...`;
          } else {
            botMessageText = `Tôi hiểu bạn đang tìm công việc với các yêu cầu sau:\n`;
            if (featuresObj.title)
              botMessageText += `• Vị trí: ${featuresObj.title}\n`;
            if (featuresObj.location)
              botMessageText += `• Địa điểm: ${featuresObj.location}\n`;
            if (featuresObj.salary)
              botMessageText += `• Mức lương: ${featuresObj.salary}\n`;
            botMessageText += `\nĐang chuyển đến trang tìm kiếm...`;
          }
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
      
      // Set default action to evaluate
      setSelectedCVAction("evaluate");
      setInputValue("Đánh giá CV cho tôi");
      
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

  const handleCVActionChange = (action) => {
    setSelectedCVAction(action);
    setShowCVActionDropdown(false);
    
    if (action === "evaluate") {
      setInputValue("Đánh giá CV cho tôi");
    } else if (action === "recommend") {
      setInputValue("Lựa chọn công việc phù hợp dựa trên CV");
    } else if (action === "interview") {
      setInputValue("Mô phỏng phỏng vấn dựa trên CV");
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    // Clear input value when file is removed
    setInputValue("");
    setShowCVActionDropdown(false);
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

          {/* Context Length Progress Bar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="space-y-2">
              {/* Header with token count and reset button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg
                    className={`w-4 h-4 ${
                      contextTokens / MAX_CONTEXT_TOKENS > 0.8
                        ? "text-red-500"
                        : contextTokens / MAX_CONTEXT_TOKENS > 0.6
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">
                    Context: {(contextTokens / 1000).toFixed(1)}K / {MAX_CONTEXT_TOKENS / 1000}K tokens
                  </span>
                </div>
                
                {/* Reset button - show when > 50% or always visible for convenience */}
                {contextTokens / MAX_CONTEXT_TOKENS > 0.5 && (
                  <button
                    onClick={resetConversation}
                    className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Reset hội thoại để giải phóng bộ nhớ"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    contextTokens / MAX_CONTEXT_TOKENS > 0.9
                      ? "bg-gradient-to-r from-red-500 to-red-600 animate-pulse"
                      : contextTokens / MAX_CONTEXT_TOKENS > 0.8
                      ? "bg-gradient-to-r from-orange-500 to-red-500"
                      : contextTokens / MAX_CONTEXT_TOKENS > 0.6
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                      : "bg-gradient-to-r from-green-400 to-blue-500"
                  }`}
                  style={{ width: `${Math.min((contextTokens / MAX_CONTEXT_TOKENS) * 100, 100)}%` }}
                >
                  {/* Shine effect */}
                  <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                </div>
              </div>

              {/* Warning message when approaching limit */}
              {contextTokens / MAX_CONTEXT_TOKENS > 0.8 && (
                <div className="flex items-start space-x-2 p-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                  <svg
                    className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="text-xs text-orange-800">
                    <span className="font-semibold">Cảnh báo:</span> Context sắp đầy! 
                    {contextTokens / MAX_CONTEXT_TOKENS > 0.9 ? (
                      <span className="font-medium"> Vui lòng reset hội thoại để tiếp tục.</span>
                    ) : (
                      <span> Nên reset để đảm bảo hiệu suất tốt nhất.</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id}>
                <div
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
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
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
                
                {/* Show JD action buttons if this is a JD suggestion message */}
                {message.showJDActions && (
                  <div className="flex justify-start mt-2">
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={async () => {
                          const userMessage = {
                            id: Date.now(),
                            text: "Đang phân tích Job Description...",
                            sender: "user",
                            timestamp: new Date(),
                          };
                          setMessages((prev) => [...prev, userMessage]);
                          setIsTyping(true);
                          
                          try {
                            // Extract job_id from URL path
                            const pathMatch = location.pathname.match(/\/job\/(\d+)/);
                            const jobId = pathMatch ? pathMatch[1] : null;
                            
                            if (!jobId) {
                              throw new Error("Không tìm thấy ID công việc trong URL");
                            }
                            
                            // Call the /api/evaluate/jd endpoint
                            const response = await fetch(`${AI_API_BASE_URL}/api/evaluate/jd`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json",
                              },
                              mode: "cors",
                              credentials: "include",
                              body: JSON.stringify({
                                job_id: parseInt(jobId, 10)
                              }),
                            });
                            
                            if (!response.ok) {
                              throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            
                            const data = await response.json();
                            
                            if (data.status === "success" && data.evaluation) {
                              // Show success message
                              const botResponse = {
                                id: Date.now() + 1,
                                text: "✅ Đánh giá hoàn tất! Đang chuyển đến trang đánh giá chi tiết...",
                                sender: "bot",
                                timestamp: new Date(),
                              };
                              setMessages((prev) => [...prev, botResponse]);
                              setIsTyping(false);
                              
                              // Store evaluation data in sessionStorage
                              sessionStorage.setItem('jd_evaluation', JSON.stringify(data.evaluation));
                              
                              // Navigate to AI Review page after a short delay
                              setTimeout(() => {
                                navigate(`/job/${jobId}/ai-review`);
                              }, 1000);
                            } else {
                              throw new Error(data.error || "Không thể đánh giá JD");
                            }
                          } catch (error) {
                            console.error("JD Evaluation error:", error);
                            const errorResponse = {
                              id: Date.now() + 1,
                              text: `❌ Xin lỗi, không thể đánh giá JD: ${error.message}\n\nVui lòng thử lại sau hoặc kiểm tra kết nối AI.`,
                              sender: "bot",
                              timestamp: new Date(),
                            };
                            setMessages((prev) => [...prev, errorResponse]);
                            setIsTyping(false);
                          }
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all shadow-md flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Phân tích JD
                      </button>
                      <button
                        onClick={() => {
                          const closeMessage = {
                            id: Date.now(),
                            text: "Được rồi, nếu cần hỗ trợ thì hãy gọi tôi nhé!",
                            sender: "bot",
                            timestamp: new Date(),
                          };
                          setMessages((prev) => [...prev, closeMessage]);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                      >
                        Để sau
                      </button>
                    </div>
                  </div>
                )}
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

            {/* CV Action Dropdown - Only show when file is uploaded */}
            {chatMode === "agent" && uploadedFile && (
              <div className="mb-3 relative">
                <button
                  onClick={() => setShowCVActionDropdown(!showCVActionDropdown)}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 rounded-lg transition-all border border-purple-200 hover:border-purple-300"
                >
                  <div className="flex items-center space-x-2">
                    {selectedCVAction === "evaluate" ? (
                      <>
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-gray-700">Đánh giá CV cho tôi</span>
                      </>
                    ) : selectedCVAction === "recommend" ? (
                      <>
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-gray-700">Lựa chọn công việc phù hợp dựa trên CV</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-medium text-gray-700">Mô phỏng phỏng vấn dựa trên CV</span>
                      </>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      showCVActionDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showCVActionDropdown && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                    <button
                      onClick={() => handleCVActionChange("evaluate")}
                      className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors ${
                        selectedCVAction === "evaluate" ? "bg-purple-50 border-l-4 border-purple-500" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">Đánh giá CV cho tôi</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Phân tích và đánh giá chất lượng CV của bạn
                          </div>
                        </div>
                        {selectedCVAction === "evaluate" && (
                          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleCVActionChange("recommend")}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-t border-gray-100 ${
                        selectedCVAction === "recommend" ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">Lựa chọn công việc phù hợp dựa trên CV</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Tìm và gợi ý công việc phù hợp với CV của bạn
                          </div>
                        </div>
                        {selectedCVAction === "recommend" && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => handleCVActionChange("interview")}
                      className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors border-t border-gray-100 ${
                        selectedCVAction === "interview" ? "bg-green-50 border-l-4 border-green-500" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">Mô phỏng phỏng vấn dựa trên CV</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Luyện tập phỏng vấn với AI dựa trên CV của bạn
                          </div>
                        </div>
                        {selectedCVAction === "interview" && (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    // Only allow editing if no file is attached
                    if (!uploadedFile) {
                      setInputValue(e.target.value);
                    }
                  }}
                  onKeyDown={handleInputKeyDown}
                  placeholder={
                    contextTokens / MAX_CONTEXT_TOKENS > 0.95
                      ? "⚠️ Context đầy - Vui lòng reset"
                      : uploadedFile
                      ? "Đánh giá CV cho tôi (đã khóa)"
                      : chatMode === "agent"
                      ? "Hỏi hoặc yêu cầu thực hiện..."
                      : "Đặt câu hỏi..."
                  }
                  disabled={uploadedFile !== null || contextTokens / MAX_CONTEXT_TOKENS > 0.95}
                  className={`w-full px-4 py-2 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    uploadedFile || contextTokens / MAX_CONTEXT_TOKENS > 0.95
                      ? "bg-gray-100 border-gray-300 cursor-not-allowed text-gray-600"
                      : "border-gray-300 bg-white"
                  }`}
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
                disabled={contextTokens / MAX_CONTEXT_TOKENS > 0.95}
                className={`p-2 rounded-full transition-colors duration-300 transform hover:scale-105 ${
                  contextTokens / MAX_CONTEXT_TOKENS > 0.95
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                title={
                  contextTokens / MAX_CONTEXT_TOKENS > 0.95
                    ? "Context đầy - Vui lòng reset"
                    : "Gửi tin nhắn"
                }
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
