const express = require("express");
const router = express.Router();
const controllerIndustry = require("../controllers/industry");

router.get("/listIndustry", controllerIndustry.listIndustry);
router.get("/listIndustryId/:id", controllerIndustry.listIndustryId);
module.exports = router;
