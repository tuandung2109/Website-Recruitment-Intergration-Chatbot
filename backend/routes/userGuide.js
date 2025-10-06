const express = require("express");
const router = express.Router();
const controllerUserGuide = require("../controllers/user_guide");

router.get("/listUserGuide", controllerUserGuide.listUserGuide);
router.get("/listUserGuideId/:id", controllerUserGuide.listUserGuideId);
module.exports = router;
