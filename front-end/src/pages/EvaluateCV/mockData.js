// Mock data updated to follow AI evaluation payload structure
export const mockEvaluationData = {
    job_title: "AI Engineer (Healthcare AI)",
    skill: 5,
    education: 7,
    position: 4,
    experiences: 4,
    general: 8,
    weak: "Limited professional work experience (mostly internships and academic projects), Short internship durations may indicate lack of deep industry ",
    strong: "Diverse technical skill set spanning AI/ML, blockchain, and full-stack development",
    interview_question: "Can you explain the difference between TF-IDF and word embeddings in NLP?, How did you achieve 98% accuracy in your lung cancer classification model? What validation techniques did you use?, What challenges did you face when integrating ML.NET with Blazor for real-time sentiment prediction?, Can you walk us through the process of deploying a smart contract on Ethereum testnet?, How do you plan to specialize in AI/ML while having experience in blockchain and game development?, What specific role do you see yourself playing in an AI team in the next 2-3 years?",
    detail_analysis: "Candidate shows strong academic foundation and diverse technical interests across AI, blockchain, and web development. The GPA of 3.0 with scholarships indicates consistent performance., Project portfolio demonstrates practical application of ML in both NLP (sentiment analysis) and computer vision (medical imaging), with impressive reported accuracy of 98% in lung cancer classification., Experience spans multiple domains (healthcare AI, blockchain, game development, advertising), which shows adaptability but may raise questions about career focus and long-term specialization goals., Technical skills are up-to-date with industry trends, including LLMs, Web3, and modern ML frameworks. However, depth in each area may vary given the broad scope., Internship timeline shows overlapping or immediately consecutive roles (Feb 2025–Jul 2025), suggesting strong initiative but potentially limited depth in each position., The candidate's goal to become an 'AI Engineer' is clear, but the path could benefit from more focused experience in production-level ML systems and collaboration frameworks.",
    created_at: "2025-11-16T04:49:36.702781Z",
    skill_matches: [
        {
            name: "AI/ML Fundamentals",
            status: "match",
            matchScore: 88,
            jobRequirement: "Vận dụng thành thạo các mô hình học máy cổ điển và deep learning cho dữ liệu NLP và hình ảnh.",
            evidence: "Đạt 98% accuracy cho dự án phân loại ung thư phổi, triển khai sentiment analysis real-time bằng ML.NET.",
            recommendation: "Tiếp tục đào sâu vào quy trình MLOps và tiêu chuẩn hóa cách báo cáo độ chính xác (precision/recall)."
        },
        {
            name: "Triển khai sản phẩm",
            status: "partial",
            matchScore: 60,
            jobRequirement: "Kinh nghiệm đưa mô hình ML vào sản phẩm thực tế với pipeline kiểm thử rõ ràng.",
            evidence: "Đã tích hợp ML.NET với Blazor và TensorFlow vào web app, nhưng chủ yếu ở quy mô demo.",
            recommendation: "Bổ sung minh chứng về monitoring, logging và tối ưu hiệu năng trong môi trường production."
        },
        {
            name: "Blockchain & Smart Contract",
            status: "match",
            matchScore: 80,
            jobRequirement: "Hiểu quy trình triển khai smart contract trên Ethereum testnet và bảo mật cơ bản.",
            evidence: "Xây dựng DApp, triển khai hợp đồng thông minh và tích hợp ví vào ứng dụng web.",
            recommendation: "Làm rõ hơn mối liên hệ giữa kinh nghiệm Web3 và mục tiêu AI/ML để tránh cảm giác thiếu tập trung."
        },
        {
            name: "Chuyên sâu ngành y",
            status: "gap",
            matchScore: 35,
            jobRequirement: "Hiểu quy định dữ liệu y tế và quy trình kiểm chứng mô hình AI trong healthcare.",
            evidence: "Mới dừng ở mức nghiên cứu học thuật, chưa có dự án production với bệnh viện/đối tác y tế.",
            recommendation: "Tham gia thêm dự án lâm sàng hoặc hợp tác nghiên cứu để tăng độ tin cậy trong lĩnh vực healthcare AI."
        }
    ]
};

export const mockEvaluationData2 = {
    job_title: "Senior Backend Engineer (Fintech)",
    skill: 8,
    education: 9,
    position: 8,
    experiences: 7,
    general: 8,
    weak: "Ít đề cập đến kinh nghiệm tối ưu chi phí cloud, Chưa mô tả rõ vai trò lãnh đạo kỹ thuật trong các squad nhỏ",
    strong: "Dẫn dắt nhóm backend xây dựng nền tảng thanh toán 50K TPS, Chuyên sâu Node.js, Go, và kiến trúc microservices, Hiểu biết sâu về chuẩn bảo mật PCI-DSS và mã hóa dữ liệu",
    interview_question: "Bạn thiết kế hệ thống thanh toán chịu 10K TPS như thế nào?, Khi gặp sự cố database replication lag bạn sẽ xử lý ra sao?, Bạn đảm bảo tuân thủ PCI-DSS trong kiến trúc microservices như thế nào?",
    detail_analysis: "Ứng viên có 6+ năm xây dựng hệ thống giao dịch thời gian thực cho lĩnh vực fintech. Điểm nổi bật là kinh nghiệm tách monolith sang microservices trên AWS và dẫn dắt nhóm SRE phối hợp incident response. Tuy nhiên chưa thể hiện rõ chiến lược tối ưu chi phí cloud dài hạn và mentorship cho thành viên mới.",
    created_at: "2025-09-02T13:22:11.000Z",
    skill_matches: [
        {
            name: "Microservices & Event-Driven",
            status: "match",
            matchScore: 92,
            jobRequirement: "Thiết kế hệ thống thanh toán event-driven, tách biệt domain rõ ràng.",
            evidence: "Từng refactor hệ thống payment gateway sang Kafka + gRPC, giảm độ trễ 35%.",
            recommendation: "Tiếp tục duy trì tài liệu kiến trúc để hỗ trợ onboarding."
        },
        {
            name: "Cloud Cost Optimization",
            status: "partial",
            matchScore: 58,
            jobRequirement: "Lập kế hoạch tối ưu chi phí AWS theo quý cho sản phẩm tăng trưởng nhanh.",
            evidence: "Đề cập auto-scaling và spot instances nhưng thiếu số liệu tiết kiệm cụ thể.",
            recommendation: "Bổ sung case study tiết kiệm chi phí hoặc dashboard theo dõi ngân sách."
        },
        {
            name: "Bảo mật thanh toán",
            status: "match",
            matchScore: 85,
            jobRequirement: "Đảm bảo chuẩn PCI-DSS, mã hóa dữ liệu nhạy cảm và kiểm soát truy cập.",
            evidence: "Thiết kế module tokenization, triển khai Secrets Manager và IAM tách quyền.",
            recommendation: "Nêu rõ vai trò trong quy trình audit hàng năm để tăng độ tin cậy."
        }
    ]
};
