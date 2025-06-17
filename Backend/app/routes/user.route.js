const express = require("express");
const user = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware")
const upload = require("../config/upload_cloudinary");

const router = express.Router();

router.route("/")
    .post(user.create)
    .put(authMiddleware,user.update)

router.route("/upload-avatar")
    .post(authMiddleware,upload.single("avatar"), user.uploadAvatar)   

router.route("/find/:id")
    .get(user.getUserById)

router.route("/search/phone")
    .post(user.searchUserByPhone);

router.route("/search/name")
    .post(user.searchUserByUsername);

router.route("/login").
    post(user.login);

router.route("/me")
    .get(authMiddleware,user.getMe)

module.exports = router;