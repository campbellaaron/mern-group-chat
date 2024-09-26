const express = require("express");
const { getMessages, uploadFile } = require("../controllers/MessagesController.js");
const { verifyToken } = require("../middlewares/AuthMiddleware.js");
const multer = require("multer");

const messagesRoutes = express.Router();
const upload = multer({dest:"uploads/files"});

messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post("/upload-file", verifyToken, upload.single("file"), uploadFile);

module.exports = messagesRoutes;