const express = require("express");
const messageController = require("../controllers/message.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../config/upload_supabase");
const router = express.Router();

router
  .route("/upload/file")
  .post(authMiddleware, upload.single("file"), messageController.sendFileMessage);
 
router
  .route("/text")
  .post(authMiddleware, messageController.sendTextMessage);
  
router.route("/get")
  .post(messageController.getMessages);

router.route("/get/byId")
  .post(messageController.getMessagesByID);

module.exports = router;
