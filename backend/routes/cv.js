const express = require("express");
const router = express.Router();
const controllerCv = require("../controllers/cv");

router.get("/listCv", controllerCv.listCv);
router.get("/listCvId/:id", controllerCv.listCvId);

module.exports = router;
