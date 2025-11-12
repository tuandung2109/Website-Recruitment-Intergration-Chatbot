// Mock data for CV evaluation based on job description
export const mockEvaluationData = {
    jobInfo: {
        title: "Unity Mobile Game Developer",
        company: "Game Studio XYZ"
    },
    overview: {
        matchScore: 56,
        totalIssues: 23,
        summary: "Your resume shows strong programming and AI skills with relevant internship experience. However, it lacks the 3+ years Unity mobile game development expertise this role demands.",
        detailedSummary: "Your resume shows strong programming skills including C# used in Unity and good AI/ML project experience showing technical depth. However, it lacks detailed Unity game projects to demonstrate mobile game dev skills, teamwork collaboration experiences, and English technical reading proficiency needed for this international market role.",
        categories: {
            content: {
                name: "Content",
                score: 85,
                issues: 2
            },
            skills: {
                name: "Skills",
                score: 45,
                issues: 9
            },
            format: {
                name: "Format",
                score: 75,
                issues: 4
            },
            sections: {
                name: "Sections",
                score: 60,
                issues: 1
            },
            style: {
                name: "Style",
                score: 65,
                issues: 7
            }
        },
        highlights: [
            "Experience with Unity development through internship role",
            "Strong programming skills including C# used in Unity",
            "Good AI/ML project experience showing technical depth"
        ],
        improvements: [
            "Add detailed Unity game projects to demonstrate mobile game dev skills",
            "Highlight teamwork and collaboration experiences explicitly",
            "Address English technical reading proficiency and game market passion"
        ]
    },
    content: {
        measurableResults: {
            issues: 3,
            description: "Add specific, measurable achievements to highlight the impact of your work.",
            suggestions: [
                "Add measurable results such as system uptime improvements or performance metrics to demonstrate the impact of your work.",
                "Provide more context on collaboration with cross-functional teams, especially with frontend developers or product managers.",
                "Add quantifiable results such as scalability improvements, performance optimizations, or user satisfaction metrics."
            ]
        },
        spellingGrammar: {
            issues: 5,
            description: "Check for spelling and grammar errors to ensure professionalism.",
            suggestions: [
                "Consider using 'Kiến thúc cấu trúc dữ liệu' -> 'Kiến thức cấu trúc dữ liệu' for correct spelling",
                "Review technical terms for consistency: 'Thuật toán' appears multiple times",
                "Check grammar in project descriptions for clarity"
            ]
        }
    },
    skills: {
        hardSkills: [
            {
                name: "Phát triển Mobile Game",
                required: true,
                requiredCount: 3,
                foundCount: 0,
                status: "missing",
                jobDescriptionMentions: [
                    "Sử dụng Unity để phát triển sản phẩm Mobile Game, phát hành thị trường quốc tế trên nền tảng Google Play, Apple Store",
                    "Phát hành sản phẩm Mobile Game trên nền tảng Google Play, Apple Store cho thị trường quốc tế",
                    "Điều chỉnh Game sao cho phù hợp với thị trường quốc tế..."
                ]
            },
            {
                name: "Google Play",
                required: true,
                requiredCount: 2,
                foundCount: 0,
                status: "missing",
                jobDescriptionMentions: [
                    "Sử dụng Unity để phát triển sản phẩm Mobile Game, phát hành thị trường quốc tế trên nền tảng Google Play, Apple Store",
                    "Phát hành sản phẩm Mobile Game trên nền tảng Google Play, Apple Store cho thị trường quốc tế"
                ]
            },
            {
                name: "Apple Store",
                required: true,
                requiredCount: 2,
                foundCount: 0,
                status: "missing",
                jobDescriptionMentions: [
                    "Sử dụng Unity để phát triển sản phẩm Mobile Game, phát hành thị trường quốc tế trên nền tảng Google Play, Apple Store",
                    "Phát hành sản phẩm Mobile Game trên nền tảng Google Play, Apple Store cho thị trường quốc tế"
                ]
            },
            {
                name: "Kiến thúc cấu trúc dữ liệu",
                required: true,
                requiredCount: 1,
                foundCount: 0,
                status: "missing",
                jobDescriptionMentions: [
                    "Thành thạo lý, Thạm tích tượng... cùng các kiến thức liên quan về Hệ điều hành, Cơ sở dữ liệu,..."
                ]
            },
            {
                name: "Thuật toán",
                required: true,
                requiredCount: 1,
                foundCount: 0,
                status: "missing",
                jobDescriptionMentions: [
                    "Có kiến thức tốt về lập trình hướng đối tượng và design patterns"
                ]
            },
            {
                name: "Unity",
                required: true,
                requiredCount: 3,
                foundCount: 2,
                status: "found",
                jobDescriptionMentions: [
                    "Có ít nhất 3 năm kinh nghiệm phát triển game mobile bằng Unity",
                    "Thành thạo C#, có kinh nghiệm với Unity Engine"
                ]
            },
            {
                name: "Lập trình hướng đối tượng",
                required: true,
                requiredCount: 1,
                foundCount: 1,
                status: "found",
                jobDescriptionMentions: [
                    "Có kiến thức tốt về lập trình hướng đối tượng và design patterns"
                ]
            }
        ],
        softSkills: [
            {
                name: "Độc lập",
                required: true,
                requiredCount: 1,
                foundCount: 0,
                status: "missing",
                jobDescriptionMentions: [
                    "Có khả năng làm việc độc lập và theo nhóm"
                ]
            },
            {
                name: "Làm việc nhóm",
                required: true,
                requiredCount: 1,
                foundCount: 0,
                status: "missing",
                jobDescriptionMentions: [
                    "Kết hợp với các bộ phận như Artist, Product Owner để sản xuất các game mobile chất lượng",
                    "Có khả năng làm việc độc lập và theo nhóm"
                ]
            }
        ]
    },
    format: {
        issues: 4,
        suggestions: [
            "Consider using a more modern resume template",
            "Ensure consistent font sizes throughout the document",
            "Add more white space for better readability",
            "Use bullet points consistently across all sections"
        ]
    },
    sections: {
        missing: ["Portfolio/Projects showcase", "Certifications"],
        present: ["Education", "Experience", "Skills", "Contact"]
    }
};

