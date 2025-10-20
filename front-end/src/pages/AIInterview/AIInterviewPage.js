// src/pages/AIInterview/AIInterviewPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AIInterviewPage.css";

// Mock questions - có thể load từ API sau
const MOCK_QUESTIONS = [
  {
    id: 1,
    question: "Hãy giới thiệu bản thân và kinh nghiệm làm việc của bạn?",
    placeholder: "Ví dụ: Tôi tên là... Tôi có 3 năm kinh nghiệm trong lĩnh vực...",
  },
  {
    id: 2,
    question: "Tại sao bạn muốn làm việc tại vị trí này?",
    placeholder: "Chia sẻ động lực và mục tiêu nghề nghiệp của bạn...",
  },
  {
    id: 3,
    question: "Điểm mạnh và điểm yếu của bạn là gì?",
    placeholder: "Hãy thành thật và cụ thể về bản thân...",
  },
  {
    id: 4,
    question: "Bạn đã từng đối mặt với thách thức lớn nào trong công việc? Bạn đã giải quyết như thế nào?",
    placeholder: "Kể về một tình huống cụ thể và cách bạn xử lý...",
  },
  {
    id: 5,
    question: "Kỹ năng công nghệ/chuyên môn nào bạn tự tin nhất?",
    placeholder: "Liệt kê các kỹ năng và mức độ thành thạo...",
  },
  {
    id: 6,
    question: "Mục tiêu nghề nghiệp của bạn trong 3-5 năm tới là gì?",
    placeholder: "Chia sẻ tầm nhìn và kế hoạch phát triển của bạn...",
  },
];

