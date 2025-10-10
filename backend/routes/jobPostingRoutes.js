// routes/jobPostingRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/jobPostingController');

router.get('/jobs', controller.getJobs);
router.get('/jobs/:id', controller.getJobById);
router.get('/filters', controller.getFilters);

module.exports = router;


