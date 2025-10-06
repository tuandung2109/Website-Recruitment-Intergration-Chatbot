const express = require("express");
const router = express.Router();
const controllerAccountAccountType = require("../controllers/account_account_type");

router.get(
  "/listAccountAccountType",
  controllerAccountAccountType.listAccountAccountType
);
router.get(
  "/listAccountAccountTypeId/:id",
  controllerAccountAccountType.listAccountAccountTypeId
);
module.exports = router;
// router.post(
//   "/postAccountAccountType",
//   controllerAccountAccountType.postAccountAccountType
// );
// router.patch(
//   "/unlockAccountAccountType/:id",
//   controllerAccountAccountType.unlockAccountAccountType
// );
// router.patch(
//   "/updateAccountAccountType/:id",
//   controllerAccountAccountType.updateAccountAccountType
// );
// router.delete(
//   "/deleteAccountAccountType/:id",
//   controllerAccountAccountType.deleteAccountAccountType
// );
