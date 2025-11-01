// src/data/jobsData.js

export const filterCategories = {
  workType: {
    name: "Loại công việc",
    options: ["Full-time", "Part-time", "Remote", "Freelance"]
  },
  salary: {
    name: "Mức lương",
    options: [
      { label: "Dưới 5 triệu", min: 0, max: 5000000 },
      { label: "5-10 triệu", min: 5000000, max: 10000000 }, 
      { label: "10-15 triệu", min: 10000000, max: 15000000 },
      { label: "15-20 triệu", min: 15000000, max: 20000000 },
      { label: "20-30 triệu", min: 20000000, max: 30000000 },
      { label: "30+ triệu", min: 30000000, max: 100000000 }
    ]
  },
  experience: {
    name: "Kinh nghiệm",
    options: ["Không yêu cầu", "1-2 năm", "2-5 năm", "5+ năm"]
  },
  industry: {
    name: "Ngành nghề",
    options: ["IT - Phần mềm", "Marketing", "Kế toán", "Giáo dục", "Y tế"]
  }
};