// src/pages/JobDetail/JobDetailAIReview.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { listJobPostingById } from "../../services/jobPosting";
import { evaluateJobDescription } from "../../services/aiService";
import "./JobDetailAIReview.css";

const JobDetailAIReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiReview, setAiReview] = useState(null);
  const [activeSection, setActiveSection] = useState("strengths");

  // Fetch job detail
  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        setError("");

        const { success, job_posting } = await listJobPostingById(id);
        
        if (!success || !job_posting) {
          throw new Error("Không tìm thấy công việc");
        }

        const job = job_posting;
        const mapped = {
          id: job.id,
          title: job.title || "Untitled",
          description: job.description || "",
          company: job.company?.name || "Công ty chưa xác định",
          location: job.company?.address || "",
          workTypes: Array.isArray(job.workTypes) ? job.workTypes : [],
          skills: Array.isArray(job.job_posting_skill)
            ? job.job_posting_skill.map((s) => s?.skill?.skill_name).filter(Boolean)
            : [],
          industries: Array.isArray(job.industries) ? job.industries : [],
          salaryRange: job.salary ? `${job.salary}` : "",
          experience: typeof job.experienceYears === "number" ? `${job.experienceYears} năm` : "",
          deadline: job.deadline || "",
          requirements: job.requirements || "",
          benefits: job.benefits || "",
        };

        setJob(mapped);
        
        // Check if there's evaluation data from chatbot in sessionStorage
        const storedEvaluation = sessionStorage.getItem('jd_evaluation');
        if (storedEvaluation) {
          try {
            const evaluation = JSON.parse(storedEvaluation);
            console.log('✅ Loaded evaluation from sessionStorage:', evaluation);
            setAiReview(evaluation);
            // Clear the stored data after using it
            sessionStorage.removeItem('jd_evaluation');
          } catch (parseError) {
            console.error('❌ Error parsing stored evaluation:', parseError);
          }
        }
      } catch (e) {
        console.error("❌ Lỗi khi fetch chi tiết job:", e);
        setError("Không thể tải chi tiết công việc");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  // AI Analysis with Real API Call
  const handleAIAnalyze = async () => {
    setAiAnalyzing(true);
    setError(""); // Clear any previous errors
    
    try {
      console.log(`🤖 Bắt đầu phân tích AI cho Job ID: ${id}`);
      
      // Call the AI service
      const result = await evaluateJobDescription(id);

      if (!result.success) {
        throw new Error(result.error || 'Không thể phân tích job description');
      }

      const data = result.data;

      if (data.status === 'success' && data.evaluation) {
        console.log('✅ Nhận được đánh giá từ AI');
        
        // Parse the AI evaluation result
        const evaluation = data.evaluation;
        
        // Check if evaluation is already an object (from MongoDB) or string (from AI)
        let parsedReview;
        if (typeof evaluation === 'object' && evaluation !== null) {
          // Already an object from MongoDB, use directly
          console.log('✅ Dữ liệu từ MongoDB - sử dụng trực tiếp');
          parsedReview = evaluation;
        } else {
          // String from AI, need to parse
          console.log('✅ Dữ liệu từ AI - cần parse');
          parsedReview = parseAIEvaluation(evaluation);
        }
        
        setAiReview(parsedReview);
        console.log('✅ Đã cập nhật kết quả đánh giá');
      } else {
        throw new Error('Phản hồi từ AI không hợp lệ');
      }
    } catch (error) {
      console.error('❌ Lỗi khi phân tích AI:', error);
      setError(`Không thể phân tích job description: ${error.message}`);
      
      // Fallback to mock data for demonstration
      console.log('⚠️ Sử dụng dữ liệu mẫu do lỗi API');
      const mockAiReview = {
        overallScore: 78,
        scores: {
          clarity: 85,
          completeness: 75,
          attractiveness: 70,
          seo: 80,
          inclusivity: 75
        },
        strengths: [
          {
            category: "Mô tả công việc",
            point: "Mô tả công việc rõ ràng, chi tiết về trách nhiệm và nhiệm vụ",
            icon: "✓"
          },
          {
            category: "Thông tin lương",
            point: "Đã công khai mức lương, tăng tính minh bạch và thu hút ứng viên",
            icon: "✓"
          },
          {
            category: "Kỹ năng yêu cầu",
            point: "Liệt kê đầy đủ các kỹ năng cần thiết, giúp ứng viên tự đánh giá",
            icon: "✓"
          }
        ],
        improvements: [
          {
            category: "Tiêu đề",
            issue: "Tiêu đề có thể hấp dẫn hơn",
            suggestion: "Thêm cụm từ thu hút như 'Senior', 'Remote-friendly', hoặc đặc điểm nổi bật của vị trí",
            priority: "medium",
            example: `"${job?.title}" → "Senior ${job?.title} - Remote Flexible"`
          },
          {
            category: "Mô tả công ty",
            issue: "Thiếu thông tin về văn hóa công ty và môi trường làm việc",
            suggestion: "Bổ sung 2-3 câu về văn hóa công ty, giá trị cốt lõi, hoặc những điểm đặc biệt",
            priority: "high",
            example: "Thêm: 'Chúng tôi tạo môi trường sáng tạo, khuyến khích đổi mới và học hỏi liên tục'"
          },
          {
            category: "Quyền lợi",
            issue: "Quyền lợi được mô tả chung chung",
            suggestion: "Cụ thể hóa các quyền lợi với con số và chi tiết",
            priority: "high",
            example: "Thay vì 'Thưởng hấp dẫn' → 'Thưởng lên đến 2-3 tháng lương/năm theo KPI'"
          },
          {
            category: "Từ khóa SEO",
            issue: "Thiếu từ khóa phổ biến trong ngành",
            suggestion: "Thêm các từ khóa như 'work-life balance', 'career growth', 'modern tech stack'",
            priority: "medium",
            example: "Bổ sung vào phần benefits hoặc description"
          },
          {
            category: "Call-to-Action",
            issue: "Không có lời kêu gọi hành động mạnh mẽ",
            suggestion: "Thêm câu kết thúc động viên ứng viên nộp hồ sơ",
            priority: "low",
            example: "Thêm: 'Đừng bỏ lỡ cơ hội gia nhập đội ngũ tài năng của chúng tôi. Ứng tuyển ngay hôm nay!'"
          }
        ],
        keywordAnalysis: {
          missing: ["remote", "flexible", "growth opportunity", "modern"],
          overused: ["công việc", "yêu cầu"],
          recommended: ["career development", "team culture", "innovation"]
        },
        competitorComparison: {
          betterThan: 65,
          avgSalary: "Cao hơn 15% so với thị trường",
          responseRate: "Dự đoán: 8-12 ứng viên phù hợp trong 7 ngày đầu"
        }
      };
      setAiReview(mockAiReview);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Helper function to parse AI evaluation text into structured format
  const parseAIEvaluation = (evaluationText) => {
    try {
      // Check if evaluationText is already an object
      if (typeof evaluationText === 'object' && evaluationText !== null) {
        return evaluationText;
      }
      
      // Ensure evaluationText is a string
      if (typeof evaluationText !== 'string') {
        console.error('⚠️ evaluationText is not a string:', typeof evaluationText);
        throw new Error('Invalid evaluation data type');
      }
      
      // Clean the text - remove markdown code blocks if present
      let cleanedText = evaluationText.trim();
      
      // Remove ```json and ``` markers if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Try to parse as JSON
      const parsed = JSON.parse(cleanedText);
      
      // Validate the parsed object has required fields
      if (parsed.overallScore && parsed.scores && parsed.strengths && parsed.improvements) {
        console.log('✅ Successfully parsed AI evaluation as JSON');
        console.log('📊 Overall Score:', parsed.overallScore);
        console.log('✨ Strengths:', parsed.strengths.length);
        console.log('🚀 Improvements:', parsed.improvements.length);
        
        return {
          ...parsed,
          rawEvaluation: evaluationText // Keep raw text for reference
        };
      }
    } catch (e) {
      console.error('⚠️ Failed to parse AI response as JSON:', e.message);
      if (typeof evaluationText === 'string') {
        console.log('Raw text:', evaluationText.substring(0, 200));
      } else {
        console.log('Non-string data:', evaluationText);
      }
    }
    
    // Fallback: If not JSON, try to extract from text
    console.log('⚠️ Using fallback text parsing');
    const textForParsing = typeof evaluationText === 'string' ? evaluationText : 'Dữ liệu không hợp lệ';
    return {
      overallScore: 75,
      rawEvaluation: textForParsing,
      scores: {
        clarity: 80,
        completeness: 75,
        attractiveness: 70,
        seo: 75,
        inclusivity: 75
      },
      strengths: extractStrengths(textForParsing),
      improvements: extractImprovements(textForParsing),
      keywordAnalysis: {
        missing: extractKeywords(textForParsing, "thiếu"),
        overused: extractKeywords(textForParsing, "dùng nhiều"),
        recommended: extractKeywords(textForParsing, "nên thêm")
      },
      competitorComparison: {
        betterThan: 70,
        avgSalary: "Cạnh tranh với thị trường",
        responseRate: "Đang phân tích..."
      }
    };
  };

  // Helper functions to extract information from AI text
  const extractStrengths = (text) => {
    // Simple extraction - you may want to use regex or more sophisticated parsing
    const strengths = [];
    if (text.includes("rõ ràng") || text.includes("chi tiết")) {
      strengths.push({
        category: "Mô tả công việc",
        point: "Mô tả công việc được đánh giá tích cực bởi AI",
        icon: "✓"
      });
    }
    return strengths.length > 0 ? strengths : [
      {
        category: "Đánh giá AI",
        point: "AI đã phân tích và đưa ra nhận xét về job description",
        icon: "✓"
      }
    ];
  };

  const extractImprovements = (text) => {
    // Extract improvement suggestions from AI text
    const improvements = [];
    
    // You can add more sophisticated parsing logic here
    if (text.includes("cải thiện") || text.includes("nên")) {
      improvements.push({
        category: "Gợi ý từ AI",
        issue: "AI đã phát hiện các điểm cần cải thiện",
        suggestion: text.substring(0, 200) + "...", // Take first 200 chars as example
        priority: "medium",
        example: "Xem phần đánh giá chi tiết từ AI"
      });
    }
    
    return improvements;
  };

  const extractKeywords = (text, type) => {
    // Basic keyword extraction - can be enhanced
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(w => w.length > 4).slice(0, 5);
  };

  const ScoreCircle = ({ score, label, color = "blue" }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="45"
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="56"
              cy="56"
              r="45"
              stroke={`url(#gradient-${color})`}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color === 'blue' ? '#3B82F6' : color === 'green' ? '#10B981' : '#F59E0B'} />
                <stop offset="100%" stopColor={color === 'blue' ? '#1D4ED8' : color === 'green' ? '#059669' : '#D97706'} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{score}</span>
          </div>
        </div>
        <p className="mt-2 text-sm font-medium text-gray-700">{label}</p>
      </div>
    );
  };

  const PriorityBadge = ({ priority }) => {
    const colors = {
      high: "bg-red-100 text-red-700 border-red-300",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
      low: "bg-blue-100 text-blue-700 border-blue-300"
    };
    const labels = {
      high: "Cao",
      medium: "Trung bình",
      low: "Thấp"
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[priority]}`}>
        Ưu tiên: {labels[priority]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-200 flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Đang tải chi tiết công việc...
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
            {error || "Không tìm thấy công việc"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 relative">
      {/* AI Analyzing Overlay */}
      {aiAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 transform animate-pulse">
            <div className="flex flex-col items-center">
              <div className="relative">
                <svg className="animate-spin h-16 w-16 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 7H7v6h6V7z" />
                    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-6 text-2xl font-bold text-gray-900">AI đang phân tích...</h3>
              <p className="mt-2 text-gray-600 text-center">
                Đang đánh giá job description của bạn. Vui lòng đợi trong giây lát.
              </p>
              <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <svg
              className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>

          {/* Error Alert */}
          {error && !aiReview && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl flex items-start">
              <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">Lưu ý</p>
                <p className="text-sm mt-1">{error} - Đang hiển thị dữ liệu mẫu để bạn tham khảo giao diện.</p>
              </div>
            </div>
          )}

          {/* Header title removed - chatbot will suggest AI review */}
        </div>

        {/* Job Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {job.title.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
              <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  {job.company}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {job.location}
                </span>
                <span className="flex items-center text-green-600 font-semibold">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  {job.salaryRange}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.slice(0, 5).map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {aiReview && (
          <div className="space-y-8">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-100">
              <div className="flex gap-2">
                {[
                  { id: "strengths", label: "Điểm mạnh", icon: "✨" },
                  { id: "improvements", label: "Cải thiện", icon: "🚀" },
                  { id: "keywords", label: "Từ khóa", icon: "🔍" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeSection === tab.id
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Strengths Section */}
            {activeSection === "strengths" && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white mr-3">
                    ✨
                  </span>
                  Điểm mạnh nổi bật
                </h3>
                <div className="space-y-4">
                  {aiReview.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="p-6 bg-green-50 rounded-xl border-l-4 border-green-500 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                          {strength.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{strength.category}</h4>
                          <p className="text-gray-700">{strength.point}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements Section */}
            {activeSection === "improvements" && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white mr-3">
                    🚀
                  </span>
                  Đề xuất cải thiện
                </h3>
                <div className="space-y-6">
                  {aiReview.improvements.map((improvement, index) => (
                    <div
                      key={index}
                      className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-bold text-gray-900 text-lg">{improvement.category}</h4>
                        <PriorityBadge priority={improvement.priority} />
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-red-700 mb-2">❌ Vấn đề:</p>
                          <p className="text-gray-700">{improvement.issue}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-2">💡 Gợi ý:</p>
                          <p className="text-gray-700">{improvement.suggestion}</p>
                        </div>
                        
                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm font-semibold text-green-700 mb-2">✅ Ví dụ:</p>
                          <p className="text-gray-800 italic">{improvement.example}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords Section */}
            {activeSection === "keywords" && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mr-3">
                    🔍
                  </span>
                  Phân tích từ khóa
                </h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Missing Keywords */}
                  <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                    <h4 className="font-bold text-red-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Thiếu từ khóa
                    </h4>
                    <div className="space-y-2">
                      {aiReview.keywordAnalysis.missing.map((keyword, i) => (
                        <span key={i} className="inline-block px-3 py-1 bg-white text-red-700 rounded-lg text-sm font-medium mr-2 mb-2 border border-red-300">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Overused Keywords */}
                  <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                    <h4 className="font-bold text-yellow-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Dùng quá nhiều
                    </h4>
                    <div className="space-y-2">
                      {aiReview.keywordAnalysis.overused.map((keyword, i) => (
                        <span key={i} className="inline-block px-3 py-1 bg-white text-yellow-700 rounded-lg text-sm font-medium mr-2 mb-2 border border-yellow-300">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Keywords */}
                  <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                    <h4 className="font-bold text-green-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Nên thêm
                    </h4>
                    <div className="space-y-2">
                      {aiReview.keywordAnalysis.recommended.map((keyword, i) => (
                        <span key={i} className="inline-block px-3 py-1 bg-white text-green-700 rounded-lg text-sm font-medium mr-2 mb-2 border border-green-300">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex flex-wrap gap-4 justify-center">
                <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Áp dụng tất cả gợi ý
                </button>
                
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Tải báo cáo PDF
                </button>
                
                <button 
                  onClick={() => navigate(`/job/${id}`)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Xem bản gốc
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetailAIReview;
