const express = require("express");
const router = express.Router();

const controllersEmail = require("../controllers/emailController");

router.post("/send", controllersEmail.sendEmail);

module.exports = router;
