const express = require("express");
const router = express.Router();
const controllerCv = require("../controllers/cv");
const multer = require("multer"); // ✅ thêm dòng này
const path = require("path");     // ✅ thêm dòng này

// ⚙️ Cấu hình nơi lưu file
const storage = multer.diskStorage({ destination: (req, file, cb) => cb(null, "uploads/"), filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),});

const upload = multer({ storage });

router.get("/listCv", controllerCv.listCv);
router.get("/listCvId/:id", controllerCv.listCvId);


// router.post("/upload", controllerCv.uploadCv);
router.get("/detail/:account_id", controllerCv.getCvWithSkills);
router.post("/updateSkills", controllerCv.updateCvSkills);
router.delete("/delete/:cv_id", controllerCv.deleteCv);
router.post("/upload", upload.single("file"), controllerCv.uploadCv); // ✅ upload file thực


module.exports = router;
