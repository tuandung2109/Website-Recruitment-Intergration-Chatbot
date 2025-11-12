import React, { useState } from 'react';
import {
    Download,
    FileText,
    Mail,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Award,
    Target
} from 'lucide-react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer
} from 'recharts';
import './CVJobMatcher.css';

const CVJobMatcherResult = ({ data, onNewScan, cvFileName, jobTitle }) => {
    const [activeTab, setActiveTab] = useState('report'); // 'report', 'resume', 'cover-letter'
    const [expandedSections, setExpandedSections] = useState({
        content: true,
        skills: true,
        format: true,
        sections: true,
        style: true
    });

    // Toggle section expansion
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Get color based on match score
    const getScoreColor = (score) => {
        if (score >= 75) return '#10b981'; // Green
        if (score >= 50) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    // Get score label
    const getScoreLabel = (score) => {
        if (score >= 75) return 'Excellent';
        if (score >= 50) return 'Good';
        return 'Needs Improvement';
    };

    // Prepare radar chart data
    const radarData = [
        { category: 'Content', value: data.overview.categories.content.score },
        { category: 'Skills', value: data.overview.categories.skills.score },
        { category: 'Format', value: data.overview.categories.format.score },
        { category: 'Sections', value: data.overview.categories.sections.score },
        { category: 'Style', value: data.overview.categories.style.score }
    ];

    return (
        <div className="cv-job-matcher-result">
            {/* Header */}
            <div className="result-header">
                <div className="header-nav">
                    <button className="back-button" onClick={onNewScan}>
                        <FileText size={20} />
                        New Scan
                    </button>
                </div>
                <div className="header-tabs">
                    <button
                        className={`tab-button ${activeTab === 'report' ? 'active' : ''}`}
                        onClick={() => setActiveTab('report')}
                    >
                        <FileText size={20} />
                        Report
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'resume' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resume')}
                    >
                        <FileText size={20} />
                        Resume
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'cover-letter' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cover-letter')}
                    >
                        <Mail size={20} />
                        Cover Letter
                    </button>
                </div>
                <button className="download-button">
                    <Download size={20} />
                    Download
                </button>
            </div>

            {/* Job Info Banner */}
            <div className="job-info-banner">
                <div className="job-info-left">
                    <FileText size={24} />
                    <div>
                        <h3>{data.jobInfo.title}</h3>
                        <p className="cv-name">{cvFileName}</p>
                    </div>
                </div>
                <div className="job-info-actions">
                    <button className="edit-resume-button">
                        <FileText size={20} />
                        Edit Resume
                    </button>
                </div>
            </div>

            <div className="result-content">
                {/* Left Sidebar - Score Summary */}
                <div className="result-sidebar">
                    <div className="job-card">
                        <h3>{data.jobInfo.title}</h3>
                        <div className="match-score-large">
                            <svg viewBox="0 0 200 200" className="score-circle">
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="85"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="12"
                                />
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="85"
                                    fill="none"
                                    stroke={getScoreColor(data.overview.matchScore)}
                                    strokeWidth="12"
                                    strokeDasharray={`${534 * data.overview.matchScore / 100} 534`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 100 100)"
                                />
                                <text x="100" y="95" textAnchor="middle" className="score-number">
                                    {data.overview.matchScore}
                                </text>
                                <text x="100" y="120" textAnchor="middle" className="score-label-small">
                                    Match Score
                                </text>
                            </svg>
                        </div>
                        <p className="score-description">{data.overview.summary}</p>
                        <div className="suggestions-count">
                            <Award size={20} />
                            <span><strong>{data.overview.totalIssues}</strong> suggestions</span>
                        </div>
                        <p className="ats-info">
                            <AlertCircle size={16} />
                            Resumes with a score of 75 or higher are more likely to pass ATS.
                        </p>
                    </div>

                    {/* Category Scores */}
                    <div className="category-scores">
                        {Object.entries(data.overview.categories).map(([key, category]) => (
                            <div key={key} className="category-item">
                                <div className="category-header">
                                    <span className="category-name">{category.name}</span>
                                    <span className="category-count">{category.issues} issues</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill"
                                        style={{ 
                                            width: `${category.score}%`,
                                            backgroundColor: getScoreColor(category.score)
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="result-main">
                    {/* Overview Section */}
                    <div className="overview-section">
                        <h2>Overview</h2>
                        <div className="overview-card">
                            <div className="overview-text">
                                <h3>Match Score: <span style={{ color: getScoreColor(data.overview.matchScore) }}>
                                    {data.overview.matchScore}
                                </span></h3>
                                <p>{data.overview.detailedSummary}</p>
                            </div>
                            <div className="overview-charts">
                                <div className="chart-container">
                                    <h4>Skills Breakdown</h4>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="#e5e7eb" />
                                            <PolarAngleAxis dataKey="category" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                                            <Radar
                                                name="Your Resume"
                                                dataKey="value"
                                                stroke={getScoreColor(data.overview.matchScore)}
                                                fill={getScoreColor(data.overview.matchScore)}
                                                fillOpacity={0.3}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Highlights and Improvements */}
                        <div className="highlights-grid">
                            <div className="highlights-box success">
                                <h4>
                                    <CheckCircle size={20} />
                                    Highlights
                                </h4>
                                <ul>
                                    {data.overview.highlights.map((highlight, index) => (
                                        <li key={index}>
                                            <CheckCircle size={16} className="icon-success" />
                                            {highlight}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="highlights-box warning">
                                <h4>
                                    <AlertCircle size={20} />
                                    Improvements
                                </h4>
                                <ul>
                                    {data.overview.improvements.map((improvement, index) => (
                                        <li key={index}>
                                            <AlertCircle size={16} className="icon-warning" />
                                            {improvement}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Content Section */}
                    <div className="details-section">
                        <h2>
                            <Target size={24} />
                            Content
                        </h2>
                        <div className="detail-card">
                            <p className="section-description">
                                This section ensures your resume includes measurable results and is free from 
                                spelling and grammar errors. This helps your resume make a stronger impact and 
                                stand out to recruiters.
                            </p>

                            <div className="info-banner blue">
                                <TrendingUp size={20} />
                                <span>Almost there! Let's refine your content to make it more impactful and error-free.</span>
                            </div>

                            {/* Measurable Results */}
                            <div className="subsection">
                                <div className="subsection-header">
                                    <div className="subsection-title">
                                        <AlertCircle size={20} className="icon-warning" />
                                        <h4>Measurable Results</h4>
                                    </div>
                                    <span className="issue-badge">{data.content.measurableResults.issues} issues</span>
                                </div>
                                <p className="subsection-description">{data.content.measurableResults.description}</p>
                                <div className="suggestions-list">
                                    {data.content.measurableResults.suggestions.map((suggestion, index) => (
                                        <div key={index} className="suggestion-item">
                                            <div className="suggestion-icon warning">!</div>
                                            <p>{suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Spelling & Grammar */}
                            <div className="subsection">
                                <div className="subsection-header">
                                    <div className="subsection-title">
                                        <AlertCircle size={20} className="icon-warning" />
                                        <h4>Spelling & Grammar</h4>
                                    </div>
                                    <span className="issue-badge">{data.content.spellingGrammar.issues} issues</span>
                                </div>
                                <p className="subsection-description">{data.content.spellingGrammar.description}</p>
                                <div className="suggestions-list">
                                    {data.content.spellingGrammar.suggestions.map((suggestion, index) => (
                                        <div key={index} className="suggestion-item">
                                            <div className="suggestion-icon warning">!</div>
                                            <p>{suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="details-section">
                        <h2>
                            <Award size={24} />
                            Hard Skills
                        </h2>
                        <div className="detail-card">
                            {/* Skills Table - Cake Resume Style */}
                            <div className="skills-table">
                                {/* Table Header */}
                                <div className="skills-table-header">
                                    <div className="table-col col-skill">Skill</div>
                                    <div className="table-col col-jd">Job Description</div>
                                    <div className="table-col col-resume">Your Resume</div>
                                    <div className="table-col col-expand"></div>
                                </div>
                                
                                {/* Table Rows */}
                                {data.skills.hardSkills.map((skill, index) => (
                                    <div key={index} className={`skills-table-row ${skill.status} ${expandedSections[`skill-${index}`] ? 'expanded' : ''}`}>
                                        <div className="table-row-main" onClick={() => toggleSection(`skill-${index}`)}>
                                            <div className="table-col col-skill">
                                                <div className="skill-name-cell">
                                                    {skill.status === 'missing' ? (
                                                        <XCircle size={20} className="skill-icon-table error" />
                                                    ) : (
                                                        <CheckCircle size={20} className="skill-icon-table success" />
                                                    )}
                                                    <span className="skill-name-text">{skill.name}</span>
                                                    {skill.required && (
                                                        <span className="required-label">(required)</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="table-col col-jd">
                                                <span className="count-number">{skill.requiredCount}</span>
                                            </div>
                                            <div className="table-col col-resume">
                                                <span className="count-number">{skill.foundCount}</span>
                                            </div>
                                            <div className="table-col col-expand">
                                                {skill.jobDescriptionMentions && skill.jobDescriptionMentions.length > 0 && (
                                                    expandedSections[`skill-${index}`] ? (
                                                        <ChevronUp size={20} className="expand-icon" />
                                                    ) : (
                                                        <ChevronDown size={20} className="expand-icon" />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Expandable Content */}
                                        {expandedSections[`skill-${index}`] && skill.jobDescriptionMentions && skill.jobDescriptionMentions.length > 0 && (
                                            <div className="table-row-expanded">
                                                <div className="expanded-content">
                                                    <p className="expanded-title">Job Description mentions:</p>
                                                    <div className="expanded-list">
                                                        {skill.jobDescriptionMentions.map((mention, i) => (
                                                            <p key={i} className="expanded-item">• {mention}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Soft Skills */}
                            <div className="soft-skills">
                                <h3>
                                    <Award size={20} />
                                    Soft Skills
                                </h3>
                                <div className="skills-grid">
                                    {data.skills.softSkills.map((skill, index) => (
                                        <div key={index} className={`skill-badge ${skill.status}`}>
                                            {skill.status === 'missing' ? (
                                                <XCircle size={16} className="icon-error" />
                                            ) : (
                                                <CheckCircle size={16} className="icon-success" />
                                            )}
                                            <span className="skill-badge-name">{skill.name}</span>
                                            {skill.required && <span className="badge-required">Required</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CVJobMatcherResult;
