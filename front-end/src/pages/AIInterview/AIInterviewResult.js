// src/pages/AIInterview/AIInterviewResult.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AIInterviewResult.css";

// Mock AI evaluation - trong thực tế sẽ gọi API
const generateMockEvaluation = (interviewData) => {
  return {
    overallScore: 82,
    overallFeedback: "Bạn đã thể hiện tốt trong buổi phỏng vấn với câu trả lời chi tiết và rõ ràng. Tuy nhiên, vẫn còn một số điểm cần cải thiện để đạt được kết quả tốt hơn trong các buổi phỏng vấn tiếp theo.",
    strengths: [
      "Trình bày rõ ràng, mạch lạc và dễ hiểu",
      "Thể hiện sự tự tin và nhiệt tình với công việc",
      "Có khả năng phân tích và giải quyết vấn đề tốt",
    ],
    weaknesses: [
      "Cần cụ thể hơn trong việc đưa ra các ví dụ thực tế",
      "Nên cải thiện kỹ năng truyền đạt câu chuyện (storytelling)",
    ],
    recommendations: [
      "Chuẩn bị trước các ví dụ cụ thể về kinh nghiệm làm việc",
      "Luyện tập kỹ năng trình bày theo phương pháp STAR (Situation, Task, Action, Result)",
      "Nghiên cứu kỹ về công ty và vị trí ứng tuyển trước khi phỏng vấn",
    ],
    detailedScores: [
      {
        category: "Giao tiếp",
        score: 85,
        maxScore: 100,
        feedback: "Khả năng giao tiếp tốt, trả lời câu hỏi một cách rõ ràng và mạch lạc.",
      },
      {
        category: "Kinh nghiệm",
        score: 78,
        maxScore: 100,
        feedback: "Có kinh nghiệm phù hợp nhưng cần thể hiện cụ thể hơn qua các ví dụ thực tế.",
      },
      {
        category: "Kỹ năng chuyên môn",
        score: 80,
        maxScore: 100,
        feedback: "Thể hiện được kiến thức chuyên môn tốt, tuy nhiên cần cập nhật thêm các kỹ năng mới.",
      },
      {
        category: "Động lực & Thái độ",
        score: 88,
        maxScore: 100,
        feedback: "Thể hiện sự nhiệt tình và động lực cao với vị trí công việc.",
      },
      {
        category: "Giải quyết vấn đề",
        score: 82,
        maxScore: 100,
        feedback: "Có khả năng phân tích và đưa ra giải pháp hợp lý cho các tình huống.",
      },
    ],
    questionEvaluations: interviewData.map((item, index) => ({
      questionNumber: index + 1,
      question: item.question,
      answer: item.answer,
      score: [85, 78, 80, 88, 82, 79][index] || 80,
      feedback: [
        "Câu trả lời chi tiết và thể hiện được kinh nghiệm. Tuy nhiên, nên thêm các thành tích cụ thể để làm nổi bật hơn.",
        "Động lực rõ ràng nhưng có thể liên kết chặt chẽ hơn với mục tiêu nghề nghiệp dài hạn.",
        "Thành thật và tự nhận thức tốt. Nên thêm các bước cụ thể đang thực hiện để cải thiện điểm yếu.",
        "Câu chuyện hay và thể hiện khả năng giải quyết vấn đề. Có thể cấu trúc theo STAR method để rõ ràng hơn.",
        "Liệt kê kỹ năng tốt nhưng nên thêm các dự án/ví dụ cụ thể đã áp dụng kỹ năng đó.",
        "Mục tiêu rõ ràng và thực tế. Nên kết nối mục tiêu cá nhân với giá trị mang lại cho công ty.",
      ][index] || "Câu trả lời tốt.",
      highlightWords: [],
    })),
  };
};

const AIInterviewResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Lấy dữ liệu phỏng vấn từ location state
    const interviewData = location.state?.interviewData;

    if (!interviewData) {
      // Nếu không có dữ liệu, chuyển về trang phỏng vấn
      navigate("/ai-interview");
      return;
    }

    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const mockEvaluation = generateMockEvaluation(interviewData);
      setEvaluation(mockEvaluation);
      setLoading(false);
    }, 2000);
  }, [location.state, navigate]);

  const handleRetakeInterview = () => {
    navigate("/ai-interview");
  };

  const handleDownloadReport = () => {
    alert("Tính năng tải báo cáo sẽ sớm được cập nhật! 📄");
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#10b981";
    if (score >= 70) return "#3b82f6";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return "Xuất sắc";
    if (score >= 70) return "Tốt";
    if (score >= 50) return "Trung bình";
    return "Cần cải thiện";
  };

  if (loading) {
    return (
      <div className="interview-result-container">
        <div className="result-loading">
          <div className="ai-analyzing">
            <div className="ai-brain">
              <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="40" stroke="#667eea" strokeWidth="3" opacity="0.2" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset="62.8"
                  className="analyzing-circle"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2>AI đang phân tích câu trả lời của bạn...</h2>
            <p>Vui lòng đợi trong giây lát</p>
            <div className="loading-steps">
              <div className="step active">✓ Phân tích nội dung</div>
              <div className="step active">✓ Đánh giá kỹ năng</div>
              <div className="step">⏳ Tạo báo cáo</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  return (
    <div className="interview-result-container">
      <div className="result-content">
        {/* Header */}
        <div className="result-header">
          <button className="btn-back-result" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Quay lại
          </button>
          <h1 className="result-title">Kết quả phỏng vấn AI</h1>
          <button className="btn-download" onClick={handleDownloadReport}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 12.5L10 3.5M10 12.5L7.5 10M10 12.5L12.5 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.5 16.5H16.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Tải báo cáo
          </button>
        </div>

        {/* Overall Score */}
        <div className="overall-score-card">
          <div className="score-visual">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke="#e2e8f0"
                strokeWidth="20"
                fill="none"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                stroke={getScoreColor(evaluation.overallScore)}
                strokeWidth="20"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(evaluation.overallScore / 100) * 502.4} 502.4`}
                transform="rotate(-90 100 100)"
                className="score-circle"
              />
              <text
                x="100"
                y="100"
                textAnchor="middle"
                dy="10"
                fontSize="48"
                fontWeight="bold"
                fill={getScoreColor(evaluation.overallScore)}
              >
                {evaluation.overallScore}
              </text>
              <text
                x="100"
                y="130"
                textAnchor="middle"
                fontSize="16"
                fill="#718096"
              >
                {getScoreLabel(evaluation.overallScore)}
              </text>
            </svg>
          </div>
          <div className="score-info">
            <h2>Điểm tổng quan</h2>
            <p className="overall-feedback">{evaluation.overallFeedback}</p>
            <div className="quick-stats">
              <div className="stat-item">
                <div className="stat-icon">💪</div>
                <div className="stat-content">
                  <div className="stat-label">Điểm mạnh</div>
                  <div className="stat-value">{evaluation.strengths.length}</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <div className="stat-label">Cần cải thiện</div>
                  <div className="stat-value">{evaluation.weaknesses.length}</div>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">💡</div>
                <div className="stat-content">
                  <div className="stat-label">Khuyến nghị</div>
                  <div className="stat-value">{evaluation.recommendations.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="result-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Tổng quan
          </button>
          <button
            className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            📝 Chi tiết câu hỏi
          </button>
          <button
            className={`tab-btn ${activeTab === "skills" ? "active" : ""}`}
            onClick={() => setActiveTab("skills")}
          >
            🎯 Đánh giá kỹ năng
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="feedback-grid">
                <div className="feedback-card strengths">
                  <div className="feedback-header">
                    <div className="feedback-icon">✨</div>
                    <h3>Điểm mạnh</h3>
                  </div>
                  <ul className="feedback-list">
                    {evaluation.strengths.map((strength, index) => (
                      <li key={index}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="8" fill="#10b981" opacity="0.2" />
                          <path
                            d="M6 10L9 13L14 7"
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="feedback-card weaknesses">
                  <div className="feedback-header">
                    <div className="feedback-icon">📈</div>
                    <h3>Cần cải thiện</h3>
                  </div>
                  <ul className="feedback-list">
                    {evaluation.weaknesses.map((weakness, index) => (
                      <li key={index}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="8" fill="#f59e0b" opacity="0.2" />
                          <path
                            d="M10 6V11M10 14V14.5"
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="feedback-card recommendations">
                  <div className="feedback-header">
                    <div className="feedback-icon">💡</div>
                    <h3>Khuyến nghị</h3>
                  </div>
                  <ul className="feedback-list">
                    {evaluation.recommendations.map((recommendation, index) => (
                      <li key={index}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="8" fill="#3b82f6" opacity="0.2" />
                          <path
                            d="M10 5L10 10L13 13"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="details-tab">
              {evaluation.questionEvaluations.map((qEval) => (
                <div key={qEval.questionNumber} className="question-evaluation">
                  <div className="question-header">
                    <span className="question-badge">Câu {qEval.questionNumber}</span>
                    <span
                      className="question-score"
                      style={{ color: getScoreColor(qEval.score) }}
                    >
                      {qEval.score}/100
                    </span>
                  </div>
                  <div className="question-text">{qEval.question}</div>
                  <div className="answer-section">
                    <div className="answer-label">Câu trả lời của bạn:</div>
                    <div className="answer-text">{qEval.answer}</div>
                  </div>
                  <div className="ai-feedback">
                    <div className="feedback-label">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="8" fill="#667eea" opacity="0.2" />
                        <path
                          d="M10 6V10M10 13V13.5"
                          stroke="#667eea"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      Nhận xét từ AI
                    </div>
                    <p>{qEval.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === "skills" && (
            <div className="skills-tab">
              {evaluation.detailedScores.map((skill, index) => (
                <div key={index} className="skill-card">
                  <div className="skill-header">
                    <h4>{skill.category}</h4>
                    <span
                      className="skill-score"
                      style={{ color: getScoreColor(skill.score) }}
                    >
                      {skill.score}/{skill.maxScore}
                    </span>
                  </div>
                  <div className="skill-progress">
                    <div
                      className="skill-progress-bar"
                      style={{
                        width: `${(skill.score / skill.maxScore) * 100}%`,
                        backgroundColor: getScoreColor(skill.score),
                      }}
                    ></div>
                  </div>
                  <p className="skill-feedback">{skill.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button className="btn-retake" onClick={handleRetakeInterview}>
            🔄 Phỏng vấn lại
          </button>
          <button className="btn-home" onClick={() => navigate("/")}>
            🏠 Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewResult;
