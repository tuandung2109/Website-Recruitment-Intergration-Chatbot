const express = require("express");
const router = express.Router();
const controllerJobPostingIndustry = require("../controllers/job_posting_industry");

router.get(
  "/listJobPostingIndustry",
  controllerJobPostingIndustry.listJobPostingIndustry
);
router.get(
  "/listJobPostingIndustryId/:id",
  controllerJobPostingIndustry.listJobPostingIndustryId
);
module.exports = router;
