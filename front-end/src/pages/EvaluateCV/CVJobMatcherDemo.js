import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, TrendingUp, Award, Briefcase } from 'lucide-react';
import './CVJobMatcherDemo.css';

const CVJobMatcherDemo = () => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/cv-job-matcher');
    };

    return (
        <div className="cv-matcher-demo">
            <div className="demo-hero">
                <div className="demo-content">
                    <div className="demo-badge">
                        <span className="beta-badge">Beta</span>
                        <span>AI Resume Checker</span>
                    </div>
                    <h1>Secure Your Interview Chances With a Tailored Resume</h1>
                    <p className="hero-description">
                        Turn applications into interviews with personalized suggestions, ATS scoring and matching cover letters.
                    </p>
                    <button className="cta-button" onClick={handleNavigate}>
                        <TrendingUp size={20} />
                        Start Free Scan
                    </button>
                </div>
                <div className="demo-image">
                    <div className="demo-card">
                        <div className="card-header">
                            <FileText size={24} />
                            <span>Unity Mobile Game Developer</span>
                        </div>
                        <div className="score-display">
                            <div className="score-circle">
                                <svg viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                    <circle 
                                        cx="60" 
                                        cy="60" 
                                        r="50" 
                                        fill="none" 
                                        stroke="#f59e0b" 
                                        strokeWidth="8"
                                        strokeDasharray="176 314"
                                        strokeLinecap="round"
                                        transform="rotate(-90 60 60)"
                                    />
                                    <text x="60" y="63" textAnchor="middle" fontSize="28" fontWeight="700" fill="#1f2937">56</text>
                                    <text x="60" y="78" textAnchor="middle" fontSize="10" fontWeight="600" fill="#6b7280">Match Score</text>
                                </svg>
                            </div>
                            <div className="score-info">
                                <div className="info-item">
                                    <Award size={18} />
                                    <span>23 suggestions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="features-section">
                <h2>How It Works</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FileText size={32} />
                        </div>
                        <h3>Upload Your Resume</h3>
                        <p>Upload your CV in PDF, DOC, or DOCX format. All languages supported.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Briefcase size={32} />
                        </div>
                        <h3>Add Job Description</h3>
                        <p>Paste the job description you're interested in or search from our database.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <TrendingUp size={32} />
                        </div>
                        <h3>Get AI Analysis</h3>
                        <p>Receive detailed feedback with ATS score, skill matching, and improvement suggestions.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Award size={32} />
                        </div>
                        <h3>Improve & Apply</h3>
                        <p>Apply recommendations to boost your resume and increase interview chances.</p>
                    </div>
                </div>
            </div>

            <div className="cta-section">
                <h2>Ready to Boost Your Resume?</h2>
                <p>Start your free CV analysis now and increase your chances of landing an interview</p>
                <button className="cta-button large" onClick={handleNavigate}>
                    <TrendingUp size={24} />
                    Start Free Analysis
                </button>
            </div>
        </div>
    );
};

export default CVJobMatcherDemo;
