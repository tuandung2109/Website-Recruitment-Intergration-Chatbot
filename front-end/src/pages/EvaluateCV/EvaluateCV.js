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
    summary: "",
    scores: {
      clarity: 0,
      relevance: 0,
      skills: 0,
      projects: 0,
      professionalism: 0,
      overall: 0
    },
    strengths: [
  
    ],
    weaknesses: [

    ],
    recommendations: [
   
    ],
    suggested_job_roles: [
  
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
