import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    AlertTriangle,
    Lightbulb,
    Briefcase,
    BarChart3,
    FileText
} from 'lucide-react';
import { getAgentFilters } from '../../controller/agentController';
import jsPDF from 'jspdf';
import './EvaluateCV.css';

const EvaluateCV = () => {
    // State để lưu dữ liệu đánh giá CV
    const [cvEvaluation, setCvEvaluation] = useState({
        summary: "",
        scores: {
            clarity: 0,
            relevance: 0,
            skills: 0,
            projects: 0,
            professionalism: 0,
            overall: 0
        },
        strengths: [],
        weaknesses: [],
        recommendations: [],
        suggested_job_roles: []
    });

    const [isLoading, setIsLoading] = useState(true);
    const [hasData, setHasData] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Lấy dữ liệu từ agent filters khi component mount
    useEffect(() => {
        const agentFilters = getAgentFilters();

        if (agentFilters) {
            console.log("🤖 CV Evaluation data detected:", agentFilters);
            
            // Cập nhật state với dữ liệu mới
            setCvEvaluation({
                summary: agentFilters.summary || "",
                scores: {
                    clarity: agentFilters.scores?.clarity || 0,
                    relevance: agentFilters.scores?.relevance || 0,
                    skills: agentFilters.scores?.skills || 0,
                    projects: agentFilters.scores?.projects || 0,
                    professionalism: agentFilters.scores?.professionalism || 0,
                    overall: agentFilters.scores?.overall || 0
                },
                strengths: agentFilters.strengths || [],
                weaknesses: agentFilters.weaknesses || [],
                recommendations: agentFilters.recommendations || [],
                suggested_job_roles: agentFilters.suggested_job_roles || []
            });
            
            setHasData(true);
            setIsLoading(false);
        } else {
            console.log("ℹ️ No CV evaluation data found");
            setIsLoading(false);
        }

        // Lắng nghe custom event từ agent navigation
        const handleAgentNavigation = (event) => {
            if (event.detail?.filters) {
                console.log("🔄 Received new CV evaluation data:", event.detail.filters);
                const filters = event.detail.filters;
                
                setCvEvaluation({
                    summary: filters.summary || "",
                    scores: {
                        clarity: filters.scores?.clarity || 0,
                        relevance: filters.scores?.relevance || 0,
                        skills: filters.scores?.skills || 0,
                        projects: filters.scores?.projects || 0,
                        professionalism: filters.scores?.professionalism || 0,
                        overall: filters.scores?.overall || 0
                    },
                    strengths: filters.strengths || [],
                    weaknesses: filters.weaknesses || [],
                    recommendations: filters.recommendations || [],
                    suggested_job_roles: filters.suggested_job_roles || []
                });
                
                setHasData(true);
                setIsLoading(false);
            }
        };

        window.addEventListener('agentNavigation', handleAgentNavigation);

        return () => {
            window.removeEventListener('agentNavigation', handleAgentNavigation);
        };
    }, []);

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

    // Hàm xuất PDF - Tạo PDF trực tiếp từ dữ liệu thay vì HTML
    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        
        try {
            // Tạo PDF với kích thước A4
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = 210;
            const margin = 15;
            const contentWidth = pageWidth - (margin * 2);
            let yPosition = margin;
            const lineHeight = 7;
            const titleSize = 20;
            const headingSize = 14;
            const textSize = 10;

            // Helper function để thêm text với word wrap
            const addText = (text, fontSize, isBold = false, color = [0, 0, 0]) => {
                pdf.setFontSize(fontSize);
                pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
                pdf.setTextColor(...color);
                
                const lines = pdf.splitTextToSize(text, contentWidth);
                lines.forEach(line => {
                    if (yPosition > 280) {
                        pdf.addPage();
                        yPosition = margin;
                    }
                    pdf.text(line, margin, yPosition);
                    yPosition += lineHeight;
                });
            };

            // Helper function để vẽ thanh điểm
            const drawScoreBar = (label, score, yPos) => {
                const barWidth = 60;
                const barHeight = 6;
                const barX = pageWidth - margin - barWidth - 15;
                
                pdf.setFontSize(textSize);
                pdf.setFont('helvetica', 'normal');
                pdf.text(label, margin, yPos);
                
                // Vẽ background bar
                pdf.setFillColor(230, 230, 230);
                pdf.rect(barX, yPos - 4, barWidth, barHeight, 'F');
                
                // Vẽ filled bar với màu dựa trên điểm
                let color;
                if (score >= 8) color = [34, 197, 94]; // green
                else if (score >= 6) color = [59, 130, 246]; // blue
                else if (score >= 4) color = [251, 191, 36]; // yellow
                else color = [239, 68, 68]; // red
                
                pdf.setFillColor(...color);
                pdf.rect(barX, yPos - 4, (barWidth * score) / 10, barHeight, 'F');
                
                // Hiển thị điểm số
                pdf.text(`${score}/10`, barX + barWidth + 3, yPos);
                
                return yPos + 10;
            };

            // Header
            pdf.setFillColor(59, 130, 246);
            pdf.rect(0, 0, pageWidth, 40, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(titleSize);
            pdf.setFont('helvetica', 'bold');
            pdf.text('BÁO CÁO ĐÁNH GIÁ CV', margin, 20);
            pdf.setFontSize(textSize);
            pdf.text('Phân tích chi tiết và đề xuất cải thiện', margin, 30);
            
            yPosition = 55;

            // Overall Score
            pdf.setFillColor(245, 247, 250);
            pdf.rect(margin, yPosition - 5, contentWidth, 35, 'F');
            
            pdf.setFontSize(headingSize);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Điểm Tổng Quan', margin + 5, yPosition + 5);
            
            // Vẽ điểm số tròn
            const scoreX = pageWidth - margin - 20;
            const scoreY = yPosition + 10;
            pdf.setFillColor(59, 130, 246);
            pdf.circle(scoreX, scoreY, 12, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(18);
            pdf.text(`${cvEvaluation.scores.overall}`, scoreX - 6, scoreY + 2);
            pdf.setFontSize(10);
            pdf.text('/10', scoreX - 4, scoreY + 8);
            
            pdf.setFontSize(textSize);
            pdf.setTextColor(100, 100, 100);
            const summaryLines = pdf.splitTextToSize(cvEvaluation.summary, contentWidth - 40);
            let summaryY = yPosition + 5;
            summaryLines.forEach(line => {
                pdf.text(line, margin + 5, summaryY + 10);
                summaryY += 5;
            });
            
            yPosition += 45;

            // Detailed Scores
            yPosition += 5;
            pdf.setFontSize(headingSize);
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Chi Tiết Điểm Số', margin, yPosition);
            yPosition += 10;
            
            yPosition = drawScoreBar('Độ rõ ràng:', cvEvaluation.scores.clarity, yPosition);
            yPosition = drawScoreBar('Mức độ liên quan:', cvEvaluation.scores.relevance, yPosition);
            yPosition = drawScoreBar('Kỹ năng:', cvEvaluation.scores.skills, yPosition);
            yPosition = drawScoreBar('Dự án:', cvEvaluation.scores.projects, yPosition);
            yPosition = drawScoreBar('Tính chuyên nghiệp:', cvEvaluation.scores.professionalism, yPosition);

            // Strengths
            yPosition += 10;
            pdf.setFillColor(34, 197, 94);
            pdf.rect(margin, yPosition - 5, contentWidth, 8, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(headingSize);
            pdf.setFont('helvetica', 'bold');
            pdf.text('✓ Điểm Mạnh', margin + 3, yPosition);
            yPosition += 10;
            
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(textSize);
            pdf.setFont('helvetica', 'normal');
            cvEvaluation.strengths.forEach((strength, index) => {
                if (yPosition > 270) {
                    pdf.addPage();
                    yPosition = margin;
                }
                const lines = pdf.splitTextToSize(`• ${strength}`, contentWidth - 5);
                lines.forEach(line => {
                    pdf.text(line, margin + 3, yPosition);
                    yPosition += 6;
                });
            });

            // Weaknesses
            yPosition += 5;
            if (yPosition > 250) {
                pdf.addPage();
                yPosition = margin;
            }
            pdf.setFillColor(251, 191, 36);
            pdf.rect(margin, yPosition - 5, contentWidth, 8, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(headingSize);
            pdf.setFont('helvetica', 'bold');
            pdf.text('⚠ Điểm Cần Cải Thiện', margin + 3, yPosition);
            yPosition += 10;
            
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(textSize);
            pdf.setFont('helvetica', 'normal');
            cvEvaluation.weaknesses.forEach((weakness) => {
                if (yPosition > 270) {
                    pdf.addPage();
                    yPosition = margin;
                }
                const lines = pdf.splitTextToSize(`• ${weakness}`, contentWidth - 5);
                lines.forEach(line => {
                    pdf.text(line, margin + 3, yPosition);
                    yPosition += 6;
                });
            });

            // Recommendations
            yPosition += 5;
            if (yPosition > 250) {
                pdf.addPage();
                yPosition = margin;
            }
            pdf.setFillColor(59, 130, 246);
            pdf.rect(margin, yPosition - 5, contentWidth, 8, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(headingSize);
            pdf.setFont('helvetica', 'bold');
            pdf.text('💡 Đề Xuất Cải Thiện', margin + 3, yPosition);
            yPosition += 10;
            
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(textSize);
            pdf.setFont('helvetica', 'normal');
            cvEvaluation.recommendations.forEach((recommendation) => {
                if (yPosition > 270) {
                    pdf.addPage();
                    yPosition = margin;
                }
                const lines = pdf.splitTextToSize(`• ${recommendation}`, contentWidth - 5);
                lines.forEach(line => {
                    pdf.text(line, margin + 3, yPosition);
                    yPosition += 6;
                });
            });

            // Suggested Job Roles
            yPosition += 5;
            if (yPosition > 250) {
                pdf.addPage();
                yPosition = margin;
            }
            pdf.setFillColor(139, 92, 246);
            pdf.rect(margin, yPosition - 5, contentWidth, 8, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(headingSize);
            pdf.setFont('helvetica', 'bold');
            pdf.text('💼 Vị Trí Công Việc Phù Hợp', margin + 3, yPosition);
            yPosition += 10;
            
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(textSize);
            pdf.setFont('helvetica', 'normal');
            cvEvaluation.suggested_job_roles.forEach((role) => {
                if (yPosition > 270) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(`• ${role}`, margin + 3, yPosition);
                yPosition += 7;
            });

            // Footer
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.text(
                    `Trang ${i} / ${totalPages} - Tạo ngày ${new Date().toLocaleDateString('vi-VN')}`,
                    pageWidth / 2,
                    290,
                    { align: 'center' }
                );
            }

            // Tạo tên file với timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `Bao_Cao_Danh_Gia_CV_${timestamp}.pdf`;

            // Lưu file PDF
            pdf.save(fileName);
            
            console.log('✅ PDF đã được tạo thành công:', fileName);
        } catch (error) {
            console.error('❌ Lỗi khi tạo PDF:', error);
            alert('Có lỗi xảy ra khi tạo file PDF. Vui lòng thử lại.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div className="evaluate-cv-container">
            <div className="evaluate-cv-header">
                <FileText className="header-icon" />
                <h1>Đánh Giá CV</h1>
                <p>Phân tích chi tiết và đề xuất cải thiện</p>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Đang tải dữ liệu đánh giá...</p>
                </div>
            )}

            {/* No Data State */}
            {!isLoading && !hasData && (
                <div className="no-data-container">
                    <FileText className="no-data-icon" />
                    <h3>Chưa có dữ liệu đánh giá CV</h3>
                    <p>Vui lòng upload CV của bạn thông qua chatbot để nhận đánh giá chi tiết</p>
                    <button className="btn-primary" onClick={() => window.location.href = '/'}>
                        Về trang chủ
                    </button>
                </div>
            )}

            {/* Data Display */}
            {!isLoading && hasData && (
                <>
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
                        <button 
                            className="btn-primary" 
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPDF}
                        >
                            {isGeneratingPDF ? 'Đang tạo PDF...' : 'Tải Xuống Báo Cáo PDF'}
                        </button>
                        <button className="btn-secondary" onClick={() => window.location.href = '/'}>
                            Đánh Giá CV Khác
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default EvaluateCV;
