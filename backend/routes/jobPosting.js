const express = require("express");
const router = express.Router();
const controllerJobsPostings = require("../controllers/jobPosting");

router.get("/listJobPosting", controllerJobsPostings.listJobPostings); //Lấy danh sách bài đăng
router.get("/listJobPostingAdmin", controllerJobsPostings.listJobPostingsAdmin); //Lấy danh sách bài đăng
router.get("/:id", controllerJobsPostings.listJobPostingId); // Chi tiết công việc

router.get(
  "/listJobPostingDeleted",
  controllerJobsPostings.listJobPostingsDeleted
);
router.post("/postJobPosting", controllerJobsPostings.postJobPosting); //Đăng bài
router.patch("/softJobPosting/:id", controllerJobsPostings.softJobPosting); //Xóa bài đăng
router.patch("/unlockJobPosting/:id", controllerJobsPostings.unlockJobPosting); //Cập nhật bài đăng

router.get("/byCompany/:companyId", controllerJobsPostings.listJobsByCompany); // Lấy danh sách job theo công ty

module.exports = router;
