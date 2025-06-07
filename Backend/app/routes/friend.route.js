const express = require("express");
const friendController = require("../controllers/friend.controller")
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router(); 

router.route("/request")
    .post(authMiddleware, friendController.sendRequest)

router.route("/accept")
    .put(authMiddleware,friendController.acceptRequest);

router.route("/reject")
    .delete(authMiddleware, friendController.rejectRequest)

router.route("/myFriend")
    .get(authMiddleware,friendController.getFriendList)

router.route("/requestAddFriend")
    .get(authMiddleware, friendController.getRequestAddFriend)

module.exports = router