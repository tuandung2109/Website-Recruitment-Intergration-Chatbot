const express = require("express");
const router = express.Router();
const controllerContactInfo = require("../controllers/contact_info");

router.get("/listAccountAccountType", controllerContactInfo.listContactInfo);
router.get("/listContactInfoId/:id", controllerContactInfo.listContactInfoId);
module.exports = router;
