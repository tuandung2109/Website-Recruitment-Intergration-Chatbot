const express = require("express");
const router = express.Router();
const controller = require("../controllers/address");

router.get("/listAddress", controller.listAddress);
router.get("/listAddressByCompany/:companyId", controller.listAddressByCompany);
router.post("/postAddress", controller.postAddress);

module.exports = router;
