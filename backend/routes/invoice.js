const express = require("express");
const router = express.Router();
const controllerInvoice = require("../controllers/invoice");

router.get("/listInvoice", controllerInvoice.listInvoice);
router.get("/listInvoiceId/:id", controllerInvoice.listInvoiceId);

// router.post("/postInvoice", controllerInvoice.postInvoice);
// router.patch("/unlockInvoice/:id", controllerInvoice.unlockInvoice);
// router.patch("/updateInvoice/:id", controllerInvoice.updateInvoice);
// router.delete("/deleteInvoice/:id", controllerInvoice.deleteInvoice);

module.exports = router;
