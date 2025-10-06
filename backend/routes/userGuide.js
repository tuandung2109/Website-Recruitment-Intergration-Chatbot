const express = require("express");
const router = express.Router();
const controllerUserGuide = require("../controllers/user_guide");

router.get("/listUserGuide", controllerUserGuide.listUserGuide);
router.get("/listUserGuideId/:id", controllerUserGuide.listUserGuideId);

router.post("/postUserGuideId", controllerUserGuide.postUserGuideId);
router.patch("/unlockUserGuideId/:id", controllerUserGuide.unlockUserGuideId);
router.patch("/updateUserGuideId/:id", controllerUserGuide.updateUserGuideId);
router.delete("/deleteUserGuideId/:id", controllerUserGuide.deleteUserGuideId);
module.exports = router;
