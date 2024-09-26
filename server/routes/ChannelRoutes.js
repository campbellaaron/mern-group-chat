const express = require("express");
const { createChannel, getAllChannels, getChannelMessages } = require("../controllers/ChannelController");
const { verifyToken } = require("../middlewares/AuthMiddleware.js");


const channelRoutes = express.Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-all-channels", verifyToken, getAllChannels);
channelRoutes.get("/get-channel-messages/:channelId", verifyToken, getChannelMessages);

module.exports = channelRoutes;