const express = require("express");
const router = express.Router();
const controllerJobsApplication = require("../controllers/jobApplicaton");

router.get("/listApplication", controllerJobsApplication.listApplication);

router.get(
  "/listApplicationId/:id",
  controllerJobsApplication.listApplicationId
);
router.post("/addApplication", controllerJobsApplication.addApplication);

router.patch(
  "/unlockApplication/:id",
  controllerJobsApplication.acceptApplication
);
router.patch(
  "/updateApplicationStatus/:id",
  controllerJobsApplication.updateApplicationStatus
);

router.delete(
  "/deleteApplication/:id",
  controllerJobsApplication.deleteApplication
);

// thêm hàm mới : Backend: thêm endpoint upload-file-cho-đơn (không đụng bảng cv)
router.post(
  "/addApplicationFile",
  controllerJobsApplication.addApplicationFile
);

// 📍 Kiểm tra user đã ứng tuyển job này chưa
router.get(
  "/checkApplied/:job_posting_id/:account_id",
  controllerJobsApplication.checkApplied
);

// 📊 Thống kê hồ sơ ứng tuyển theo công ty
router.get(
  "/statistics/:companyId",
  controllerJobsApplication.getApplicationStatistics
);

// 📈 Thống kê kết quả ứng tuyển theo công ty
router.get(
  "/results/:companyId",
  controllerJobsApplication.getApplicationResults
);

// 👥 Lấy danh sách ứng viên theo job_posting_id (kèm điểm AI)
router.get(
  "/candidates/:job_posting_id",
  controllerJobsApplication.getCandidatesByJobPosting
);

module.exports = router;
