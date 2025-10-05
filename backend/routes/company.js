const express = require("express");
const router = express.Router();
const controllerCompany = require("../controllers/company.js");

router.get("/listCompany", controllerCompany.listCompany);

module.exports = router;
