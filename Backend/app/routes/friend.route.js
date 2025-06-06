const express = require("express");
const friendController = require("../controllers/friend.controller")
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router(); 

router.route("/request")
    .post(authMiddleware, friendController.sendRequest)

router.route("/accept")
    .post(authMiddleware,friendController.acceptRequest);

router.route("/reject")
    .post(authMiddleware, friendController.rejectRequest)

router.route("/myFriend")
    .get(authMiddleware,friendController.getFriendList)

module.exports = router