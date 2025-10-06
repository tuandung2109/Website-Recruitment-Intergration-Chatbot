const express = require("express");
const router = express.Router();
const controllerJobsApplication = require("../controllers/jobApplicaton");

router.get("/listApplication", controllerJobsApplication.listApplication);
router.get(
  "/listApplicationId/:id",
  controllerJobsApplication.listApplicationId
);
module.exports = router;
