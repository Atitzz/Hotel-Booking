const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models/index");
require("dotenv").config();
const config = process.env;

const formRegister = async (req, res) => {
  try {
    const message = req.flash("error");
    res.render("users/register", { message });
  } catch (error) {
    console.log(error);
  }
};

const register = async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body;

    const existingUser = await db.User.findOne({ where: { email: email } });
    if (existingUser) {
      req.flash("error", "คุณสมัครสมาชิกไว้แล้ว");
      return res.redirect("/users/register");
    } else if (password !== confirmPassword) {
      req.flash("error", "รหัสผ่านไม่ตรงกัน");
      return res.redirect("/users/register");
    } else {
      const usernameIsValid = /^[a-zA-Z0-9]+$/.test(username);
      const passwordIsValid = /^[a-zA-Z0-9]+$/.test(password);

      if (!usernameIsValid) {
        req.flash(
          "error",
          "ชื่อผู้ใช้ต้องมีตัวอักษร a-z และ 0-9 เท่านั้น โดยห้ามมีช่องว่าง"
        );
        return res.redirect("/users/register");
      }
      if (!passwordIsValid) {
        req.flash(
          "error",
          "รหัสผ่านต้องมีตัวอักษร a-z และ 0-9 เท่านั้น โดยห้ามมีช่องว่าง"
        );
        return res.redirect("/users/register");
      }

      const hash = await bcrypt.hash(password, 10);
      const newUser = await db.User.create({
        username,
        email,
        password: hash,
      });
      res.redirect("/users/login");
    }
  } catch (error) {
    console.log(error);
  }
};

const formLogin = async (req, res) => {
  try {
    const message = req.flash("error");
    res.render("users/login", { message });
  } catch (error) {
    console.log(error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email: email } });
    if (!user) {
      req.flash("error", "ไม่มีชื่อนี้อยู่ในระบบ");
      return res.redirect("/users/login");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "รหัสผ่านไม่ถูกต้อง");
      return res.redirect("/users/login");
    }
    let payload = {
      user: {
        // user: user,
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
    const token = jwt.sign(payload, config.TOKEN, { expiresIn: "1h" });
    res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });
    res.cookie("user", user.username, { httpOnly: true, maxAge: 3600000 });
    res.cookie("type", user.role, { httpOnly: true, maxAge: 3600000 });
    req.flash("success", user.username, "เข้าสู่ระบบเรียบร้อยแล้ว");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.clearCookie("user");
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { formRegister, register, formLogin, login, logout };
