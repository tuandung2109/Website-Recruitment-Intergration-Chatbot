const express = require("express");
const router = express.Router();
const controllerIndustry = require("../controllers/industry");

router.get("/listIndustry", controllerIndustry.listIndustry);
router.get("/listIndustryId/:id", controllerIndustry.listIndustryId);
router.post("/postIndustry", controllerIndustry.postIndustry);
router.patch("/unlockIndustry/:id", controllerIndustry.unlockIndustry);
router.patch("/updateIndustry/:id", controllerIndustry.updateIndustry);
router.delete("/deleteIndustry/:id", controllerIndustry.deleteIndustry);
module.exports = router;
