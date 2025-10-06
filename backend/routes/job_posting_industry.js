const express = require("express");
const router = express.Router();
const controllerAccountAccountType = require("../controllers/account_account_type");

router.get(
  "/listAccountAccountType",
  controllerAccountAccountType.listAccountAccountType
);
router.get(
  "/listAccountAccountTypeId/:id",
  controllerAccountAccountType.listAccountAccountTypeId
);
module.exports = router;
