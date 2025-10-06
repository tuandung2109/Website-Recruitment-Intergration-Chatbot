const express = require("express");
const router = express.Router();
const controllerInvoice = require("../controllers/invoice");

router.get("/listInvoice", controllerInvoice.listInvoice);
router.get("/listInvoiceId/:id", controllerInvoice.listInvoiceId);
module.exports = router;
