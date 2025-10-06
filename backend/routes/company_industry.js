const express = require("express");
const router = express.Router();
const controllerCompanyIndustry = require("../controllers/company_industry");

router.get(
  "/listCompanyIndustry",
  controllerCompanyIndustry.listCompanyIndustry
);
router.get(
  "/listCompanyIndustryId/:id",
  controllerCompanyIndustry.listCompanyIndustryId
);
module.exports = router;
