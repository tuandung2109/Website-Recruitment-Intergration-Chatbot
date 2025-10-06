const express = require("express");
const router = express.Router();
const controllerCompany = require("../controllers/company.js");

router.get("/listCompany", controllerCompany.listCompany);
router.get("/listCompany/:id", controllerCompany.listCompanyId);
// router.post("/postCompany", controllerCompany.postCompany);
router.patch("/updateCompany/:id", controllerCompany.updateCompany);
router.patch("/unlockCompany/:id", controllerCompany.unlockCompany);
router.patch("/lockCompany/:id", controllerCompany.lockCompany);
router.delete("/deleteCompany/:id", controllerCompany.deleteCompany);

module.exports = router;
