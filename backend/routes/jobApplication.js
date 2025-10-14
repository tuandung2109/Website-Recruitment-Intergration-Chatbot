const express = require("express");
const router = express.Router();
const controllerJobsApplication = require("../controllers/jobApplicaton");

router.get("/listApplication", controllerJobsApplication.listApplication);

router.get(
  "/listApplicationId/:id",
  controllerJobsApplication.listApplicationId
);
router.post("/addApplication", controllerJobsApplication.addApplication);

router.patch(
  "/unlockApplication/:id",
  controllerJobsApplication.acceptApplication
);
router.patch(
  "/updateApplicationStatus/:id",
  controllerJobsApplication.updateApplicationStatus
);

router.delete(
  "/deleteApplication/:id",
  controllerJobsApplication.deleteApplication
);

module.exports = router;
