const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statistics");

// Route thống kê tổng quan
router.get("/overview", statisticsController.getStatisticsOverview);

// Route thống kê tài khoản
router.get("/accounts", statisticsController.getStatisticsAccounts);

module.exports = router;
