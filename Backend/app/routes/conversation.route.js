const express = require("express");
const conversationController = require("../controllers/conversation.controller")
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router(); 

router.route("/")
    .post(authMiddleware,conversationController.createCoversation)
    .get(authMiddleware, conversationController.getUserConversation)

router.route("/get/group")
    .get(authMiddleware,conversationController.getGroupConversation)

router.route("/addMember")
    .put(conversationController.addMember)

router.route("/removeMember")
    .put(conversationController.removeMember);

router.route("/renameConver")
    .put(conversationController.renameConversation)

router.route("/delete")
    .delete(conversationController.deleteConversation)


module.exports = router