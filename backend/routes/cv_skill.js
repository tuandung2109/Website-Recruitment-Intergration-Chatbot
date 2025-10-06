const express = require("express");
const router = express.Router();
const controllerCvSkill = require("../controllers/cv_skill");

router.get("/listAccountCvSkill", controllerCvSkill.listAccountCvSkill);
router.get("/listAccountCvSkillId/:id", controllerCvSkill.listAccountCvSkillId);
module.exports = router;
