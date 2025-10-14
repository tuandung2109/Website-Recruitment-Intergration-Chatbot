import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Briefcase,
  BarChart3,
  FileText 
} from 'lucide-react';
import './EvaluateCV.css';

const EvaluateCV = () => {
  // Dữ liệu mẫu - bạn có thể thay thế bằng API call
  const [cvEvaluation] = useState({
    summary: "Nguyễn Thế Thành là một sinh viên chuyên ngành Công nghệ phần mềm tại Đại học Mở Hà Nội, có định hướng rõ ràng trở thành Game Developer với nền tảng kỹ thuật tốt trong Unity, C# và các công cụ phát triển game. CV thể hiện nhiệt huyết, kinh nghiệm thực hành qua nhiều dự án cá nhân và khả năng ứng dụng các nguyên lý lập trình hướng đối tượng, thiết kế phần mềm. Tuy nhiên, CV cần cải thiện về cấu trúc, ngôn ngữ chuyên nghiệp và chi tiết hóa đóng góp cụ thể trong từng dự án.",
    scores: {
      clarity: 6,
      relevance: 7,
      skills: 7,
      projects: 7,
      professionalism: 5,
      overall: 6
    },
    strengths: [
      "Có định hướng nghề nghiệp rõ ràng: trở thành Game Developer chuyên nghiệp",
      "Kinh nghiệm thực tế với nhiều dự án game đa dạng (3D, 2D, mobile, AI)",
      "Sử dụng tốt các công cụ và công nghệ phổ biến trong ngành: Unity, C#, UI Toolkit, Firebase, Git",
      "Áp dụng các Design Pattern và nguyên lý thiết kế (MVC, Pooling, State Machine, SOLID, OOP)",
      "Có kiến thức về Machine Learning với dự án NLP sử dụng ML.NET",
      "Đã hoàn thành nhiều dự án cá nhân, thể hiện tinh thần tự học và sáng tạo",
      "Có thành tích học tập và giải thưởng học thuật (Học bổng Giỏi/Khá, giải Vật lý cấp tỉnh)"
    ],
    weaknesses: [
      "Thiếu thông tin về kinh nghiệm làm việc chuyên nghiệp hoặc thực tập (chỉ ghi 'Unity Developer Intern' mà không có chi tiết)",
      "Liên kết dự án đều ghi 'Link' thay vì URL thực tế, làm giảm độ tin cậy",
      "Ngôn ngữ không nhất quán (lẫn tiếng Việt và tiếng Anh), cấu trúc CV chưa chuyên nghiệp",
      "Thiếu mô tả chi tiết về vai trò, trách nhiệm và kết quả cụ thể trong từng dự án",
      "Không có thông tin về kỹ năng mềm, ngoại ngữ, hoạt động ngoại khóa hoặc làm việc nhóm",
      "Thiếu phần chứng chỉ, kỹ năng ngoại ngữ hoặc đóng góp cộng đồng",
      "Thông tin liên hệ bị phân mảnh, không theo chuẩn quốc tế"
    ],
    recommendations: [
      "Chuẩn hóa CV bằng tiếng Anh hoặc tiếng Việt hoàn toàn, ưu tiên tiếng Anh để phù hợp ngành công nghệ toàn cầu",
      "Bổ sung mô tả chi tiết cho từng dự án: vai trò, thời gian, công nghệ sử dụng, kết quả đạt được (số lượng người chơi, lượt tải, hiệu suất cải thiện...)",
      "Thay thế 'Link' bằng URL thật hoặc ghi rõ 'Private Repository' nếu chưa công khai",
      "Thêm phần kinh nghiệm thực tập: công ty, thời gian, nhiệm vụ, sản phẩm đã đóng góp",
      "Tổ chức lại cấu trúc CV theo thứ tự: Thông tin cá nhân → Mục tiêu nghề nghiệp → Kinh nghiệm → Dự án → Kỹ năng → Giáo dục → Giải thưởng",
      "Bổ sung kỹ năng mềm: làm việc nhóm, giao tiếp, quản lý thời gian, ngoại ngữ (TOEIC, IELTS...)",
      "Tạo portfolio website hoặc LinkedIn để tăng độ chuyên nghiệp",
      "Tham gia các cuộc thi game jam, đóng góp mã nguồn mở để mở rộng mạng lưới và kinh nghiệm"
    ],
    suggested_job_roles: [
      "Junior Game Developer (Unity)",
      "Gameplay Programmer",
      "Mobile Game Developer (2D/3D)",
      "Unity Intern",
      "AI Programmer (với nền tảng ML và NLP)",
      "Frontend Developer (Blazor, Web UI với C#)"
    ]
  });

  const getScoreColor = (score) => {
    if (score >= 8) return 'score-excellent';
    if (score >= 6) return 'score-good';
    if (score >= 4) return 'score-average';
    return 'score-poor';
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Xuất sắc';
    if (score >= 6) return 'Tốt';
    if (score >= 4) return 'Trung bình';
    return 'Cần cải thiện';
  };

  return (
    <div className="evaluate-cv-container">
      <div className="evaluate-cv-header">
        <FileText className="header-icon" />
        <h1>Đánh Giá CV</h1>
        <p>Phân tích chi tiết và đề xuất cải thiện</p>
      </div>

      {/* Overall Score */}
      <div className="overall-score-card">
        <div className="score-circle-wrapper">
          <div className={`score-circle ${getScoreColor(cvEvaluation.scores.overall)}`}>
            <span className="score-value">{cvEvaluation.scores.overall}</span>
            <span className="score-max">/10</span>
          </div>
          <p className="score-label">{getScoreLabel(cvEvaluation.scores.overall)}</p>
        </div>
        <div className="summary-text">
          <h3>Tổng Quan</h3>
          <p>{cvEvaluation.summary}</p>
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="scores-grid">
        <div className="score-card">
          <BarChart3 className="score-icon" />
          <h4>Độ rõ ràng</h4>
          <div className="score-bar">
            <div 
              className={`score-bar-fill ${getScoreColor(cvEvaluation.scores.clarity)}`}
              style={{ width: `${cvEvaluation.scores.clarity * 10}%` }}
            ></div>
          </div>
          <span className="score-number">{cvEvaluation.scores.clarity}/10</span>
        </div>

        <div className="score-card">
          <BarChart3 className="score-icon" />
          <h4>Mức độ liên quan</h4>
          <div className="score-bar">
            <div 
              className={`score-bar-fill ${getScoreColor(cvEvaluation.scores.relevance)}`}
              style={{ width: `${cvEvaluation.scores.relevance * 10}%` }}
            ></div>
          </div>
          <span className="score-number">{cvEvaluation.scores.relevance}/10</span>
        </div>

        <div className="score-card">
          <BarChart3 className="score-icon" />
          <h4>Kỹ năng</h4>
          <div className="score-bar">
            <div 
              className={`score-bar-fill ${getScoreColor(cvEvaluation.scores.skills)}`}
              style={{ width: `${cvEvaluation.scores.skills * 10}%` }}
            ></div>
          </div>
          <span className="score-number">{cvEvaluation.scores.skills}/10</span>
        </div>

        <div className="score-card">
          <BarChart3 className="score-icon" />
          <h4>Dự án</h4>
          <div className="score-bar">
            <div 
              className={`score-bar-fill ${getScoreColor(cvEvaluation.scores.projects)}`}
              style={{ width: `${cvEvaluation.scores.projects * 10}%` }}
            ></div>
          </div>
          <span className="score-number">{cvEvaluation.scores.projects}/10</span>
        </div>

        <div className="score-card">
          <BarChart3 className="score-icon" />
          <h4>Tính chuyên nghiệp</h4>
          <div className="score-bar">
            <div 
              className={`score-bar-fill ${getScoreColor(cvEvaluation.scores.professionalism)}`}
              style={{ width: `${cvEvaluation.scores.professionalism * 10}%` }}
            ></div>
          </div>
          <span className="score-number">{cvEvaluation.scores.professionalism}/10</span>
        </div>
      </div>

      {/* Strengths */}
      <div className="section-card strengths-card">
        <div className="section-header">
          <CheckCircle className="section-icon success-icon" />
          <h2>Điểm Mạnh</h2>
        </div>
        <ul className="strengths-list">
          {cvEvaluation.strengths.map((strength, index) => (
            <li key={index}>
              <CheckCircle className="list-icon success-icon" />
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Weaknesses */}
      <div className="section-card weaknesses-card">
        <div className="section-header">
          <AlertTriangle className="section-icon warning-icon" />
          <h2>Điểm Cần Cải Thiện</h2>
        </div>
        <ul className="weaknesses-list">
          {cvEvaluation.weaknesses.map((weakness, index) => (
            <li key={index}>
              <AlertTriangle className="list-icon warning-icon" />
              <span>{weakness}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="section-card recommendations-card">
        <div className="section-header">
          <Lightbulb className="section-icon info-icon" />
          <h2>Đề Xuất Cải Thiện</h2>
        </div>
        <ul className="recommendations-list">
          {cvEvaluation.recommendations.map((recommendation, index) => (
            <li key={index}>
              <Lightbulb className="list-icon info-icon" />
              <span>{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested Job Roles */}
      <div className="section-card job-roles-card">
        <div className="section-header">
          <Briefcase className="section-icon primary-icon" />
          <h2>Vị Trí Công Việc Phù Hợp</h2>
        </div>
        <div className="job-roles-grid">
          {cvEvaluation.suggested_job_roles.map((role, index) => (
            <div key={index} className="job-role-tag">
              <Briefcase className="job-role-icon" />
              {role}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn-primary">
          Tải Xuống Báo Cáo PDF
        </button>
        <button className="btn-secondary">
          Đánh Giá CV Khác
        </button>
      </div>
    </div>
  );
};

export default EvaluateCV;
