import React, { useState, useRef, useEffect } from "react";
import { Card, Button, Tag, Progress, Modal, message } from "antd";
import {
  HeartOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TrophyOutlined,
  EyeOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import "./JobSwipe.css";

const JobSwipe = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedJobs, setLikedJobs] = useState([]);
  const [passedJobs, setPassedJobs] = useState([]);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showMatch, setShowMatch] = useState(false);
  const [stats, setStats] = useState({ likes: 0, passes: 0, matches: 0 });
  const [showLikedModal, setShowLikedModal] = useState(false);
  
  const cardRef = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  // Mock data - Thay bằng API thực tế
  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechViet Solutions",
      logo: "🚀",
      location: "Hà Nội",
      salary: "25-35 triệu",
      type: "Full-time",
      skills: ["React", "TypeScript", "Node.js"],
      description: "Tìm kiếm Senior Frontend Developer có kinh nghiệm với React và TypeScript",
      matchScore: 95,
    },
    {
      id: 2,
      title: "UI/UX Designer",
      company: "Creative Studio",
      logo: "🎨",
      location: "TP.HCM",
      salary: "20-30 triệu",
      type: "Full-time",
      skills: ["Figma", "Adobe XD", "Sketch"],
      description: "Thiết kế giao diện đẹp mắt và trải nghiệm người dùng tuyệt vời",
      matchScore: 88,
    },
    {
      id: 3,
      title: "Backend Developer",
      company: "DataTech Corp",
      logo: "💻",
      location: "Đà Nẵng",
      salary: "22-32 triệu",
      type: "Full-time",
      skills: ["Java", "Spring Boot", "MySQL"],
      description: "Phát triển hệ thống backend mạnh mẽ và scalable",
      matchScore: 92,
    },
    {
      id: 4,
      title: "Marketing Manager",
      company: "Growth Agency",
      logo: "📢",
      location: "Hà Nội",
      salary: "30-40 triệu",
      type: "Full-time",
      skills: ["SEO", "Google Ads", "Content Marketing"],
      description: "Quản lý chiến dịch marketing và tăng trưởng doanh số",
      matchScore: 85,
    },
    {
      id: 5,
      title: "Product Manager",
      company: "Startup Hub",
      logo: "🎯",
      location: "TP.HCM",
      salary: "35-50 triệu",
      type: "Full-time",
      skills: ["Product Strategy", "Agile", "Data Analysis"],
      description: "Định hướng sản phẩm và làm việc với đội ngũ đa chức năng",
      matchScore: 90,
    },
    {
      id: 6,
      title: "DevOps Engineer",
      company: "Cloud Systems",
      logo: "☁️",
      location: "Remote",
      salary: "28-38 triệu",
      type: "Remote",
      skills: ["AWS", "Docker", "Kubernetes"],
      description: "Xây dựng và duy trì hạ tầng cloud hiện đại",
      matchScore: 87,
    },
    {
      id: 7,
      title: "Data Scientist",
      company: "AI Labs",
      logo: "🤖",
      location: "Hà Nội",
      salary: "30-45 triệu",
      type: "Full-time",
      skills: ["Python", "Machine Learning", "TensorFlow"],
      description: "Phân tích dữ liệu và xây dựng mô hình AI",
      matchScore: 93,
    },
    {
      id: 8,
      title: "Mobile Developer",
      company: "App Studio",
      logo: "📱",
      location: "TP.HCM",
      salary: "24-34 triệu",
      type: "Full-time",
      skills: ["React Native", "Flutter", "iOS/Android"],
      description: "Phát triển ứng dụng mobile đa nền tảng",
      matchScore: 89,
    },
  ];

  const currentJob = jobs[currentIndex];
  const isFinished = currentIndex >= jobs.length;

  // Touch/Mouse handlers
  const handleStart = (clientX) => {
    startX.current = clientX;
    currentX.current = clientX;
  };

  const handleMove = (clientX) => {
    if (!cardRef.current) return;
    currentX.current = clientX;
    const diff = currentX.current - startX.current;
    const rotation = diff / 20;
    
    cardRef.current.style.transform = `translateX(${diff}px) rotate(${rotation}deg)`;
    
    if (diff > 50) {
      setSwipeDirection("right");
    } else if (diff < -50) {
      setSwipeDirection("left");
    } else {
      setSwipeDirection(null);
    }
  };

  const handleEnd = () => {
    if (!cardRef.current) return;
    const diff = currentX.current - startX.current;
    
    if (diff > 100) {
      handleLike();
    } else if (diff < -100) {
      handlePass();
    } else {
      cardRef.current.style.transform = "";
      setSwipeDirection(null);
    }
  };

  const handleLike = () => {
    if (!currentJob) return;
    
    if (cardRef.current) {
      cardRef.current.style.transform = "translateX(1000px) rotate(30deg)";
    }
    
    setTimeout(() => {
      setLikedJobs([...likedJobs, currentJob]);
      setStats({ ...stats, likes: stats.likes + 1, matches: stats.matches + (Math.random() > 0.7 ? 1 : 0) });
      
      if (Math.random() > 0.7) {
        setShowMatch(true);
        setTimeout(() => setShowMatch(false), 2000);
      }
      
      setCurrentIndex(currentIndex + 1);
      setSwipeDirection(null);
      if (cardRef.current) {
        cardRef.current.style.transform = "";
      }
    }, 300);
  };

  const handlePass = () => {
    if (!currentJob) return;
    
    if (cardRef.current) {
      cardRef.current.style.transform = "translateX(-1000px) rotate(-30deg)";
    }
    
    setTimeout(() => {
      setPassedJobs([...passedJobs, currentJob]);
      setStats({ ...stats, passes: stats.passes + 1 });
      setCurrentIndex(currentIndex + 1);
      setSwipeDirection(null);
      if (cardRef.current) {
        cardRef.current.style.transform = "";
      }
    }, 300);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setLikedJobs([]);
    setPassedJobs([]);
    setStats({ likes: 0, passes: 0, matches: 0 });
  };

  if (isFinished) {
    return (
      <div className="job-swipe-container">
        <div className="job-swipe-header">
          <h1>
            <FireOutlined /> Job Swipe
          </h1>
          <p>Tìm việc làm theo cách mới - Vui như chơi game!</p>
        </div>

        <div className="finished-screen">
          <Card className="finished-card">
            <div className="finished-content">
              <TrophyOutlined className="trophy-icon" />
              <h2>Hoàn thành! 🎉</h2>
              <p>Bạn đã xem hết tất cả công việc</p>
              
              <div className="final-stats">
                <div className="stat-item">
                  <HeartOutlined className="stat-icon like" />
                  <div className="stat-value">{stats.likes}</div>
                  <div className="stat-label">Đã thích</div>
                </div>
                <div className="stat-item">
                  <CloseOutlined className="stat-icon pass" />
                  <div className="stat-value">{stats.passes}</div>
                  <div className="stat-label">Đã bỏ qua</div>
                </div>
                <div className="stat-item">
                  <FireOutlined className="stat-icon match" />
                  <div className="stat-value">{stats.matches}</div>
                  <div className="stat-label">Match</div>
                </div>
              </div>

              <div className="finished-actions">
                <Button
                  type="primary"
                  size="large"
                  icon={<EyeOutlined />}
                  onClick={() => setShowLikedModal(true)}
                >
                  Xem việc đã thích ({likedJobs.length})
                </Button>
                <Button
                  size="large"
                  icon={<RedoOutlined />}
                  onClick={handleRestart}
                >
                  Chơi lại
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <LikedJobsModal
          visible={showLikedModal}
          jobs={likedJobs}
          onClose={() => setShowLikedModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="job-swipe-container">
      <div className="job-swipe-header">
        <h1>
          <FireOutlined /> Job Swipe
        </h1>
        <p>Vuốt phải nếu thích, vuốt trái nếu bỏ qua</p>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-badge">
          <HeartOutlined /> {stats.likes}
        </div>
        <div className="stat-badge">
          <FireOutlined /> {stats.matches}
        </div>
        <div className="stat-badge">
          <CloseOutlined /> {stats.passes}
        </div>
      </div>

      {/* Progress */}
      <div className="progress-container">
        <Progress
          percent={((currentIndex + 1) / jobs.length) * 100}
          showInfo={false}
          strokeColor="#667eea"
        />
        <span className="progress-text">
          {currentIndex + 1} / {jobs.length}
        </span>
      </div>

      {/* Swipe Area */}
      <div className="swipe-area">
        {currentJob && (
          <div
            ref={cardRef}
            className={`job-card ${swipeDirection ? `swipe-${swipeDirection}` : ""}`}
            onMouseDown={(e) => handleStart(e.clientX)}
            onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
            onTouchEnd={handleEnd}
          >
            <div className="match-badge">
              <FireOutlined /> {currentJob.matchScore}% Match
            </div>

            <div className="job-card-header">
              <div className="company-logo">{currentJob.logo}</div>
              <div className="job-title-section">
                <h2>{currentJob.title}</h2>
                <h3>{currentJob.company}</h3>
              </div>
            </div>

            <div className="job-card-body">
              <div className="job-info-row">
                <EnvironmentOutlined /> {currentJob.location}
              </div>
              <div className="job-info-row">
                <DollarOutlined /> {currentJob.salary}
              </div>
              <div className="job-info-row">
                <ClockCircleOutlined /> {currentJob.type}
              </div>

              <div className="job-skills">
                {currentJob.skills.map((skill, index) => (
                  <Tag key={index} color="blue">
                    {skill}
                  </Tag>
                ))}
              </div>

              <p className="job-description">{currentJob.description}</p>
            </div>

            {swipeDirection === "right" && (
              <div className="swipe-overlay like">
                <HeartOutlined /> THÍCH
              </div>
            )}
            {swipeDirection === "left" && (
              <div className="swipe-overlay pass">
                <CloseOutlined /> BỎ QUA
              </div>
            )}
          </div>
        )}

        {/* Next card preview */}
        {jobs[currentIndex + 1] && (
          <div className="job-card next-card">
            <div className="company-logo">{jobs[currentIndex + 1].logo}</div>
            <h3>{jobs[currentIndex + 1].title}</h3>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <Button
          className="action-btn pass-btn"
          shape="circle"
          size="large"
          icon={<CloseOutlined />}
          onClick={handlePass}
        />
        <Button
          className="action-btn like-btn"
          shape="circle"
          size="large"
          icon={<HeartOutlined />}
          onClick={handleLike}
        />
      </div>

      {/* Match Animation */}
      {showMatch && (
        <div className="match-animation">
          <div className="match-content">
            <FireOutlined className="match-icon" />
            <h2>It's a Match! 🎉</h2>
            <p>Công ty đã xem profile của bạn!</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Liked Jobs Modal Component
const LikedJobsModal = ({ visible, jobs, onClose }) => {
  return (
    <Modal
      title={`Việc làm đã thích (${jobs.length})`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={700}
    >
      <div className="liked-jobs-list">
        {jobs.map((job) => (
          <Card key={job.id} className="liked-job-card" hoverable>
            <div className="liked-job-content">
              <div className="company-logo-small">{job.logo}</div>
              <div className="liked-job-info">
                <h4>{job.title}</h4>
                <p>{job.company}</p>
                <div className="liked-job-meta">
                  <span>
                    <EnvironmentOutlined /> {job.location}
                  </span>
                  <span>
                    <DollarOutlined /> {job.salary}
                  </span>
                </div>
              </div>
              <Button type="primary">Ứng tuyển</Button>
            </div>
          </Card>
        ))}
      </div>
    </Modal>
  );
};

export default JobSwipe;
