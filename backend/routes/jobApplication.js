const express = require("express");
const router = express.Router();
const controllerJobsApplication = require("../controllers/jobApplicaton");

router.get("/listApplication", controllerJobsApplication.listApplication);
router.post("/addApplication", controllerJobsApplication.addApplication);

module.exports = router;
