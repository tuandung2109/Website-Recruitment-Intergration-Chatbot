import React from 'react';
import {
    FileText,
    Download,
    Target,
    Lightbulb,
    ListChecks,
    CheckCircle,
    AlertCircle,
    XCircle
} from 'lucide-react';
import './CVJobMatcher.css';

const normalizeScore = (score) => {
    if (score === null || score === undefined) return 0;
    const numericValue = Number(score);
    if (!Number.isFinite(numericValue)) return 0;
    if (numericValue <= 10) {
        return Math.min(Math.max(numericValue, 0) * 10, 100);
    }
    return Math.min(Math.max(numericValue, 0), 100);
};

const getScoreColor = (percent) => {
    if (percent >= 75) return '#10b981';
    if (percent >= 50) return '#f59e0b';
    return '#ef4444';
};

const getScoreLabel = (percent) => {
    if (percent >= 75) return 'Xuất sắc';
    if (percent >= 50) return 'Ổn định';
    return 'Cần cải thiện';
};

const formatScore = (score) => {
    if (score === null || score === undefined) return '0/10';
    const numericValue = Number(score);
    if (!Number.isFinite(numericValue)) return '0/10';
    return numericValue <= 10 ? `${numericValue}/10` : `${numericValue}`;
};

const splitList = (text) => {
    if (!text) return [];
    return text
        .split(/\r?\n|\s*,\s+/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const parseInsights = (text) => {
    if (!text) return [];
    return text
        .split(/\.(?=\s*[A-ZÀ-Ỹ])/)
        .map((item) => item.replace(/^[,\s]+|[\s,.]+$/g, '').trim())
        .filter(Boolean);
};

const parseInterviewQuestions = (text) => {
    if (!text) return [];
    return text
        .split('?')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => (item.endsWith('?') ? item : `${item}?`));
};

const statusMeta = {
    match: { label: 'Khớp', className: 'match' },
    partial: { label: 'Cần bổ sung', className: 'partial' },
    gap: { label: 'Thiếu', className: 'gap' }
};

const statusIcon = {
    match: <CheckCircle size={18} />,
    partial: <AlertCircle size={18} />,
    gap: <XCircle size={18} />
};

const CVJobMatcherResult = ({ data, onNewScan, cvFileName, jobTitle }) => {
    if (!data) {
        return (
            <div className="cv-job-matcher-result">
                <div className="result-header clean">
                    <div className="header-nav">
                        <button className="back-button" onClick={onNewScan}>
                            <FileText size={20} />
                            Quét CV khác
                        </button>
                    </div>
                    <button className="download-button" disabled>
                        <Download size={20} />
                        Tải báo cáo
                    </button>
                </div>
                <div className="result-content empty-state">
                    <p>Chưa có dữ liệu đánh giá.</p>
                </div>
            </div>
        );
    }

    const evaluation = data || {};
    const displayedJobTitle = jobTitle || evaluation.job_title || 'Kết quả đánh giá AI';
    const resumeName = cvFileName || 'CV đã tải lên';

    const metrics = [
        { key: 'skill', label: 'Kỹ năng', value: evaluation.skill },
        { key: 'education', label: 'Học vấn', value: evaluation.education },
        { key: 'position', label: 'Phù hợp vị trí', value: evaluation.position },
        { key: 'experiences', label: 'Kinh nghiệm', value: evaluation.experiences },
        { key: 'general', label: 'Tổng quan', value: evaluation.general }
    ];

    const metricAggregate = metrics.reduce(
        (acc, metric) => {
            const numericValue = Number(metric.value);
            if (Number.isFinite(numericValue)) {
                acc.sum += numericValue;
                acc.count += 1;
            }
            return acc;
        },
        { sum: 0, count: 0 }
    );

    const averageScore = metricAggregate.count ? metricAggregate.sum / metricAggregate.count : 0;
    const overallDisplayScore = Number.isFinite(averageScore) ? Number(averageScore.toFixed(1)) : 0;
    const generalPercent = normalizeScore(averageScore);

    const insights = parseInsights(evaluation.detail_analysis);
    const strengths = splitList(evaluation.strong);
    const weaknesses = splitList(evaluation.weak);
    const interviewQuestions = parseInterviewQuestions(evaluation.interview_question);
    const skillMatches = evaluation.skill_matches || [];

    return (
        <div className="cv-job-matcher-result">
            <div className="result-header clean">
                <div className="header-nav">
                    <button className="back-button" onClick={onNewScan}>
                        <FileText size={20} />
                        Quét CV khác
                    </button>
                </div>
                <button className="download-button">
                    <Download size={20} />
                    Tải báo cáo
                </button>
            </div>

            <div className="result-content modern-layout">
                <section className="result-hero">
                    <div className="hero-text">
                        <p className="hero-eyebrow">Báo cáo AI</p>
                        <h1>{displayedJobTitle}</h1>
                        <p className="hero-meta">{resumeName}</p>
                    </div>
                    <div className="hero-score">
                        <div className="score-ring-wrapper">
                            <svg viewBox="0 0 200 200" className="score-ring">
                                <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="14" />
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="90"
                                    fill="none"
                                    stroke={getScoreColor(generalPercent)}
                                    strokeWidth="14"
                                    strokeDasharray={`${565 * generalPercent / 100} 565`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 100 100)"
                                />
                            </svg>
                            <div className="score-ring-inner">
                                <span className="score-ring-value">{overallDisplayScore}</span>
                                <span className="score-ring-caption">/10 Tổng quan</span>
                            </div>
                        </div>
                        <div className="score-meta">
                            <span className="score-chip" style={{ color: getScoreColor(generalPercent) }}>
                                {getScoreLabel(generalPercent)}
                            </span>
                        </div>
                    </div>
                </section>

                <section className="metrics-grid modern">
                    {metrics.map((metric) => (
                        <div key={metric.key} className="metric-pill">
                            <span className="metric-pill-label">{metric.label}</span>
                            <strong className="metric-pill-value">{formatScore(metric.value)}</strong>
                            <div className="metric-pill-track">
                                <span
                                    className="metric-pill-fill"
                                    style={{
                                        width: `${normalizeScore(metric.value)}%`,
                                        backgroundColor: getScoreColor(normalizeScore(metric.value))
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </section>

                <div className="result-columns">
                    <div className="result-column">
                        <div className="modern-card analysis-card">
                            <div className="card-header">
                                <Lightbulb size={20} />
                                <span>Nhận định tổng quan</span>
                            </div>
                            <div className="insight-list">
                                {insights.length ? (
                                    insights.map((insight, index) => (
                                        <p key={`insight-${index}`}>{insight}.</p>
                                    ))
                                ) : (
                                    <p>Chưa có phân tích chi tiết.</p>
                                )}
                            </div>
                        </div>

                        <div className="modern-card strengths-card">
                            <div className="card-split">
                                <div>
                                    <div className="card-header success">
                                        <CheckCircle size={18} />
                                        <span>Điểm mạnh</span>
                                    </div>
                                    <ul>
                                        {strengths.length ? (
                                            strengths.map((item, index) => (
                                                <li key={`strength-${index}`}>{item}</li>
                                            ))
                                        ) : (
                                            <li>Chưa có dữ liệu.</li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <div className="card-header warning">
                                        <AlertCircle size={18} />
                                        <span>Điểm yếu</span>
                                    </div>
                                    <ul>
                                        {weaknesses.length ? (
                                            weaknesses.map((item, index) => (
                                                <li key={`weak-${index}`}>{item}</li>
                                            ))
                                        ) : (
                                            <li>Chưa có dữ liệu.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="modern-card interview-card">
                            <div className="card-header">
                                <ListChecks size={18} />
                                <span>Câu hỏi phỏng vấn gợi ý</span>
                            </div>
                            {interviewQuestions.length ? (
                                <ol>
                                    {interviewQuestions.map((question, index) => (
                                        <li key={`question-${index}`}>{question}</li>
                                    ))}
                                </ol>
                            ) : (
                                <p>Chưa có câu hỏi nào được đề xuất.</p>
                            )}
                        </div>
                    </div>

                    <div className="result-column">
                        <div className="modern-card skill-match-card">
                            <div className="card-header">
                                <Target size={20} />
                                <span>So khớp kỹ năng</span>
                            </div>
                            {skillMatches.length ? (
                                <div className="skill-match-stack">
                                    {skillMatches.map((match, index) => {
                                        const info = statusMeta[match.status] || statusMeta.partial;
                                        return (
                                            <div key={`${match.name}-${index}`} className={`skill-match-panel ${info.className}`}>
                                                <div className="skill-match-panel-header">
                                                    <div>
                                                        <p className="skill-name">{match.name}</p>
                            
                                                    </div>
                                                    <span className={`skill-status ${info.className}`}>
                                                        {statusIcon[match.status] || statusIcon.partial}
                                                        {info.label}
                                                    </span>
                                                </div>
                                                {match.jobRequirement && (
                                                    <p className="skill-detail"><strong>Yêu cầu:</strong> {match.jobRequirement}</p>
                                                )}
                                                {match.evidence && (
                                                    <p className="skill-detail"><strong>Ứng viên:</strong> {match.evidence}</p>
                                                )}
                                                {match.recommendation && (
                                                    <div className="skill-recommendation">{match.recommendation}</div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p>Chưa có dữ liệu so khớp kỹ năng.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CVJobMatcherResult;
