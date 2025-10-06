const express = require("express");
const router = express.Router();
const controllerJobsApplication = require("../controllers/jobApplicaton");

router.get("/listApplication", controllerJobsApplication.listApplication);
// router.get(
//   "/listApplicationId/:id",
//   controllerJobsApplication.listApplicationId
// );
router.post("/addApplication", controllerJobsApplication.addApplication);

module.exports = router;



