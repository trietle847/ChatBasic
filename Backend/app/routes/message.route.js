const express = require("express");
const messageController = require("../controllers/message.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router
  .route("/")
  .post(authMiddleware,messageController.sendMessage)
router.route("/get")
  .post(messageController.getMessages);

module.exports = router;
