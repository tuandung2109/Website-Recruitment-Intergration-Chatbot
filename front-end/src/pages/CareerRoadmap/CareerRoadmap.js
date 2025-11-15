import React, { useState } from "react";
import { Card, Select, Button, Checkbox, Progress, Tag } from "antd";
import {
  MapIcon,
  TrendingUpIcon,
  BookOpenIcon,
  DollarSignIcon,
  ClockIcon,
  CheckCircle2Icon,
  CircleIcon,
} from "lucide-react";
import "./CareerRoadmap.css";

const { Option } = Select;

const CareerRoadmap = () => {
  const [selectedCareer, setSelectedCareer] = useState("frontend");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [checkedSkills, setCheckedSkills] = useState({});

  const careers = {
    frontend: {
      name: "Frontend Developer",
      icon: "💻",
      color: "#667eea",
      levels: [
        {
          title: "Junior Frontend Developer",
          duration: "0-2 năm",
          salary: "8-15 triệu",
          skills: [
            "HTML5 & CSS3",
            "JavaScript ES6+",
            "React hoặc Vue",
            "Git cơ bản",
            "Responsive Design",
            "REST API",
          ],
          resources: [
            "Udemy: The Complete Web Developer",
            "FreeCodeCamp: Responsive Web Design",
            "React Documentation",
          ],
          projects: [
            "Portfolio Website",
            "Todo App với React",
            "Weather App với API",
          ],
        },
        {
          title: "Mid-level Frontend Developer",
          duration: "2-4 năm",
          salary: "15-25 triệu",
          skills: [
            "TypeScript",
            "State Management (Redux/Zustand)",
            "Testing (Jest, React Testing Library)",
            "Build Tools (Webpack, Vite)",
            "Performance Optimization",
            "Git Advanced",
          ],
          resources: [
            "TypeScript Handbook",
            "Testing JavaScript by Kent C. Dodds",
            "Web Performance Optimization",
          ],
          projects: [
            "E-commerce Website",
            "Dashboard với Charts",
            "Real-time Chat App",
          ],
        },
        {
          title: "Senior Frontend Developer",
          duration: "4-7 năm",
          salary: "25-40 triệu",
          skills: [
            "System Architecture",
            "Code Review & Mentoring",
            "CI/CD",
            "Micro-frontends",
            "Accessibility (a11y)",
            "SEO Optimization",
          ],
          resources: [
            "Frontend Architecture for Design Systems",
            "Refactoring UI",
            "System Design Interview",
          ],
          projects: [
            "Design System",
            "Micro-frontend Architecture",
            "Open Source Contribution",
          ],
        },
        {
          title: "Tech Lead / Frontend Architect",
          duration: "7+ năm",
          salary: "40-70 triệu",
          skills: [
            "Technical Leadership",
            "System Design",
            "Team Management",
            "Strategic Planning",
            "Cross-team Collaboration",
            "Technical Documentation",
          ],
          resources: [
            "The Manager's Path",
            "Staff Engineer by Will Larson",
            "Building Microservices",
          ],
          projects: [
            "Lead Team Projects",
            "Technical Strategy",
            "Architecture Documentation",
          ],
        },
      ],
    },
    backend: {
      name: "Backend Developer",
      icon: "⚙️",
      color: "#4ecdc4",
      levels: [
        {
          title: "Junior Backend Developer",
          duration: "0-2 năm",
          salary: "10-18 triệu",
          skills: [
            "Python/Java/Node.js",
            "SQL Basics",
            "REST API Design",
            "Git",
            "Linux Commands",
            "HTTP Protocol",
          ],
          resources: [
            "Python for Everybody",
            "SQL Tutorial",
            "REST API Best Practices",
          ],
          projects: [
            "CRUD API",
            "Authentication System",
            "Blog Backend",
          ],
        },
        {
          title: "Mid-level Backend Developer",
          duration: "2-4 năm",
          salary: "18-30 triệu",
          skills: [
            "Database Design",
            "Caching (Redis)",
            "Message Queues",
            "Docker",
            "Testing",
            "Security Best Practices",
          ],
          resources: [
            "Designing Data-Intensive Applications",
            "Docker Mastery",
            "OWASP Security",
          ],
          projects: [
            "Microservices Architecture",
            "Real-time Notification System",
            "Payment Integration",
          ],
        },
        {
          title: "Senior Backend Developer",
          duration: "4-7 năm",
          salary: "30-50 triệu",
          skills: [
            "System Architecture",
            "Scalability",
            "Performance Tuning",
            "Kubernetes",
            "Monitoring & Logging",
            "Code Review",
          ],
          resources: [
            "System Design Interview",
            "Kubernetes in Action",
            "Site Reliability Engineering",
          ],
          projects: [
            "High-traffic System",
            "Distributed System",
            "Infrastructure as Code",
          ],
        },
        {
          title: "Backend Architect / Tech Lead",
          duration: "7+ năm",
          salary: "50-80 triệu",
          skills: [
            "Enterprise Architecture",
            "Technical Leadership",
            "Cloud Architecture (AWS/GCP)",
            "Team Management",
            "Strategic Planning",
            "Cost Optimization",
          ],
          resources: [
            "Software Architecture Patterns",
            "AWS Solutions Architect",
            "The Phoenix Project",
          ],
          projects: [
            "Cloud Migration",
            "System Redesign",
            "Technical Strategy",
          ],
        },
      ],
    },
    fullstack: {
      name: "Fullstack Developer",
      icon: "🚀",
      color: "#fa709a",
      levels: [
        {
          title: "Junior Fullstack Developer",
          duration: "0-2 năm",
          salary: "10-18 triệu",
          skills: ["HTML/CSS/JS", "React/Vue", "Node.js/Python", "SQL", "Git", "REST API"],
          resources: ["Full Stack Open", "The Odin Project", "MDN Web Docs"],
          projects: ["Blog Full Stack", "Todo App", "Portfolio Website"],
        },
        {
          title: "Mid-level Fullstack Developer",
          duration: "2-4 năm",
          salary: "18-30 triệu",
          skills: ["TypeScript", "State Management", "Database Design", "Docker", "Testing", "CI/CD"],
          resources: ["Fullstack React", "Node.js Design Patterns", "Docker Deep Dive"],
          projects: ["E-commerce Platform", "Social Network", "CMS System"],
        },
        {
          title: "Senior Fullstack Developer",
          duration: "4-7 năm",
          salary: "30-50 triệu",
          skills: ["System Architecture", "Microservices", "Cloud (AWS/GCP)", "Performance", "Security", "Mentoring"],
          resources: ["System Design Interview", "Clean Architecture", "Cloud Patterns"],
          projects: ["Scalable Platform", "Microservices App", "Real-time System"],
        },
        {
          title: "Fullstack Architect / Tech Lead",
          duration: "7+ năm",
          salary: "50-80 triệu",
          skills: ["Enterprise Architecture", "Technical Leadership", "DevOps", "Team Management", "Strategy", "Innovation"],
          resources: ["Software Architecture Patterns", "The Manager's Path", "Domain-Driven Design"],
          projects: ["Platform Architecture", "Technical Strategy", "Team Leadership"],
        },
      ],
    },
    mobile: {
      name: "Mobile Developer",
      icon: "📱",
      color: "#f093fb",
      levels: [
        {
          title: "Junior Mobile Developer",
          duration: "0-2 năm",
          salary: "9-16 triệu",
          skills: ["React Native/Flutter", "JavaScript/Dart", "Mobile UI/UX", "Git", "REST API", "State Management"],
          resources: ["React Native Docs", "Flutter Docs", "Mobile Design Patterns"],
          projects: ["Weather App", "News App", "Calculator App"],
        },
        {
          title: "Mid-level Mobile Developer",
          duration: "2-4 năm",
          salary: "16-28 triệu",
          skills: ["Native iOS/Android", "Performance", "Offline Storage", "Push Notifications", "Testing", "CI/CD"],
          resources: ["iOS Development", "Android Development", "Mobile Testing"],
          projects: ["Social Media App", "E-commerce App", "Fitness Tracker"],
        },
        {
          title: "Senior Mobile Developer",
          duration: "4-7 năm",
          salary: "28-45 triệu",
          skills: ["App Architecture", "Security", "Analytics", "App Store Optimization", "Code Review", "Mentoring"],
          resources: ["Mobile Architecture", "App Security", "Performance Tuning"],
          projects: ["Enterprise App", "Cross-platform Framework", "SDK Development"],
        },
        {
          title: "Mobile Architect / Lead",
          duration: "7+ năm",
          salary: "45-75 triệu",
          skills: ["Technical Leadership", "Platform Strategy", "Team Management", "Innovation", "Scalability", "DevOps"],
          resources: ["Mobile Leadership", "Platform Engineering", "Technical Strategy"],
          projects: ["Mobile Platform", "Team Leadership", "Technical Vision"],
        },
      ],
    },
    devops: {
      name: "DevOps Engineer",
      icon: "☁️",
      color: "#4ecdc4",
      levels: [
        {
          title: "Junior DevOps Engineer",
          duration: "0-2 năm",
          salary: "10-18 triệu",
          skills: ["Linux", "Git", "Docker", "CI/CD Basics", "Scripting (Bash/Python)", "Networking"],
          resources: ["Linux Academy", "Docker Mastery", "Git Tutorial"],
          projects: ["CI/CD Pipeline", "Docker Setup", "Automation Scripts"],
        },
        {
          title: "Mid-level DevOps Engineer",
          duration: "2-4 năm",
          salary: "18-32 triệu",
          skills: ["Kubernetes", "Terraform", "AWS/GCP/Azure", "Monitoring", "Security", "Database Admin"],
          resources: ["Kubernetes in Action", "Terraform Up & Running", "Cloud Certification"],
          projects: ["K8s Cluster", "Infrastructure as Code", "Monitoring System"],
        },
        {
          title: "Senior DevOps Engineer",
          duration: "4-7 năm",
          salary: "32-55 triệu",
          skills: ["Cloud Architecture", "High Availability", "Disaster Recovery", "Cost Optimization", "Automation", "Mentoring"],
          resources: ["Site Reliability Engineering", "Cloud Architecture", "DevOps Handbook"],
          projects: ["Multi-cloud Setup", "HA Architecture", "Cost Optimization"],
        },
        {
          title: "DevOps Architect / SRE Lead",
          duration: "7+ năm",
          salary: "55-90 triệu",
          skills: ["Platform Engineering", "Technical Leadership", "Strategy", "Team Management", "Innovation", "Enterprise Scale"],
          resources: ["Platform Engineering", "SRE Workbook", "Technical Leadership"],
          projects: ["Platform Strategy", "SRE Team", "Enterprise DevOps"],
        },
      ],
    },
    data: {
      name: "Data Scientist",
      icon: "📊",
      color: "#ff6b6b",
      levels: [
        {
          title: "Junior Data Scientist",
          duration: "0-2 năm",
          salary: "12-20 triệu",
          skills: ["Python", "SQL", "Statistics", "Pandas/NumPy", "Data Visualization", "Machine Learning Basics"],
          resources: ["Python for Data Analysis", "Statistics Course", "Kaggle Learn"],
          projects: ["Data Analysis", "Visualization Dashboard", "Simple ML Model"],
        },
        {
          title: "Mid-level Data Scientist",
          duration: "2-4 năm",
          salary: "20-35 triệu",
          skills: ["Advanced ML", "Deep Learning", "Feature Engineering", "Model Deployment", "Big Data", "A/B Testing"],
          resources: ["Deep Learning Specialization", "Hands-On ML", "Big Data Tools"],
          projects: ["Recommendation System", "NLP Project", "Computer Vision"],
        },
        {
          title: "Senior Data Scientist",
          duration: "4-7 năm",
          salary: "35-60 triệu",
          skills: ["ML Architecture", "Research", "MLOps", "Team Leadership", "Business Strategy", "Mentoring"],
          resources: ["ML System Design", "Research Papers", "MLOps"],
          projects: ["ML Platform", "Research Project", "Production ML System"],
        },
        {
          title: "Lead Data Scientist / ML Architect",
          duration: "7+ năm",
          salary: "60-100 triệu",
          skills: ["AI Strategy", "Technical Leadership", "Research Direction", "Team Management", "Innovation", "Enterprise AI"],
          resources: ["AI Strategy", "ML Leadership", "Enterprise ML"],
          projects: ["AI Strategy", "Research Team", "Enterprise ML Platform"],
        },
      ],
    },
  };

  const careerOptions = [
    { value: "frontend", label: "💻 Frontend Developer" },
    { value: "backend", label: "⚙️ Backend Developer" },
    { value: "fullstack", label: "🚀 Fullstack Developer" },
    { value: "mobile", label: "📱 Mobile Developer" },
    { value: "devops", label: "☁️ DevOps Engineer" },
    { value: "data", label: "📊 Data Scientist" },
  ];

  const currentCareer = careers[selectedCareer] || careers.frontend;
  const totalSkills = currentCareer.levels.reduce(
    (sum, level) => sum + level.skills.length,
    0
  );
  const checkedCount = Object.values(checkedSkills).filter(Boolean).length;
  const progressPercent = (checkedCount / totalSkills) * 100;

  const handleSkillCheck = (levelIndex, skillIndex) => {
    const key = `${levelIndex}-${skillIndex}`;
    setCheckedSkills({
      ...checkedSkills,
      [key]: !checkedSkills[key],
    });
  };

  return (
    <div className="career-roadmap-container">
      <div className="roadmap-header">
        <h1>
          <MapIcon className="header-icon" /> Career Path Roadmap
        </h1>
        <p>Lộ trình phát triển nghề nghiệp của bạn</p>
      </div>

      <Card className="roadmap-controls">
        <div className="controls-row">
          <div className="control-group">
            <label>Chọn ngành nghề:</label>
            <Select
              size="large"
              value={selectedCareer}
              onChange={setSelectedCareer}
              style={{ width: 300 }}
            >
              {careerOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>

          <div className="control-group">
            <label>Vị trí hiện tại:</label>
            <Select
              size="large"
              value={currentLevel}
              onChange={setCurrentLevel}
              style={{ width: 300 }}
            >
              {currentCareer.levels.map((level, index) => (
                <Option key={index} value={index}>
                  {level.title}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <span>Tiến độ học tập</span>
            <span className="progress-count">
              {checkedCount} / {totalSkills} skills
            </span>
          </div>
          <Progress
            percent={progressPercent}
            strokeColor={{
              "0%": currentCareer.color,
              "100%": "#52c41a",
            }}
          />
        </div>
      </Card>

      <div className="roadmap-timeline">
        {currentCareer.levels.map((level, levelIndex) => {
          const isCurrentLevel = levelIndex === currentLevel;
          const isPassed = levelIndex < currentLevel;
          const isFuture = levelIndex > currentLevel;

          return (
            <div
              key={levelIndex}
              className={`timeline-item ${
                isCurrentLevel ? "current" : isPassed ? "passed" : "future"
              }`}
            >
              <div className="timeline-marker">
                <div
                  className="marker-circle"
                  style={{
                    background: isCurrentLevel
                      ? currentCareer.color
                      : isPassed
                      ? "#52c41a"
                      : "#d9d9d9",
                  }}
                >
                  {isPassed ? (
                    <CheckCircle2Icon size={24} />
                  ) : (
                    <CircleIcon size={24} />
                  )}
                </div>
                {levelIndex < currentCareer.levels.length - 1 && (
                  <div
                    className="marker-line"
                    style={{
                      background: isPassed ? "#52c41a" : "#d9d9d9",
                    }}
                  />
                )}
              </div>

              <Card
                className="timeline-card"
                style={{
                  borderColor: isCurrentLevel ? currentCareer.color : "#d9d9d9",
                }}
              >
                {isCurrentLevel && (
                  <Tag color={currentCareer.color} className="current-badge">
                    BẠN Ở ĐÂY
                  </Tag>
                )}

                <h2 className="level-title">{level.title}</h2>

                <div className="level-meta">
                  <div className="meta-item">
                    <ClockIcon size={16} />
                    <span>{level.duration}</span>
                  </div>
                  <div className="meta-item">
                    <DollarSignIcon size={16} />
                    <span>{level.salary}</span>
                  </div>
                </div>

                <div className="level-section">
                  <h3>
                    <TrendingUpIcon size={18} /> Kỹ năng cần có
                  </h3>
                  <div className="skills-list">
                    {level.skills.map((skill, skillIndex) => {
                      const key = `${levelIndex}-${skillIndex}`;
                      const isChecked = checkedSkills[key];
                      return (
                        <div key={skillIndex} className="skill-item">
                          <Checkbox
                            checked={isChecked}
                            onChange={() =>
                              handleSkillCheck(levelIndex, skillIndex)
                            }
                          >
                            <span
                              className={isChecked ? "skill-checked" : ""}
                            >
                              {skill}
                            </span>
                          </Checkbox>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="level-section">
                  <h3>
                    <BookOpenIcon size={18} /> Tài liệu học tập
                  </h3>
                  <ul className="resources-list">
                    {level.resources.map((resource, index) => (
                      <li key={index}>{resource}</li>
                    ))}
                  </ul>
                </div>

                <div className="level-section">
                  <h3>💼 Dự án nên làm</h3>
                  <ul className="projects-list">
                    {level.projects.map((project, index) => (
                      <li key={index}>{project}</li>
                    ))}
                  </ul>
                </div>

                {!isFuture && (
                  <Button
                    type="primary"
                    size="large"
                    block
                    style={{ background: currentCareer.color }}
                  >
                    {isCurrentLevel
                      ? "Bắt đầu học ngay"
                      : "Xem lại kiến thức"}
                  </Button>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CareerRoadmap;