const AIInterviewPage = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [displayedQuestion, setDisplayedQuestion] = useState("");

  // Typing effect for AI question
  useEffect(() => {
    if (isStarted && !isCompleted) {
      setAiTyping(true);
      setDisplayedQuestion("");
      const question = MOCK_QUESTIONS[currentQuestion].question;
      let index = 0;

      const typingInterval = setInterval(() => {
        if (index < question.length) {
          setDisplayedQuestion((prev) => prev + question[index]);
          index++;
        } else {
          setAiTyping(false);
          clearInterval(typingInterval);
        }
      }, 30);

      return () => clearInterval(typingInterval);
    }
  }, [currentQuestion, isStarted, isCompleted]);

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleAnswerChange = (e) => {
    setCurrentAnswer(e.target.value);
  };

  const handleNext = () => {
    if (!currentAnswer.trim()) {
      alert("Vui lòng trả lời câu hỏi trước khi tiếp tục!");
      return;
    }

    // Save current answer
    setAnswers({
      ...answers,
      [currentQuestion]: currentAnswer,
    });

    // Move to next question or complete
    if (currentQuestion < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer("");
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      // Save current answer
      setAnswers({
        ...answers,
        [currentQuestion]: currentAnswer,
      });

      setCurrentQuestion(currentQuestion - 1);
      setCurrentAnswer(answers[currentQuestion - 1] || "");
    }
  };

  const handleComplete = () => {
    const finalAnswers = {
      ...answers,
      [currentQuestion]: currentAnswer,
    };
    setAnswers(finalAnswers);
    setIsCompleted(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Prepare interview data
    const interviewData = MOCK_QUESTIONS.map((q, index) => ({
      question: q.question,
      answer: answers[index] || "",
    }));

    console.log("Interview Data:", interviewData);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Navigate to results page with interview data
      navigate("/ai-interview/result", { state: { interviewData } });
    }, 1500);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setCurrentAnswer("");
    setIsStarted(false);
    setIsCompleted(false);
  };

  // Welcome Screen
  if (!isStarted) {
    return (
      <div className="ai-interview-container">
        <div className="ai-interview-welcome">
          <div className="ai-avatar-large">
            <div className="ai-avatar-circle">
              <svg
                width="80"
                height="80"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="35" r="15" fill="#6366f1" />
                <path
                  d="M20 80 Q20 55 50 55 Q80 55 80 80"
                  fill="#6366f1"
                />
                <circle cx="42" cy="33" r="3" fill="white" />
                <circle cx="58" cy="33" r="3" fill="white" />
                <path
                  d="M40 42 Q50 45 60 42"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          <h1 className="welcome-title">Phỏng vấn AI</h1>
          <p className="welcome-subtitle">
            Trải nghiệm phỏng vấn thực tế với AI Recruiter
          </p>

          <div className="interview-info">
            <div className="info-card">
              <div className="info-icon">📋</div>
              <div className="info-content">
                <h3>6 câu hỏi</h3>
                <p>Các câu hỏi phỏng vấn phổ biến</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">⏱️</div>
              <div className="info-content">
                <h3>~15 phút</h3>
                <p>Thời gian hoàn thành dự kiến</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">💡</div>
              <div className="info-content">
                <h3>Lời khuyên</h3>
                <p>Trả lời chân thật và chi tiết</p>
              </div>
            </div>
          </div>

          <button className="btn-start-interview" onClick={handleStart}>
            <span>Bắt đầu phỏng vấn</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 5L12.5 10L7.5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Completed Screen
  if (isCompleted) {
    return (
      <div className="ai-interview-container">
        <div className="ai-interview-completed">
          <div className="completed-icon">
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="45" fill="#10b981" opacity="0.1" />
              <circle cx="50" cy="50" r="35" fill="#10b981" opacity="0.2" />
              <path
                d="M30 50 L45 65 L70 35"
                stroke="#10b981"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="completed-title">Hoàn thành phỏng vấn! 🎉</h2>
          <p className="completed-subtitle">
            Bạn đã trả lời tất cả {MOCK_QUESTIONS.length} câu hỏi
          </p>

          <div className="interview-summary">
            <h3>Tóm tắt câu trả lời</h3>
            <div className="summary-list">
              {MOCK_QUESTIONS.map((q, index) => (
                <div key={q.id} className="summary-item">
                  <div className="summary-question">
                    <span className="question-number">Câu {index + 1}</span>
                    <p>{q.question}</p>
                  </div>
                  <div className="summary-answer">
                    <p>{answers[index]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="completed-actions">
            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Đang gửi...
                </>
              ) : (
                "Gửi kết quả"
              )}
            </button>
            <button className="btn-restart" onClick={handleRestart}>
              Làm lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interview Screen
  return (
    <div className="ai-interview-container">
      <div className="ai-interview-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Thoát
        </button>

        <div className="progress-info">
          <span className="progress-text">
            Câu hỏi {currentQuestion + 1} / {MOCK_QUESTIONS.length}
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((currentQuestion + 1) / MOCK_QUESTIONS.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="ai-interview-content">
        <div className="ai-recruiter">
          <div className="ai-avatar">
            <div className="ai-avatar-circle">
              <svg
                width="50"
                height="50"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="35" r="15" fill="#6366f1" />
                <path d="M20 80 Q20 55 50 55 Q80 55 80 80" fill="#6366f1" />
                <circle cx="42" cy="33" r="3" fill="white" />
                <circle cx="58" cy="33" r="3" fill="white" />
                <path
                  d="M40 42 Q50 45 60 42"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            {aiTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>

          <div className="ai-message">
            <div className="ai-name">AI Recruiter</div>
            <div className="ai-question">
              {displayedQuestion}
              {aiTyping && <span className="cursor">|</span>}
            </div>
          </div>
        </div>

        <div className="answer-section">
          <label className="answer-label">Câu trả lời của bạn:</label>
          <textarea
            className="answer-textarea"
            value={currentAnswer}
            onChange={handleAnswerChange}
            placeholder={MOCK_QUESTIONS[currentQuestion].placeholder}
            rows={8}
            disabled={aiTyping}
          />
          <div className="char-count">
            {currentAnswer.length} ký tự
          </div>
        </div>

        <div className="interview-actions">
          <button
            className="btn-previous"
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || aiTyping}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Câu trước
          </button>

          <button
            className="btn-next"
            onClick={handleNext}
            disabled={aiTyping || !currentAnswer.trim()}
          >
            {currentQuestion === MOCK_QUESTIONS.length - 1
              ? "Hoàn thành"
              : "Câu tiếp theo"}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 5L12.5 10L7.5 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewPage;
