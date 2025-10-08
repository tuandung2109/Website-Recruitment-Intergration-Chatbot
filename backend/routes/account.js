const express = require("express");
const router = express.Router();
const controllerUsers = require("../controllers/account");

router.get("/listAccount", controllerUsers.listAccount); //Lấy danh sách tài khoản
router.get("/listAccountId/:id", controllerUsers.listAccountId); //Chi tiết 1 tài khoản
router.post("/postRegister", controllerUsers.postRegister); //Đăng ký
router.post("/postLogin", controllerUsers.postLogin); //Đăng nhập
router.delete("/deleteLogin/:id", controllerUsers.hardDeleteAccount); // Xóa cứng
router.patch("/hardDeleteLogin/:id", controllerUsers.softDeleteAccount); // Xóa mềm
router.patch("/unlockDeleteLogin/:id", controllerUsers.unlockDeleteAccount); // bỏ khóa
router.post("/forgot", controllerUsers.userForgot); //Quên mật khẩu
router.post("/otp", controllerUsers.userOtp); //Xác nhận OTP
router.post("/resetPassword", controllerUsers.userResetPassword); //Đặt lại mật khẩu

module.exports = router;
