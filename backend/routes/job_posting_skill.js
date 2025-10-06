const express = require("express");
const router = express.Router();
const controllerJobPostingSklill = require("../controllers/job_posting_skill");

router.get(
  "/listAccountAccountType",
  controllerJobPostingSklill.listJobPostingSklill
);
router.get(
  "/listJobPostingSklillId/:id",
  controllerJobPostingSklill.listJobPostingSklillId
);
module.exports = router;
