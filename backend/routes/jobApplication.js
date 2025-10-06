const express = require("express");
const router = express.Router();
const controllerJobsApplication = require("../controllers/jobApplicaton");

router.get("/listApplication", controllerJobsApplication.listApplication);

router.post("/addApplication", controllerJobsApplication.addApplication);

router.get(
  "/listApplicationId/:id",
  controllerJobsApplication.listApplicationId
);
router.patch(
  "/unlockApplication/:id",
  controllerJobsApplication.unlockApplication
);
router.patch(
  "/updateApplication/:id",
  controllerJobsApplication.updateApplication
);
router.delete(
  "/deleteApplication/:id",
  controllerJobsApplication.deleteApplication
);

module.exports = router;
