const express = require("express");
const router = express.Router();
const controllerJobsPostings = require("../controllers/jobPosting");

router.get("/listJobPosting", controllerJobsPostings.listJobPostings); //Lấy danh sách bài đăng
router.get(
  "/listJobPostingsCompany",
  controllerJobsPostings.listJobPostingsCompany
); //Lấy danh sách bài đăng
router.get(
  "/listJobPostingsEmployer",
  controllerJobsPostings.listJobPostingsEmployer
); //Lấy danh sách bài đăng
router.get("/listJobPostingAdmin", controllerJobsPostings.listJobPostingsAdmin); //Lấy danh sách bài đăng
router.get("/listJobPostingId/:id", controllerJobsPostings.listJobPostingId); // Chi tiết công việc
router.get(
  "/listJobPostingDeleted",
  controllerJobsPostings.listJobPostingsDeleted
);
router.post("/postJobPosting", controllerJobsPostings.postJobPosting); //Đăng bài
router.patch("/softJobPosting/:id", controllerJobsPostings.softJobPosting); //Xóa bài đăng
router.patch("/unlockJobPosting/:id", controllerJobsPostings.unlockJobPosting); //Cập nhật bài đăng
router.patch("/updateJobPosting/:id", controllerJobsPostings.updateJobPosting); //Cập nhật bài đăng
router.patch("/offJobPosting/:id", controllerJobsPostings.offJobPosting); //Tắt  bài đăng
router.get("/byCompany/:companyId", controllerJobsPostings.listJobsByCompany); // Lấy danh sách job theo công ty
router.get(
  "/statistics/:companyId",
  controllerJobsPostings.getJobPostingStatistics
); // Thống kê số tin đã đăng
router.get(
  "/listUpdateJobPosting/:id",
  controllerJobsPostings.listUpdateJobPosting
); // Chi tiết công việc
// Nhà tuyển dụng gửi bản chỉnh sửa
router.patch("/submitUpdate/:id", controllerJobsPostings.submitJobUpdate);
// Admin duyệt chỉnh sửa
router.patch("/approveUpdate/:id", controllerJobsPostings.approveJobUpdate);
// Admin từ chối chỉnh sửa
router.patch("/rejectUpdate/:id", controllerJobsPostings.rejectJobUpdate);
// routes/jobPosting.js
router.get("/listPendingUpdates", controllerJobsPostings.listPendingJobUpdates);
// Xóa cứng job posting (hard delete)
router.delete("/deleteJobPosting/:id", controllerJobsPostings.deleteJobPosting);
module.exports = router;
