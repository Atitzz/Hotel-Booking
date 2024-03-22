const express = require("express");
const router = express.Router();
const controller = require("../controller/user");
const auth = require("../middleware/auth");
const checkAccessToPage = require("../middleware/checkUser");

router.get("/", auth, checkAccessToPage, (req, res) => res.send("Hello World !"));

router.get("/register", checkAccessToPage, controller.formRegister);
router.post("/register", checkAccessToPage, controller.register);
router.get("/login", checkAccessToPage, controller.formLogin);
router.post("/login", checkAccessToPage, controller.login);
router.get("/logout", auth, controller.logout);

module.exports = router;
