const express = require("express");
const router = express.Router();
const controllerSkill = require("../controllers/skill");

router.get("/listSkill", controllerSkill.listSkill);
router.get("/listSkillId/:id", controllerSkill.listSkillId);

router.post("/postSkill", controllerSkill.postSkill);
router.patch("/unlockSkill/:id", controllerSkill.unlockSkill);
router.patch("/updateSkill/:id", controllerSkill.updateSkill);
router.delete("/deleteSkill/:id", controllerSkill.deleteSkill);
module.exports = router;
