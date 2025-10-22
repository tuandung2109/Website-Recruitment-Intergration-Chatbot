import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Target,
  Clock,
  Mail,
  Phone,
  FileText,
  BarChart3,
  Filter,
  Download,
  RefreshCw,
  Star,
  Trophy,
  Brain,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import "./CandidateEvaluation.css";

// Dữ liệu mẫu để hiển thị
const mockJobInfo = {
  job_posting_id: 3,
  position_name: "Nhân viên tín dụng",
  company: "FinBank",
  total_candidates: 5,
};

const mockEvaluations = [
  {
    candidate_id: 1,
    candidate_name: "Nguyễn Văn A",
    candidate_email: "nguyenvana@example.com",
    candidate_phone: "0123456789",
    submitted_at: "2025-10-15",
    overall_score: 92,
    match_percentage: 92,
    recommendation: "Highly Recommended",
    scores: {
      skills_match: 95,
      experience_match: 90,
      education_match: 88,
      cultural_fit: 95,
    },
    strengths: [
      "Có 5 năm kinh nghiệm trong lĩnh vực tài chính ngân hàng",
      "Thành thạo SQL và các công cụ phân tích dữ liệu",
      "Tốt nghiệp xuất sắc chuyên ngành Tài chính - Ngân hàng",
      "Có chứng chỉ CFA Level 2",
      "Kinh nghiệm xử lý hồ sơ vay lớn tại ngân hàng top đầu",
    ],
    weaknesses: [
      "Chưa có kinh nghiệm làm việc tại Đà Nẵng",
      "CV chưa nêu rõ số lượng hồ sơ đã xử lý",
    ],
    gaps: [
      "Cần xác nhận khả năng làm việc độc lập",
      "Chưa rõ kinh nghiệm với phần mềm quản lý tín dụng cụ thể",
    ],
    interview_focus: [
      "Kinh nghiệm xử lý các khoản vay phức tạp và quy mô lớn",
      "Khả năng đánh giá rủi ro tín dụng trong tình huống khó khăn",
      "Kỹ năng giao tiếp và tư vấn khách hàng VIP",
      "Cách xử lý các trường hợp khách hàng nợ quá hạn",
    ],
    salary_fit: "Match",
    next_steps: [
      "Mời phỏng vấn vòng 1 - Phỏng vấn kỹ thuật và case study",
      "Yêu cầu bổ sung portfolio về các dự án đã thực hiện",
      "Kiểm tra references từ công ty cũ",
    ],
    detailed_analysis:
      "Ứng viên có nền tảng rất tốt về tài chính với 5 năm kinh nghiệm thực tế. Kỹ năng SQL và phân tích dữ liệu rất phù hợp với yêu cầu công việc xử lý hồ sơ vay. Điểm nổi bật là có chứng chỉ CFA Level 2 và kinh nghiệm tại ngân hàng lớn. Tuy nhiên, cần đánh giá kỹ hơn về khả năng thích nghi với môi trường làm việc mới và văn hóa công ty trong buổi phỏng vấn.",
  },
  {
    candidate_id: 2,
    candidate_name: "Trần Thị B",
    candidate_email: "tranthib@example.com",
    candidate_phone: "0987654321",
    submitted_at: "2025-10-14",
    overall_score: 78,
    match_percentage: 78,
    recommendation: "Recommended",
    scores: {
      skills_match: 75,
      experience_match: 80,
      education_match: 85,
      cultural_fit: 72,
    },
    strengths: [
      "Tốt nghiệp Đại học Kinh tế TP.HCM với GPA cao",
      "Có 3 năm kinh nghiệm xử lý hồ sơ tín dụng cá nhân",
      "Thành thạo Excel và các công cụ văn phòng",
      "Có kinh nghiệm làm việc tại Đà Nẵng",
    ],
    weaknesses: [
      "Kinh nghiệm SQL còn hạn chế (chỉ 1 năm)",
      "Chưa xử lý các khoản vay doanh nghiệp quy mô lớn",
      "CV trình bày chưa chuyên nghiệp",
    ],
    gaps: [
      "Thiếu chứng chỉ chuyên môn về tài chính",
      "Chưa rõ lý do nghỉ việc ở công ty trước",
    ],
    interview_focus: [
      "Khả năng học hỏi và phát triển kỹ năng SQL",
      "Kinh nghiệm xử lý các tình huống khó khăn với khách hàng",
      "Động lực làm việc và kế hoạch phát triển nghề nghiệp",
    ],
    salary_fit: "Match",
    next_steps: [
      "Mời phỏng vấn vòng 1 - Đánh giá kỹ năng cơ bản",
      "Yêu cầu giải thích rõ hơn về kinh nghiệm làm việc",
      "Test thực hành SQL nếu qua vòng 1",
    ],
    detailed_analysis:
      "Ứng viên có nền tảng học vấn tốt và kinh nghiệm cơ bản phù hợp. Điểm mạnh là đã quen với môi trường làm việc tại Đà Nẵng. Tuy nhiên, kỹ năng SQL cần được cải thiện để đáp ứng tốt yêu cầu công việc. Đây là ứng viên tiềm năng nếu sẵn sàng học hỏi và phát triển.",
  },
  {
    candidate_id: 3,
    candidate_name: "Lê Văn C",
    candidate_email: "levanc@example.com",
    candidate_phone: "0912345678",
    submitted_at: "2025-10-13",
    overall_score: 55,
    match_percentage: 55,
    recommendation: "Consider",
    scores: {
      skills_match: 50,
      experience_match: 55,
      education_match: 60,
      cultural_fit: 55,
    },
    strengths: [
      "Tốt nghiệp Đại học Kinh tế Đà Nẵng",
      "Có 2 năm kinh nghiệm trong lĩnh vực tài chính",
      "Nhiệt tình và sẵn sàng học hỏi",
    ],
    weaknesses: [
      "Không có kinh nghiệm SQL",
      "Chưa từng làm việc trong ngân hàng",
      "Kinh nghiệm chủ yếu ở các công ty tài chính nhỏ",
      "CV thiếu nhiều thông tin quan trọng",
    ],
    gaps: [
      "Thiếu kỹ năng kỹ thuật cần thiết cho vị trí",
      "Chưa rõ khả năng làm việc dưới áp lực",
    ],
    interview_focus: [
      "Khả năng học hỏi kỹ năng mới nhanh chóng",
      "Hiểu biết về quy trình tín dụng ngân hàng",
      "Lý do muốn chuyển sang làm việc tại ngân hàng",
    ],
    salary_fit: "Below",
    next_steps: [
      "Cân nhắc kỹ trước khi mời phỏng vấn",
      "Có thể xem xét cho vị trí junior hoặc internship",
      "Yêu cầu bổ sung thêm thông tin về kỹ năng",
    ],
    detailed_analysis:
      "Ứng viên có nền tảng cơ bản nhưng còn thiếu nhiều kỹ năng quan trọng cho vị trí này. Kinh nghiệm chưa đủ mạnh và thiếu các kỹ năng kỹ thuật như SQL. Có thể cân nhắc cho vị trí entry-level hoặc đào tạo thêm trước khi nhận vào vị trí chính thức.",
  },
  {
    candidate_id: 4,
    candidate_name: "Phạm Thị D",
    candidate_email: "phamthid@example.com",
    candidate_phone: "0909876543",
    submitted_at: "2025-10-12",
    overall_score: 88,
    match_percentage: 88,
    recommendation: "Highly Recommended",
    scores: {
      skills_match: 85,
      experience_match: 92,
      education_match: 90,
      cultural_fit: 85,
    },
    strengths: [
      "7 năm kinh nghiệm trong lĩnh vực tín dụng ngân hàng",
      "Từng làm tại 2 ngân hàng lớn (Vietcombank, Techcombank)",
      "Thành thạo SQL và Power BI",
      "Có chứng chỉ quản lý rủi ro tín dụng (CRM)",
      "Kỹ năng giao tiếp và đàm phán xuất sắc",
    ],
    weaknesses: [
      "Mức lương mong muốn cao hơn budget 15%",
      "Chưa có kinh nghiệm làm việc tại Đà Nẵng",
    ],
    gaps: ["Cần thương lượng về mức lương", "Xác nhận khả năng relocation"],
    interview_focus: [
      "Lý do muốn chuyển công việc sang Đà Nẵng",
      "Kỳ vọng về lương và phúc lợi",
      "Kinh nghiệm quản lý team (nếu có)",
      "Các dự án lớn đã thực hiện",
    ],
    salary_fit: "Above",
    next_steps: [
      "Mời phỏng vấn ngay - ưu tiên cao",
      "Chuẩn bị đề xuất package lương hấp dẫn",
      "Giới thiệu về môi trường làm việc và phúc lợi tại Đà Nẵng",
    ],
    detailed_analysis:
      "Ứng viên rất xuất sắc với 7 năm kinh nghiệm thực tế tại các ngân hàng lớn. Có đầy đủ kỹ năng kỹ thuật và chứng chỉ chuyên môn. Thách thức duy nhất là mức lương mong muốn cao hơn và cần thuyết phục về việc relocation. Đây là ứng viên top priority cần được ưu tiên phỏng vấn và tạo package hấp dẫn.",
  },
  {
    candidate_id: 5,
    candidate_name: "Hoàng Văn E",
    candidate_email: "hoangvane@example.com",
    candidate_phone: "0934567890",
    submitted_at: "2025-10-10",
    overall_score: 35,
    match_percentage: 35,
    recommendation: "Not Recommended",
    scores: {
      skills_match: 30,
      experience_match: 35,
      education_match: 40,
      cultural_fit: 35,
    },
    strengths: ["Tốt nghiệp Đại học", "Có tinh thần học hỏi"],
    weaknesses: [
      "Không có kinh nghiệm trong lĩnh vực tài chính",
      "Không có kỹ năng SQL",
      "CV không liên quan đến vị trí ứng tuyển",
      "Kinh nghiệm chủ yếu trong lĩnh vực sales",
    ],
    gaps: [
      "Thiếu hoàn toàn kinh nghiệm và kỹ năng cần thiết",
      "Chưa rõ lý do ứng tuyển vị trí này",
    ],
    interview_focus: [
      "Lý do chuyển đổi nghề nghiệp sang tài chính",
      "Hiểu biết về công việc tín dụng ngân hàng",
    ],
    salary_fit: "Below",
    next_steps: [
      "Không đề xuất phỏng vấn cho vị trí này",
      "Có thể gợi ý ứng viên tìm hiểu và đào tạo thêm",
      "Từ chối một cách lịch sự",
    ],
    detailed_analysis:
      "Ứng viên không phù hợp với vị trí Nhân viên tín dụng. Profile và kinh nghiệm không liên quan đến lĩnh vực tài chính ngân hàng. Thiếu hoàn toàn các kỹ năng kỹ thuật và kinh nghiệm cần thiết. Không nên mời phỏng vấn để tránh lãng phí thời gian của cả hai bên.",
  },
];

