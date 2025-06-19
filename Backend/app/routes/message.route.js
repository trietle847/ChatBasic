const express = require("express");
const messageController = require("../controllers/message.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../config/upload_supabase");
const router = express.Router();

router
  .route("/")
  .post(authMiddleware,upload.single("file"),messageController.sendMessage)
router.route("/get")
  .post(messageController.getMessages);

module.exports = router;
