import React from "react";
import { Card, Button, Badge } from "antd";
import { useNavigate } from "react-router-dom";
import {
  DollarOutlined,
  VideoCameraOutlined,
  FireOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import "./NewFeatures.css";

const NewFeatures = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      title: "Career Roadmap",
      icon: <RocketOutlined />,
      description: "Lộ trình phát triển nghề nghiệp từ Junior đến Senior",
      color: "#667eea",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      path: "/career-roadmap",
      badge: "NEW",
      highlights: [
        "6 ngành nghề phổ biến",
        "Timeline interactive",
        "Track progress skills",
        "Tài liệu học tập",
      ],
    },
    {
      id: 2,
      title: "Career Quiz",
      icon: <FireOutlined />,
      description: "Khám phá nghề nghiệp phù hợp với tính cách của bạn",
      color: "#fa709a",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      path: "/career-quiz",
      badge: "HOT",
      highlights: [
        "12 câu hỏi vui",
        "6 loại kết quả",
        "Gợi ý nghề nghiệp",
        "Share lên social",
      ],
    },
    {
      id: 3,
      title: "Salary Calculator",
      icon: <DollarOutlined />,
      description: "Tính lương NET chính xác và so sánh mức lương với thị trường",
      color: "#4ecdc4",
      gradient: "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
      path: "/salary-calculator",
      badge: "NEW",
      highlights: [
        "Tính lương NET từ GROSS",
        "So sánh với thị trường",
        "Theo dõi 5+ ngành nghề",
        "Tips đàm phán lương",
      ],
    },
    {
      id: 4,
      title: "Video Profile",
      icon: <VideoCameraOutlined />,
      description: "Tạo video CV chuyên nghiệp trực tiếp từ webcam",
      color: "#f093fb",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      path: "/video-profile",
      badge: "NEW",
      highlights: [
        "Quay video 30-60s",
        "Record từ webcam",
        "Preview trước khi lưu",
        "Nổi bật hơn CV text",
      ],
    },
    {
      id: 5,
      title: "Job Swipe",
      icon: <ThunderboltOutlined />,
      description: "Tìm việc làm theo cách mới - Vui như chơi game!",
      color: "#ff6b6b",
      gradient: "linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)",
      path: "/job-swipe",
      badge: "TRENDING",
      highlights: [
        "Swipe như Tinder",
        "Gamification vui nhộn",
        "Match với công ty",
        "Addictive & Viral",
      ],
    },
  ];

  return (
    <div className="new-features-container">
      <div className="new-features-header">
        <div className="header-content">
          <RocketOutlined className="header-icon" />
          <h1>Tính Năng Mới</h1>
          <p>Khám phá những tính năng độc đáo giúp bạn tìm việc hiệu quả hơn</p>
        </div>
      </div>

      <div className="features-grid">
        {features.map((feature) => (
          <Card
            key={feature.id}
            className="feature-card"
            hoverable
            onClick={() => navigate(feature.path)}
          >
            <Badge.Ribbon
              text={feature.badge}
              color={
                feature.badge === "HOT"
                  ? "red"
                  : feature.badge === "NEW"
                  ? "blue"
                  : "orange"
              }
            >
              <div className="feature-card-content">
                <div
                  className="feature-icon"
                  style={{ background: feature.gradient }}
                >
                  {feature.icon}
                </div>

                <h2>{feature.title}</h2>
                <p className="feature-description">{feature.description}</p>

                <div className="feature-highlights">
                  {feature.highlights.map((highlight, index) => (
                    <div key={index} className="highlight-item">
                      <ThunderboltOutlined className="highlight-icon" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  style={{ background: feature.color, borderColor: feature.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(feature.path);
                  }}
                >
                  Trải nghiệm ngay
                </Button>
              </div>
            </Badge.Ribbon>
          </Card>
        ))}
      </div>

      <div className="coming-soon-section">
        <h2>🚀 Sắp ra mắt</h2>
        <div className="coming-soon-grid">
          <div className="coming-soon-item">
            <div className="coming-soon-icon">📝</div>
            <h3>Resume Builder AI</h3>
            <p>Tạo CV với AI</p>
          </div>
          <div className="coming-soon-item">
            <div className="coming-soon-icon">🎤</div>
            <h3>Interview Simulator</h3>
            <p>Luyện phỏng vấn với AI</p>
          </div>
          <div className="coming-soon-item">
            <div className="coming-soon-icon">⭐</div>
            <h3>Skill Endorsement</h3>
            <p>Xác nhận kỹ năng</p>
          </div>
          <div className="coming-soon-item">
            <div className="coming-soon-icon">🗺️</div>
            <h3>Job Map</h3>
            <p>Bản đồ việc làm</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Bạn có ý tưởng tính năng mới?</h2>
        <p>Hãy chia sẻ với chúng tôi để cải thiện trải nghiệm!</p>
        <Button type="primary" size="large">
          Gửi ý kiến
        </Button>
      </div>
    </div>
  );
};

export default NewFeatures;
