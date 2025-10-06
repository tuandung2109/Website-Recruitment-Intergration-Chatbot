const express = require("express");
const router = express.Router();
const controllerMessage = require("../controllers/message");

router.get("/listMessage", controllerMessage.listMessage);
router.get("/listMessageId/:id", controllerMessage.listMessageId);

// router.post("/postMessage", controllerMessage.postMessage);
// router.patch("/unlockMessage/:id", controllerMessage.unlockMessage);
// router.patch("/updateMessage/:id", controllerMessage.updateMessage);
// router.delete("/deleteMessage/:id", controllerMessage.deleteMessage);
module.exports = router;