const CandidateEvaluation = () => {
  const { jobPostingId } = useParams();
  const navigate = useNavigate();

  const [evaluations, setEvaluations] = useState(mockEvaluations);
  const [jobInfo] = useState(mockJobInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("score");

  const getRecommendationColor = (recommendation) => {
    const colors = {
      "Highly Recommended": "recommendation-highly",
      Recommended: "recommendation-recommended",
      Consider: "recommendation-consider",
      "Not Recommended": "recommendation-not",
    };
    return colors[recommendation] || "recommendation-default";
  };

  const getRecommendationIcon = (recommendation) => {
    const icons = {
      "Highly Recommended": <Trophy className="rec-icon" />,
      Recommended: <Star className="rec-icon" />,
      Consider: <AlertCircle className="rec-icon" />,
      "Not Recommended": <XCircle className="rec-icon" />,
    };
    return icons[recommendation] || <AlertCircle className="rec-icon" />;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "score-excellent";
    if (score >= 60) return "score-good";
    if (score >= 40) return "score-average";
    return "score-poor";
  };

  const getSalaryFitBadge = (salaryFit) => {
    const badges = {
      Match: {
        text: "Phù hợp",
        color: "#10b981",
        icon: <CheckCircle size={16} />,
      },
      Above: {
        text: "Cao hơn",
        color: "#f59e0b",
        icon: <AlertCircle size={16} />,
      },
      Below: {
        text: "Thấp hơn",
        color: "#ef4444",
        icon: <XCircle size={16} />,
      },
    };
    return badges[salaryFit] || badges["Match"];
  };

  const filteredEvaluations = evaluations.filter((evaluation) => {
    if (filterStatus === "all") return true;

    const recMap = {
      "highly-recommended": "Highly Recommended",
      recommended: "Recommended",
      consider: "Consider",
      "not-recommended": "Not Recommended",
    };

    return evaluation.recommendation === recMap[filterStatus];
  });

  const sortedEvaluations = [...filteredEvaluations].sort((a, b) => {
    if (sortBy === "score") {
      return (b.overall_score || 0) - (a.overall_score || 0);
    } else if (sortBy === "name") {
      return (a.candidate_name || "").localeCompare(b.candidate_name || "");
    } else if (sortBy === "date") {
      return new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0);
    }
    return 0;
  });

  const getStatistics = () => {
    const total = evaluations.length;
    const highlyRecommended = evaluations.filter(
      (e) => e.recommendation === "Highly Recommended"
    ).length;
    const recommended = evaluations.filter(
      (e) => e.recommendation === "Recommended"
    ).length;
    const consider = evaluations.filter(
      (e) => e.recommendation === "Consider"
    ).length;
    const notRecommended = evaluations.filter(
      (e) => e.recommendation === "Not Recommended"
    ).length;

    const avgScore =
      total > 0
        ? (
            evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) /
            total
          ).toFixed(1)
        : 0;

    return {
      total,
      highlyRecommended,
      recommended,
      consider,
      notRecommended,
      avgScore,
    };
  };

  const stats = getStatistics();

  return (
    <div className="candidate-evaluation-container">
      {/* Header */}
      <div className="evaluation-header">
        <div className="header-content">
          <div className="header-left">
            <Brain className="header-icon" />
            <div>
              <h1>Đánh Giá Ứng Viên AI</h1>
              <p className="job-info-subtitle">
                <Briefcase className="inline-icon" />
                {jobInfo.position_name} • {jobInfo.company}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              Quay lại
            </button>
            <button className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="spinning" />
                  Đang đánh giá...
                </>
              ) : (
                <>
                  <Download />
                  Tải xuống báo cáo
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <Users className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Tổng ứng viên</p>
          </div>
        </div>

        <div className="stat-card stat-highly">
          <Trophy className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.highlyRecommended}</h3>
            <p>Rất phù hợp</p>
          </div>
        </div>

        <div className="stat-card stat-recommended">
          <Star className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.recommended}</h3>
            <p>Phù hợp</p>
          </div>
        </div>

        <div className="stat-card stat-average">
          <BarChart3 className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.avgScore}</h3>
            <p>Điểm trung bình</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <Filter className="filter-icon" />
          <label>Lọc theo đề xuất:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả ({stats.total})</option>
            <option value="highly-recommended">
              Rất phù hợp ({stats.highlyRecommended})
            </option>
            <option value="recommended">Phù hợp ({stats.recommended})</option>
            <option value="consider">Cân nhắc ({stats.consider})</option>
            <option value="not-recommended">
              Không phù hợp ({stats.notRecommended})
            </option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sắp xếp theo:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="score">Điểm cao nhất</option>
            <option value="name">Tên A-Z</option>
            <option value="date">Ngày nộp mới nhất</option>
          </select>
        </div>
      </div>

      {/* Evaluations List */}
      <div className="evaluations-list">
        {sortedEvaluations.map((evaluation, index) => {
          const salaryBadge = getSalaryFitBadge(evaluation.salary_fit);

          return (
            <div key={index} className="evaluation-card">
              {/* Card Header */}
              <div className="evaluation-card-header">
                <div className="candidate-info">
                  <div className="candidate-rank">#{index + 1}</div>
                  <div className="candidate-details">
                    <h3>{evaluation.candidate_name || "Ứng viên"}</h3>
                    <div className="candidate-meta">
                      <span>
                        <Mail className="meta-icon" />
                        {evaluation.candidate_email}
                      </span>
                      <span>
                        <Phone className="meta-icon" />
                        {evaluation.candidate_phone}
                      </span>
                      <span>
                        <Clock className="meta-icon" />
                        {new Date(evaluation.submitted_at).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="evaluation-score-section">
                  <div
                    className={`overall-score ${getScoreColor(
                      evaluation.overall_score
                    )}`}
                  >
                    <span className="score-value">
                      {evaluation.overall_score}
                    </span>
                    <span className="score-max">/100</span>
                  </div>
                  <div
                    className={`recommendation-badge ${getRecommendationColor(
                      evaluation.recommendation
                    )}`}
                  >
                    {getRecommendationIcon(evaluation.recommendation)}
                    <span>{evaluation.recommendation}</span>
                  </div>
                  <div
                    className="salary-fit-badge"
                    style={{
                      background: `${salaryBadge.color}15`,
                      border: `2px solid ${salaryBadge.color}`,
                      color: salaryBadge.color,
                    }}
                  >
                    {salaryBadge.icon}
                    <span>Lương: {salaryBadge.text}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Scores */}
              <div className="scores-breakdown">
                <div className="score-item">
                  <div className="score-label">
                    <Briefcase className="score-label-icon" />
                    Kỹ năng
                  </div>
                  <div className="score-bar-container">
                    <div className="score-bar">
                      <div
                        className={`score-bar-fill ${getScoreColor(
                          evaluation.scores?.skills_match
                        )}`}
                        style={{ width: `${evaluation.scores?.skills_match}%` }}
                      ></div>
                    </div>
                    <span className="score-number">
                      {evaluation.scores?.skills_match}%
                    </span>
                  </div>
                </div>

                <div className="score-item">
                  <div className="score-label">
                    <Clock className="score-label-icon" />
                    Kinh nghiệm
                  </div>
                  <div className="score-bar-container">
                    <div className="score-bar">
                      <div
                        className={`score-bar-fill ${getScoreColor(
                          evaluation.scores?.experience_match
                        )}`}
                        style={{
                          width: `${evaluation.scores?.experience_match}%`,
                        }}
                      ></div>
                    </div>
                    <span className="score-number">
                      {evaluation.scores?.experience_match}%
                    </span>
                  </div>
                </div>

                <div className="score-item">
                  <div className="score-label">
                    <GraduationCap className="score-label-icon" />
                    Học vấn
                  </div>
                  <div className="score-bar-container">
                    <div className="score-bar">
                      <div
                        className={`score-bar-fill ${getScoreColor(
                          evaluation.scores?.education_match
                        )}`}
                        style={{
                          width: `${evaluation.scores?.education_match}%`,
                        }}
                      ></div>
                    </div>
                    <span className="score-number">
                      {evaluation.scores?.education_match}%
                    </span>
                  </div>
                </div>

                <div className="score-item">
                  <div className="score-label">
                    <Users className="score-label-icon" />
                    Văn hóa
                  </div>
                  <div className="score-bar-container">
                    <div className="score-bar">
                      <div
                        className={`score-bar-fill ${getScoreColor(
                          evaluation.scores?.cultural_fit
                        )}`}
                        style={{ width: `${evaluation.scores?.cultural_fit}%` }}
                      ></div>
                    </div>
                    <span className="score-number">
                      {evaluation.scores?.cultural_fit}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Analysis Section */}
              <div className="evaluation-analysis">
                <div className="analysis-grid">
                  {/* Strengths */}
                  {evaluation.strengths && evaluation.strengths.length > 0 && (
                    <div className="analysis-section strengths">
                      <h4>
                        <CheckCircle className="section-icon success" />
                        Điểm mạnh
                      </h4>
                      <ul>
                        {evaluation.strengths.map((strength, idx) => (
                          <li key={idx}>
                            <CheckCircle className="list-icon success" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {evaluation.weaknesses &&
                    evaluation.weaknesses.length > 0 && (
                      <div className="analysis-section weaknesses">
                        <h4>
                          <AlertCircle className="section-icon warning" />
                          Điểm yếu
                        </h4>
                        <ul>
                          {evaluation.weaknesses.map((weakness, idx) => (
                            <li key={idx}>
                              <AlertCircle className="list-icon warning" />
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Interview Focus */}
                  {evaluation.interview_focus &&
                    evaluation.interview_focus.length > 0 && (
                      <div className="analysis-section interview">
                        <h4>
                          <Target className="section-icon info" />
                          Trọng tâm phỏng vấn
                        </h4>
                        <ul>
                          {evaluation.interview_focus.map((focus, idx) => (
                            <li key={idx}>
                              <Target className="list-icon info" />
                              {focus}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Next Steps */}
                  {evaluation.next_steps &&
                    evaluation.next_steps.length > 0 && (
                      <div className="analysis-section next-steps">
                        <h4>
                          <Lightbulb className="section-icon primary" />
                          Bước tiếp theo
                        </h4>
                        <ul>
                          {evaluation.next_steps.map((step, idx) => (
                            <li key={idx}>
                              <Lightbulb className="list-icon primary" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                {/* Detailed Analysis */}
                {evaluation.detailed_analysis && (
                  <div className="detailed-analysis">
                    <h4>
                      <FileText className="section-icon" />
                      Phân tích chi tiết
                    </h4>
                    <p>{evaluation.detailed_analysis}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {sortedEvaluations.length === 0 && (
        <div className="no-results">
          <Filter className="no-results-icon" />
          <h3>Không có ứng viên nào phù hợp với bộ lọc</h3>
          <button
            className="btn-secondary"
            onClick={() => setFilterStatus("all")}
          >
            Xem tất cả
          </button>
        </div>
      )}
    </div>
  );
};

export default CandidateEvaluation;
