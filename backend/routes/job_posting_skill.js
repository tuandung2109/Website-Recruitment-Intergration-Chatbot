const express = require("express");
const router = express.Router();
const controllerJobPostingSkill = require("../controllers/job_posting_skill");

router.get(
  "/listJobPostingSkill",
  controllerJobPostingSkill.listJobPostingSkill
);
router.get(
  "/listJobPostingSkillId/:id",
  controllerJobPostingSkill.listJobPostingSkillId
);
module.exports = router;
