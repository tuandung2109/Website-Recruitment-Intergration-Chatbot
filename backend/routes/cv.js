// backend/routes/cv.js
const express = require("express");
const router = express.Router();
const controllerCv = require("../controllers/cv");
const multer = require("multer");

// ❗ Dùng memoryStorage để lấy file.buffer upload thẳng lên Supabase
const upload = multer({ storage: multer.memoryStorage() });

// ========== CV APIs ==========
router.get("/listCv", controllerCv.listCv);
router.get("/listCvId/:id", controllerCv.listCvId);
router.get("/detail/:account_id", controllerCv.getCvWithSkills);
router.post("/updateSkills", controllerCv.updateCvSkills);
router.delete("/delete/:cv_id", controllerCv.deleteCv);

// ✅ Upload CV -> Supabase Storage
router.post("/upload", upload.single("file"), controllerCv.uploadCv);

module.exports = router;
