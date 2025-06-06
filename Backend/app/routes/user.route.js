const express = require("express");
const user = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware")

const router = express.Router();

router.route("/")
    .post(user.create)
    .put(authMiddleware,user.update)

router.route("/find/:id")
    .get(user.getUserById)

router.route("/login").
    post(user.login);

router.route("/me")
    .get(authMiddleware,user.getMe)

module.exports = router;