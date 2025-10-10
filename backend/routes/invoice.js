const express = require("express");
const router = express.Router();
const controllerInvoice = require("../controllers/invoice");

router.get("/listInvoice", controllerInvoice.listInvoice);
router.get("/listInvoiceId/:id", controllerInvoice.listInvoiceId);

router.get("/check-payment-vnpay", controllerInvoice.checkVnpays);
router.get("/getVnpay", controllerInvoice.getVnpay);
router.post("/create-qr", controllerInvoice.vnpays);
router.post("/updateUserMoneys", controllerInvoice.updateUserMoney);

module.exports = router;
