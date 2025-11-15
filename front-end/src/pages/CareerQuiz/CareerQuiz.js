import React, { useState } from "react";
import { Card, Button, Progress, Radio } from "antd";
import {
  BrainCircuitIcon,
  ShareIcon,
  RefreshCwIcon,
  TrophyIcon,
} from "lucide-react";
import "./CareerQuiz.css";

const CareerQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questions = [
    {
      id: 1,
      question: "Bạn thích làm việc như thế nào?",
      options: [
        { text: "Độc lập, tự do sáng tạo", type: "creative", score: 3 },
        { text: "Theo quy trình rõ ràng", type: "organizer", score: 3 },
        { text: "Làm việc nhóm, hỗ trợ người khác", type: "helper", score: 3 },
        { text: "Phân tích dữ liệu, giải quyết vấn đề", type: "analytical", score: 3 },
      ],
    },
    {
      id: 2,
      question: "Khi gặp vấn đề khó, bạn sẽ?",
      options: [
        { text: "Tìm giải pháp sáng tạo, độc đáo", type: "creative", score: 2 },
        { text: "Phân tích logic, tìm nguyên nhân", type: "analytical", score: 3 },
        { text: "Hỏi ý kiến đồng nghiệp", type: "helper", score: 2 },
        { text: "Lập kế hoạch chi tiết từng bước", type: "organizer", score: 2 },
      ],
    },
    {
      id: 3,
      question: "Môi trường làm việc lý tưởng của bạn?",
      options: [
        { text: "Văn phòng hiện đại, sáng tạo", type: "creative", score: 2 },
        { text: "Yên tĩnh, tập trung", type: "analytical", score: 2 },
        { text: "Năng động, nhiều tương tác", type: "helper", score: 3 },
        { text: "Có tổ chức, chuyên nghiệp", type: "organizer", score: 3 },
      ],
    },
    {
      id: 4,
      question: "Điểm mạnh của bạn là gì?",
      options: [
        { text: "Tư duy sáng tạo, nghệ thuật", type: "creative", score: 3 },
        { text: "Tư duy logic, phân tích", type: "analytical", score: 3 },
        { text: "Giao tiếp, đồng cảm", type: "helper", score: 3 },
        { text: "Tổ chức, quản lý thời gian", type: "organizer", score: 3 },
      ],
    },
    {
      id: 5,
      question: "Bạn thích học hỏi về?",
      options: [
        { text: "Thiết kế, nghệ thuật, xu hướng mới", type: "creative", score: 2 },
        { text: "Công nghệ, khoa học, dữ liệu", type: "analytical", score: 3 },
        { text: "Tâm lý học, kỹ năng mềm", type: "helper", score: 2 },
        { text: "Quản lý, kinh doanh, chiến lược", type: "leader", score: 3 },
      ],
    },
    {
      id: 6,
      question: "Trong nhóm, bạn thường là người?",
      options: [
        { text: "Đưa ra ý tưởng mới", type: "creative", score: 3 },
        { text: "Phân tích và đánh giá", type: "analytical", score: 2 },
        { text: "Hỗ trợ và động viên", type: "helper", score: 3 },
        { text: "Lãnh đạo và điều phối", type: "leader", score: 3 },
      ],
    },
    {
      id: 7,
      question: "Bạn cảm thấy hạnh phúc khi?",
      options: [
        { text: "Tạo ra sản phẩm đẹp, độc đáo", type: "creative", score: 3 },
        { text: "Giải quyết được vấn đề phức tạp", type: "analytical", score: 3 },
        { text: "Giúp đỡ người khác thành công", type: "helper", score: 3 },
        { text: "Hoàn thành mục tiêu đúng hạn", type: "organizer", score: 2 },
      ],
    },
    {
      id: 8,
      question: "Công việc lý tưởng của bạn cần có?",
      options: [
        { text: "Tự do sáng tạo", type: "creative", score: 3 },
        { text: "Thử thách trí tuệ", type: "analytical", score: 3 },
        { text: "Ý nghĩa xã hội", type: "helper", score: 3 },
        { text: "Cơ hội thăng tiến", type: "leader", score: 3 },
      ],
    },
    {
      id: 9,
      question: "Bạn thích làm việc với?",
      options: [
        { text: "Hình ảnh, màu sắc, thiết kế", type: "creative", score: 3 },
        { text: "Số liệu, biểu đồ, code", type: "analytical", score: 3 },
        { text: "Con người, cảm xúc", type: "helper", score: 3 },
        { text: "Kế hoạch, quy trình", type: "organizer", score: 3 },
      ],
    },
    {
      id: 10,
      question: "Khi có thời gian rảnh, bạn thích?",
      options: [
        { text: "Vẽ, chụp ảnh, làm video", type: "creative", score: 2 },
        { text: "Đọc sách, học online", type: "analytical", score: 2 },
        { text: "Gặp gỡ bạn bè, tình nguyện", type: "helper", score: 2 },
        { text: "Thể thao, du lịch, khám phá", type: "adventurer", score: 3 },
      ],
    },
    {
      id: 11,
      question: "Bạn ra quyết định dựa vào?",
      options: [
        { text: "Cảm xúc và trực giác", type: "creative", score: 2 },
        { text: "Dữ liệu và logic", type: "analytical", score: 3 },
        { text: "Ảnh hưởng đến người khác", type: "helper", score: 2 },
        { text: "Lợi ích và hiệu quả", type: "leader", score: 3 },
      ],
    },
    {
      id: 12,
      question: "Mục tiêu nghề nghiệp của bạn?",
      options: [
        { text: "Trở thành chuyên gia sáng tạo", type: "creative", score: 3 },
        { text: "Trở thành chuyên gia kỹ thuật", type: "analytical", score: 3 },
        { text: "Giúp đỡ nhiều người", type: "helper", score: 3 },
        { text: "Lãnh đạo đội nhóm lớn", type: "leader", score: 3 },
      ],
    },
  ];

  const careerTypes = {
    creative: {
      title: "Creative Innovator 🎨",
      description: "Bạn là người sáng tạo, yêu thích nghệ thuật và thiết kế",
      careers: [
        "UX/UI Designer",
        "Graphic Designer",
        "Content Creator",
        "Marketing Creative",
        "Video Editor",
      ],
      salary: "15-35 triệu",
      traits: ["Sáng tạo", "Nghệ thuật", "Độc đáo", "Tự do"],
      color: "#f093fb",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    analytical: {
      title: "Analytical Thinker 🧠",
      description: "Bạn là người logic, thích phân tích và giải quyết vấn đề",
      careers: [
        "Data Analyst",
        "Software Engineer",
        "Business Analyst",
        "Financial Analyst",
        "Research Scientist",
      ],
      salary: "20-45 triệu",
      traits: ["Logic", "Phân tích", "Tỉ mỉ", "Giải quyết vấn đề"],
      color: "#667eea",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    helper: {
      title: "People Helper 🤝",
      description: "Bạn là người nhiệt tình, thích giúp đỡ và hỗ trợ người khác",
      careers: [
        "HR Manager",
        "Customer Success",
        "Teacher/Trainer",
        "Social Worker",
        "Healthcare Professional",
      ],
      salary: "12-30 triệu",
      traits: ["Đồng cảm", "Giao tiếp", "Hỗ trợ", "Kiên nhẫn"],
      color: "#4ecdc4",
      gradient: "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
    },
    leader: {
      title: "Natural Leader 👑",
      description: "Bạn là người lãnh đạo, có tầm nhìn và khả năng điều phối",
      careers: [
        "Project Manager",
        "Product Manager",
        "Team Leader",
        "CEO/Founder",
        "Business Development",
      ],
      salary: "25-60 triệu",
      traits: ["Lãnh đạo", "Quyết đoán", "Tầm nhìn", "Trách nhiệm"],
      color: "#fa709a",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    organizer: {
      title: "Super Organizer 📋",
      description: "Bạn là người có tổ chức, kỷ luật và quản lý tốt",
      careers: [
        "Operations Manager",
        "Administrative Manager",
        "Event Planner",
        "Supply Chain Manager",
        "Quality Assurance",
      ],
      salary: "15-35 triệu",
      traits: ["Tổ chức", "Kỷ luật", "Chi tiết", "Hiệu quả"],
      color: "#a8edea",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    },
    adventurer: {
      title: "Bold Adventurer 🚀",
      description: "Bạn là người thích khám phá, thử thách và mạo hiểm",
      careers: [
        "Sales Executive",
        "Entrepreneur",
        "Travel Consultant",
        "Field Engineer",
        "Photographer/Journalist",
      ],
      salary: "15-50 triệu",
      traits: ["Dũng cảm", "Linh hoạt", "Năng động", "Thích thử thách"],
      color: "#ff6b6b",
      gradient: "linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)",
    },
  };

  const calculateResult = () => {
    const scores = {};
    Object.values(answers).forEach((answer) => {
      const type = answer.type;
      const score = answer.score;
      scores[type] = (scores[type] || 0) + score;
    });

    const sortedTypes = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sortedTypes[0][0];
  };

  const handleAnswer = (option) => {
    setSelectedAnswer(option);
  };

  const handleNext = () => {
    if (!selectedAnswer) return;

    setAnswers({
      ...answers,
      [currentQuestion]: selectedAnswer,
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const handleShare = () => {
    const resultType = calculateResult();
    const result = careerTypes[resultType];
    const text = `Tôi vừa làm Career Quiz và kết quả là: ${result.title}!\nNghề nghiệp phù hợp: ${result.careers[0]}\nMức lương: ${result.salary}\n\nBạn cũng thử xem nhé!`;
    
    if (navigator.share) {
      navigator.share({
        title: "Career Quiz Result",
        text: text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert("Đã copy kết quả! Bạn có thể paste và share lên mạng xã hội.");
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResult) {
    const resultType = calculateResult();
    const result = careerTypes[resultType];

    return (
      <div className="career-quiz-container">
        <div className="quiz-header">
          <h1>
            <TrophyIcon className="header-icon" /> Kết Quả Career Quiz
          </h1>
        </div>

        <Card className="result-card">
          <div
            className="result-header"
            style={{ background: result.gradient }}
          >
            <h2>{result.title}</h2>
            <p>{result.description}</p>
          </div>

          <div className="result-content">
            <div className="result-section">
              <h3>💼 Nghề nghiệp phù hợp</h3>
              <div className="career-list">
                {result.careers.map((career, index) => (
                  <div key={index} className="career-item">
                    <span className="career-number">{index + 1}</span>
                    <span className="career-name">{career}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-section">
              <h3>💰 Mức lương trung bình</h3>
              <div className="salary-badge">{result.salary}</div>
            </div>

            <div className="result-section">
              <h3>⭐ Tính cách nổi bật</h3>
              <div className="traits-list">
                {result.traits.map((trait, index) => (
                  <span key={index} className="trait-badge">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="result-actions">
              <Button
                type="primary"
                size="large"
                icon={<ShareIcon size={20} />}
                onClick={handleShare}
                style={{ background: result.color, borderColor: result.color }}
              >
                Chia sẻ kết quả
              </Button>
              <Button
                size="large"
                icon={<RefreshCwIcon size={20} />}
                onClick={handleRestart}
              >
                Làm lại
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="career-quiz-container">
      <div className="quiz-header">
        <h1>
          <BrainCircuitIcon className="header-icon" /> Career Quiz
        </h1>
        <p>Khám phá nghề nghiệp phù hợp với tính cách của bạn</p>
      </div>

      <Card className="quiz-card">
        <div className="quiz-progress">
          <Progress
            percent={progress}
            showInfo={false}
            strokeColor="#667eea"
          />
          <span className="progress-text">
            Câu {currentQuestion + 1} / {questions.length}
          </span>
        </div>

        <div className="question-section">
          <h2 className="question-text">
            {questions[currentQuestion].question}
          </h2>

          <Radio.Group
            className="options-list"
            value={selectedAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
          >
            {questions[currentQuestion].options.map((option, index) => (
              <Radio.Button
                key={index}
                value={option}
                className="option-button"
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">{option.text}</span>
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>

        <div className="quiz-actions">
          <Button
            type="primary"
            size="large"
            onClick={handleNext}
            disabled={!selectedAnswer}
            block
          >
            {currentQuestion < questions.length - 1
              ? "Câu tiếp theo"
              : "Xem kết quả"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CareerQuiz;
