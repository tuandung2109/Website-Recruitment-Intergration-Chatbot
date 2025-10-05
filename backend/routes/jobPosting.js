const express = require("express");
const router = express.Router();
const controllerJobsPostings = require("../controllers/jobPosting");

router.get("/listJobPosting", controllerJobsPostings.listJobPostings); //Lấy danh sách bài đăng
router.get(
  "/listJobPostingDeleted",
  controllerJobsPostings.listJobPostingsDeleted
); //Lấy danh sách bài đăng
router.get("/listJobPostingId/:id", controllerJobsPostings.listJobPostingId); // Chi tiết công việc
router.post("/postJobPosting", controllerJobsPostings.postJobPosting); //Đăng bài
router.post("/deleteJobPosting/:id", controllerJobsPostings.deleteJobPosting); //Xóa bài đăng
router.patch("/updateJobPosting/:id", controllerJobsPostings.updateJobPosting); //Cập nhật bài đăng
module.exports = router;
