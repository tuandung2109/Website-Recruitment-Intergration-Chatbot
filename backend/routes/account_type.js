const express = require("express");
const router = express.Router();
const controllerAccountType = require("../controllers/account_type");

router.get("/listAccountType", controllerAccountType.listAccountType);
router.get("/listAccountTypeId/:id", controllerAccountType.listAccountTypeId);
module.exports = router;
