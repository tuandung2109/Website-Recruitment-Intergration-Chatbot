const express = require("express");
const router = express.Router();
const controllerWordType = require("../controllers/work_type");

router.get("/listAccountWordType", controllerWordType.listAccountWordType);
router.get(
  "/listAccountWordTypeId/:id",
  controllerWordType.listAccountWordTypeId
);
module.exports = router;