// Alternative mock data for different job role
export const mockEvaluationData2 = {
    jobInfo: {
        title: "Backend Engineer / Google",
        company: "Google Inc."
    },
    overview: {
        matchScore: 92,
        totalIssues: 10,
        summary: "Excellent match! Your resume demonstrates strong backend technologies expertise including Node.js, AWS, and SQL/NoSQL databases.",
        detailedSummary: "Your resume shows extensive experience working with AWS and building scalable microservices architecture. Strong programming skills in backend technologies such as Node.js, AWS, and SQL/NoSQL databases. Excellent track record of system design and API development.",
        categories: {
            content: {
                name: "Content",
                score: 95,
                issues: 3
            },
            skills: {
                name: "Skills",
                score: 90,
                issues: 4
            },
            format: {
                name: "Format",
                score: 88,
                issues: 4
            },
            sections: {
                name: "Sections",
                score: 95,
                issues: 1
            },
            style: {
                name: "Style",
                score: 85,
                issues: 4
            }
        },
        highlights: [
            "Extensive experience with backend technologies such as Node.js, AWS, and databases",
            "Strong programming skills including C# used in backend development",
            "Extensive experience working with AWS and building scalable microservices architecture"
        ],
        improvements: [
            "Add measurable results such as system uptime improvements or performance metrics to demonstrate the impact of your work",
            "Provide more context on collaboration with cross-functional teams, especially with frontend developers or product managers",
            "Address system design experience for large-scale distributed systems"
        ]
    },
    content: {
        measurableResults: {
            issues: 3,
            description: "Add specific, measurable achievements to highlight the impact of your work.",
            suggestions: [
                "Add measurable results such as system uptime improvements (e.g., '99.99% uptime') or performance metrics",
                "Include specific metrics like 'Reduced API response time by 40%' or 'Handled 10M+ daily requests'",
                "Quantify infrastructure improvements and cost savings achieved"
            ]
        },
        spellingGrammar: {
            issues: 0,
            description: "Your resume is free from spelling and grammar errors.",
            suggestions: []
        }
    },
    skills: {
        hardSkills: [
            {
                name: "Node.js",
                required: true,
                requiredCount: 5,
                foundCount: 5,
                status: "found",
                jobDescriptionMentions: [
                    "Strong proficiency in Node.js and Express framework",
                    "3+ years of backend development experience with Node.js"
                ]
            },
            {
                name: "AWS",
                required: true,
                requiredCount: 4,
                foundCount: 4,
                status: "found",
                jobDescriptionMentions: [
                    "Experience with AWS services (EC2, S3, Lambda, RDS)",
                    "Cloud infrastructure management using AWS"
                ]
            },
            {
                name: "SQL/NoSQL",
                required: true,
                requiredCount: 3,
                foundCount: 3,
                status: "found",
                jobDescriptionMentions: [
                    "Strong understanding of SQL and NoSQL databases",
                    "Experience with PostgreSQL, MongoDB, or similar"
                ]
            },
            {
                name: "Microservices",
                required: true,
                requiredCount: 2,
                foundCount: 2,
                status: "found",
                jobDescriptionMentions: [
                    "Design and implement microservices architecture",
                    "Experience with containerization (Docker, Kubernetes)"
                ]
            },
            {
                name: "GraphQL",
                required: false,
                requiredCount: 1,
                foundCount: 0,
                status: "missing",
                jobDescriptionMentions: [
                    "Experience with GraphQL is a plus"
                ]
            }
        ],
        softSkills: [
            {
                name: "Team Collaboration",
                required: true,
                requiredCount: 2,
                foundCount: 2,
                status: "found",
                jobDescriptionMentions: [
                    "Work closely with frontend developers and product managers",
                    "Collaborate with cross-functional teams"
                ]
            },
            {
                name: "Problem Solving",
                required: true,
                requiredCount: 1,
                foundCount: 1,
                status: "found",
                jobDescriptionMentions: [
                    "Strong analytical and problem-solving skills"
                ]
            }
        ]
    },
    format: {
        issues: 4,
        suggestions: [
            "Consider adding links to GitHub or portfolio",
            "Ensure consistent date formatting",
            "Use action verbs at the start of bullet points",
            "Keep resume to 2 pages maximum"
        ]
    },
    sections: {
        missing: ["Open Source Contributions"],
        present: ["Education", "Experience", "Skills", "Projects", "Certifications"]
    }
};
