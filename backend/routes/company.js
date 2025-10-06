const express = require("express");
const router = express.Router();
const controllerCompany = require("../controllers/company.js");

router.get("/listCompany", controllerCompany.listCompany);
router.get("/listCompany/:id", controllerCompany.listCompanyId);

module.exports = router;
